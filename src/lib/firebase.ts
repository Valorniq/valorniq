import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendSignInLinkToEmail, signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged, User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { runtimeConfig, hasFirebaseConfig } from './runtimeConfig';
import type { User, Lead, Contact, Company, Invoice, Expense, AccountBalance, ActivityLog, AlertNotification, TenantConfig, Product, Customer, SalesOrder } from '../types';

export function getActiveFirebaseConfig() {
  if (!hasFirebaseConfig) return null;
  return runtimeConfig.firebase;
}

const currentConfig = getActiveFirebaseConfig();
export const isConfigured = !!currentConfig;

const safePlaceholderConfig = {
  apiKey: 'placeholder',
  authDomain: 'placeholder.firebaseapp.com',
  projectId: 'placeholder',
  storageBucket: 'placeholder',
  messagingSenderId: '000000000000',
  appId: 'placeholder'
};

const app = getApps().length > 0 ? getApp() : initializeApp(currentConfig || safePlaceholderConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (currentConfig as any)?.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

export function signOut() {
  return firebaseSignOut(auth);
}

export async function getCurrentUserProfile(): Promise<User | null> {
  const fb = auth.currentUser;
  if (!fb) return null;
  try {
    const snap = await getDoc(doc(db, 'team', fb.uid));
    if (snap.exists()) return snap.data() as User;
  } catch (e) {
    console.warn('Could not fetch user profile from Firestore:', e);
  }
  return {
    id: fb.uid,
    name: fb.displayName || fb.email?.split('@')[0] || 'User',
    email: fb.email || '',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just Now',
    device: 'MacBook Pro · Chrome',
    location: 'Cloud Session',
    mfaEnabled: false
  };
}

function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Authentication required.');
  return uid;
}

function ownedQuery(path: string) {
  return query(collection(db, path), where('ownerId', '==', requireUid()));
}

export function subscribeToCollection<T>(path: string, callback: (data: T[]) => void) {
  try {
    const q = ownedQuery(path);
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as T)));
    }, err => {
      console.warn(`Firestore subscription error on ${path}:`, err);
    });
  } catch (e) {
    console.warn(`Could not subscribe to ${path}:`, e);
    return () => {};
  }
}

export async function createDocument(path: string, data: Record<string, any>) {
  const uid = requireUid();
  const ref = await addDoc(collection(db, path), {
    ...data,
    ownerId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function updateDocument(path: string, id: string, data: Record<string, any>) {
  const uid = requireUid();
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().ownerId !== uid) {
    throw new Error('Record not found or access denied.');
  }
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function removeDocument(path: string, id: string) {
  const uid = requireUid();
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data().ownerId !== uid) {
    throw new Error('Record not found or access denied.');
  }
  await deleteDoc(ref);
}

export interface AccountData {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  invoices: Invoice[];
  expenses: Expense[];
  balances: AccountBalance;
  team: User[];
  securityLogs: ActivityLog[];
  alerts: AlertNotification[];
  tenantConfig: TenantConfig;
  products?: Product[];
  customers?: Customer[];
  sales?: SalesOrder[];
}

const collections = ['leads', 'contacts', 'companies', 'invoices', 'expenses', 'team', 'securityLogs', 'alerts', 'products', 'customers', 'sales'];
const scalarDoc = (uid: string) => doc(db, 'tenantSettings', uid);

export async function loadAccountData(_email: string): Promise<AccountData | null> {
  const uid = requireUid();
  const result: any = {};
  for (const name of collections) {
    try {
      const snap = await getDocs(ownedQuery(name));
      result[name] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn(`Failed loading ${name}:`, e);
      result[name] = [];
    }
  }
  try {
    const settings = await getDoc(scalarDoc(uid));
    if (settings.exists()) Object.assign(result, settings.data());
  } catch (e) {
    console.warn('Failed loading tenantSettings:', e);
  }

  if (!result.team?.length && !result.tenantConfig) return null;
  return { balances: { checking: 0, savings: 0, receivables: 0, payables: 0 }, ...result } as AccountData;
}

export async function saveAccountData(_email: string, data: AccountData): Promise<void> {
  const uid = requireUid();
  const batch = writeBatch(db);
  const arrays: Record<string, any[]> = {
    leads: data.leads || [],
    contacts: data.contacts || [],
    companies: data.companies || [],
    invoices: data.invoices || [],
    expenses: data.expenses || [],
    team: data.team || [],
    securityLogs: data.securityLogs || [],
    alerts: data.alerts || [],
    products: data.products || [],
    customers: data.customers || [],
    sales: data.sales || []
  };

  for (const [name, rows] of Object.entries(arrays)) {
    try {
      const existing = await getDocs(ownedQuery(name));
      const nextIds = new Set(rows.map(r => r.id));
      existing.docs.forEach(d => {
        if (!nextIds.has(d.id)) batch.delete(d.ref);
      });
      rows.forEach(row => {
        batch.set(doc(db, name, row.id), {
          ...row,
          ownerId: uid,
          updatedAt: serverTimestamp(),
          createdAt: row.createdAt || serverTimestamp()
        }, { merge: true });
      });
    } catch (e) {
      console.warn(`Batch prepare failed for ${name}:`, e);
    }
  }

  batch.set(scalarDoc(uid), {
    balances: data.balances,
    tenantConfig: data.tenantConfig,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await batch.commit();
}

export async function registerNewUser(email: string, password: string, name: string, companyName: string): Promise<User> {
  if (!isConfigured) {
    throw new Error('Firebase is not configured. Add a valid Firebase configuration before creating an account.');
  }
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const user: User = {
    id: credential.user.uid,
    name: name.trim(),
    email: credential.user.email || email.trim().toLowerCase(),
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just Now',
    device: 'Web Browser · TLS Verified',
    location: 'Cloud Region',
    mfaEnabled: false
  };
  await setDoc(doc(db, 'team', credential.user.uid), {
    ...user,
    ownerId: credential.user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await setDoc(scalarDoc(credential.user.uid), {
    tenantConfig: {
      name: companyName.trim(),
      domain: companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      primaryColor: '#6E56CF',
      mfaRequired: false,
      sessionTimeout: 30
    },
    balances: { checking: 100000, savings: 250000, receivables: 0, payables: 0 }
  });
  return user;
}

export async function authenticateUser(email: string, password: string): Promise<User> {
  if (!isConfigured) {
    throw new Error('Firebase is not configured. Add a valid Firebase configuration before signing in.');
  }
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const snap = await getDoc(doc(db, 'team', credential.user.uid));
  if (snap.exists()) return snap.data() as User;
  const user: User = {
    id: credential.user.uid,
    name: credential.user.displayName || credential.user.email?.split('@')[0] || 'User',
    email: credential.user.email || email,
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just Now',
    device: 'Web Browser · TLS Verified',
    location: 'Cloud Region',
    mfaEnabled: false
  };
  await setDoc(doc(db, 'team', credential.user.uid), { ...user, ownerId: credential.user.uid });
  return user;
}

export async function sendMagicLink(email: string) {
  if (!isConfigured) throw new Error('Firebase is not configured.');
  await sendSignInLinkToEmail(auth, email.trim().toLowerCase(), { url: window.location.origin, handleCodeInApp: true });
  localStorage.setItem('valorniq_magic_email', email.trim().toLowerCase());
}

export async function signInWithGoogle(): Promise<User> {
  if (!isConfigured) throw new Error('Firebase is not configured.');
  const credential = await signInWithPopup(auth, googleProvider);
  const fb = credential.user;
  const ref = doc(db, 'team', fb.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as User;
  const user: User = {
    id: fb.uid,
    name: fb.displayName || fb.email?.split('@')[0] || 'User',
    email: fb.email || '',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just Now',
    device: 'Web Browser · TLS Verified',
    location: 'Cloud Region',
    mfaEnabled: false
  };
  await setDoc(ref, { ...user, ownerId: fb.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  await setDoc(scalarDoc(fb.uid), {
    tenantConfig: {
      name: 'My Organization',
      domain: (fb.email?.split('@')[0] || 'workspace').replace(/[^a-z0-9]/gi, ''),
      primaryColor: '#6E56CF',
      mfaRequired: false,
      sessionTimeout: 30
    },
    balances: { checking: 100000, savings: 250000, receivables: 0, payables: 0 }
  }, { merge: true });
  return user;
}

export async function seedLiveFirebaseDatabase() {
  return;
}
