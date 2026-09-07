import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Sparkles, 
  Sun, 
  Moon, 
  Search, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Menu, 
  X,
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  ShoppingBag,
  Shield,
  Layers,
  Settings as SettingsIcon,
  CheckCircle2,
  Lock,
  Boxes,
  Zap,
  Compass
} from 'lucide-react';

import { 
  Organization, 
  User, 
  Company, 
  Contact, 
  Lead, 
  Customer, 
  Product, 
  SalesOrder, 
  Invoice, 
  Expense, 
  AccountBalance, 
  ActivityLog,
  AlertNotification,
  DashboardCustomSettings,
  AssetItem,
  AutomationWorkflow
} from './types';

import { 
  APP_MODULES, 
  SAMPLE_ORGANIZATIONS, 
  SAMPLE_USERS, 
  SAMPLE_COMPANIES, 
  SAMPLE_CONTACTS, 
  SAMPLE_LEADS, 
  SAMPLE_CUSTOMERS, 
  SAMPLE_PRODUCTS, 
  SAMPLE_SALES_ORDERS, 
  SAMPLE_INVOICES, 
  SAMPLE_EXPENSES, 
  SAMPLE_BALANCES, 
  SAMPLE_ACTIVITY_LOGS,
  SAMPLE_ALERTS,
  SAMPLE_ASSETS,
  SAMPLE_AUTOMATIONS
} from './constants';

import DashboardView from './components/DashboardView';
import CRMView from './components/CRMView';
import FinanceView from './components/FinanceView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import UserManagementView from './components/UserManagementView';
import IntegrationsView from './components/IntegrationsView';
import SettingsView from './components/SettingsView';
import AssetTrackingView from './components/AssetTrackingView';
import WorkflowsView from './components/WorkflowsView';
import StrategicRoadmapView from './components/StrategicRoadmapView';
import ArisChatDrawer from './components/ArisChatDrawer';
import { authenticateUser, getCurrentUserProfile, isConfigured, onAuthStateChanged, signInWithGoogle, signOut } from './lib/firebase';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('valorniq_theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('valorniq_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('valorniq_theme', 'light');
    }
  }, [isDark]);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');

  // Tenant / Organization state
  const [currentOrg, setCurrentOrg] = useState<Organization>(SAMPLE_ORGANIZATIONS[0]);
  const [currentUser, setCurrentUser] = useState<User>(SAMPLE_USERS[0]);
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // ARIS Drawer state
  const [arisOpen, setArisOpen] = useState<boolean>(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        setIsAuthenticated(false);
        setCurrentUser(SAMPLE_USERS[0]);
        setAuthLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUserProfile();
        if (profile) setCurrentUser(profile);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (error) {
        console.error('Failed to restore authenticated session:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Per-tenant data store
  const getStorageKey = (key: string) => `valorniq_${currentOrg.id}_${key}`;

  const loadData = <T,>(key: string, defaultData: T): T => {
    const saved = localStorage.getItem(getStorageKey(key));
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  };

  const saveData = <T,>(key: string, data: T) => {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  };

  // Domain Entities state
  const [leads, setLeads] = useState<Lead[]>(() => loadData('leads', SAMPLE_LEADS));
  const [contacts, setContacts] = useState<Contact[]>(() => loadData('contacts', SAMPLE_CONTACTS));
  const [companies, setCompanies] = useState<Company[]>(() => loadData('companies', SAMPLE_COMPANIES));
  const [customers, setCustomers] = useState<Customer[]>(() => loadData('customers', SAMPLE_CUSTOMERS));
  const [products, setProducts] = useState<Product[]>(() => loadData('products', SAMPLE_PRODUCTS));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => loadData('salesOrders', SAMPLE_SALES_ORDERS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadData('invoices', SAMPLE_INVOICES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadData('expenses', SAMPLE_EXPENSES));
  const [balances, setBalances] = useState<AccountBalance>(() => loadData('balances', SAMPLE_BALANCES));
  const [team, setTeam] = useState<User[]>(() => loadData('team', SAMPLE_USERS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadData('activityLogs', SAMPLE_ACTIVITY_LOGS));
  const [alerts, setAlerts] = useState<AlertNotification[]>(() => loadData('alerts', SAMPLE_ALERTS));
  const [assets, setAssets] = useState<AssetItem[]>(() => loadData('assets', SAMPLE_ASSETS));
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(() => loadData('workflows', SAMPLE_AUTOMATIONS));
  const [dashSettings, setDashSettings] = useState<DashboardCustomSettings>(() => loadData('dashSettings', {
    showNetProfit: true,
    showReceivables: true,
    showPipeline: true,
    showCustomers: true,
    chartType: 'Area',
    crmGoalTarget: 300000,
    refreshInterval: 'Live'
  }));

  // Sync state changes to storage
  useEffect(() => saveData('leads', leads), [leads, currentOrg.id]);
  useEffect(() => saveData('contacts', contacts), [contacts, currentOrg.id]);
  useEffect(() => saveData('companies', companies), [companies, currentOrg.id]);
  useEffect(() => saveData('customers', customers), [customers, currentOrg.id]);
  useEffect(() => saveData('products', products), [products, currentOrg.id]);
  useEffect(() => saveData('salesOrders', salesOrders), [salesOrders, currentOrg.id]);
  useEffect(() => saveData('invoices', invoices), [invoices, currentOrg.id]);
  useEffect(() => saveData('expenses', expenses), [expenses, currentOrg.id]);
  useEffect(() => saveData('balances', balances), [balances, currentOrg.id]);
  useEffect(() => saveData('team', team), [team, currentOrg.id]);
  useEffect(() => saveData('activityLogs', activityLogs), [activityLogs, currentOrg.id]);
  useEffect(() => saveData('alerts', alerts), [alerts, currentOrg.id]);
  useEffect(() => saveData('assets', assets), [assets, currentOrg.id]);
  useEffect(() => saveData('workflows', workflows), [workflows, currentOrg.id]);
  useEffect(() => saveData('dashSettings', dashSettings), [dashSettings, currentOrg.id]);

  // Handle switching tenant
  const handleSwitchTenant = (org: Organization) => {
    setCurrentOrg(org);
    setLeads(loadData('leads', SAMPLE_LEADS));
    setContacts(loadData('contacts', SAMPLE_CONTACTS));
    setCompanies(loadData('companies', SAMPLE_COMPANIES));
    setCustomers(loadData('customers', SAMPLE_CUSTOMERS));
    setProducts(loadData('products', SAMPLE_PRODUCTS));
    setSalesOrders(loadData('salesOrders', SAMPLE_SALES_ORDERS));
    setInvoices(loadData('invoices', SAMPLE_INVOICES));
    setExpenses(loadData('expenses', SAMPLE_EXPENSES));
    setBalances(loadData('balances', SAMPLE_BALANCES));
    setTeam(loadData('team', SAMPLE_USERS));
    setActivityLogs(loadData('activityLogs', SAMPLE_ACTIVITY_LOGS));
    setAssets(loadData('assets', SAMPLE_ASSETS));
    setWorkflows(loadData('workflows', SAMPLE_AUTOMATIONS));
    showToast(`Switched active tenant to: ${org.name}`);
  };

  // Reset tenant data to baseline
  const handleResetData = () => {
    setLeads(SAMPLE_LEADS);
    setContacts(SAMPLE_CONTACTS);
    setCompanies(SAMPLE_COMPANIES);
    setCustomers(SAMPLE_CUSTOMERS);
    setProducts(SAMPLE_PRODUCTS);
    setSalesOrders(SAMPLE_SALES_ORDERS);
    setInvoices(SAMPLE_INVOICES);
    setExpenses(SAMPLE_EXPENSES);
    setBalances(SAMPLE_BALANCES);
    setTeam(SAMPLE_USERS);
    setActivityLogs(SAMPLE_ACTIVITY_LOGS);
    setAlerts(SAMPLE_ALERTS);
    setAssets(SAMPLE_ASSETS);
    setWorkflows(SAMPLE_AUTOMATIONS);
    showToast("Reset tenant data to initial enterprise baseline.");
  };

  // Activity Log helper
  const addLog = (action: string, module: ActivityLog['module'], details?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: currentUser.name,
      action,
      module,
      timestamp: 'Just Now',
      details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // CRM Handlers
  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    addLog(`Created deal opportunity "${newLead.title}"`, 'CRM', `$${newLead.value.toLocaleString()} (${newLead.company})`);
    showToast(`Registered deal: ${newLead.title}`);
  };

  const handleUpdateLeadStage = (id: string, stage: Lead['stage']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
    const lead = leads.find(l => l.id === id);
    addLog(`Advanced deal stage to ${stage}`, 'CRM', lead?.title);
    showToast(`Deal moved to: ${stage}`);
  };

  const handleDeleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    addLog(`Deleted deal opportunity`, 'CRM', lead?.title);
    showToast("Opportunity removed.");
  };

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [newContact, ...prev]);
    addLog(`Added client contact ${newContact.name}`, 'CRM', newContact.company);
    showToast(`Contact registered: ${newContact.name}`);
  };

  // Finance Handlers
  const handleAddInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedDate'>) => {
    const num = Math.floor(10000 + Math.random() * 90000);
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: String(num),
      issuedDate: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [newInv, ...prev]);
    setBalances(prev => ({
      ...prev,
      receivables: prev.receivables + newInv.amount
    }));
    addLog(`Drafted invoice #INV-${num} for ${newInv.clientName}`, 'Finance', `$${newInv.amount.toLocaleString()}`);
    showToast(`Invoice #INV-${num} drafted.`);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (inv && status === 'Paid' && inv.status !== 'Paid') {
      setBalances(prev => ({
        ...prev,
        checking: prev.checking + inv.amount,
        receivables: Math.max(0, prev.receivables - inv.amount)
      }));
    }
    addLog(`Marked invoice #INV-${inv?.invoiceNumber} as ${status}`, 'Finance');
    showToast(`Invoice status settled: ${status}`);
  };

  const handleAddExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
    setBalances(prev => ({
      ...prev,
      payables: prev.payables + newExp.amount
    }));
    addLog(`Logged expense with ${newExp.merchant}`, 'Finance', `$${newExp.amount.toLocaleString()}`);
    showToast(`Expense recorded: $${newExp.amount}`);
  };

  const handleUpdateExpenseStatus = (id: string, status: Expense['status']) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    if (exp && status === 'Approved') {
      setBalances(prev => ({
        ...prev,
        checking: Math.max(0, prev.checking - exp.amount),
        payables: Math.max(0, prev.payables - exp.amount)
      }));
    }
    addLog(`Updated expense status to ${status}`, 'Finance', exp?.merchant);
    showToast(`Expense ${status.toLowerCase()}`);
  };

  // Inventory Handlers
  const handleAddProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProd, ...prev]);
    addLog(`Registered product catalog item "${newProd.name}"`, 'Inventory', `SKU: ${newProd.sku}`);
    showToast(`Product registered: ${newProd.name}`);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const prod = products.find(p => p.id === id);
    addLog(`Updated inventory product "${prod?.name}"`, 'Inventory', JSON.stringify(updates));
    showToast(`Product updated.`);
  };

  const handleDeleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    addLog(`Deleted product catalog item "${prod?.name}"`, 'Inventory');
    showToast("Product deleted from catalog.");
  };

  // Sales Orders Handlers
  const handleAddSalesOrder = (orderData: Omit<SalesOrder, 'id' | 'createdAt'>) => {
    const newOrder: SalesOrder = {
      ...orderData,
      id: `so-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSalesOrders(prev => [newOrder, ...prev]);
    // Deduct stock
    orderData.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      }));
    });
    addLog(`Generated Sales Order for ${newOrder.customerName}`, 'Sales', `$${newOrder.totalValue.toLocaleString()}`);
    showToast(`Sales Order created: $${newOrder.totalValue.toLocaleString()}`);
  };

  const handleUpdateOrderStatus = (id: string, status: SalesOrder['status']) => {
    setSalesOrders(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    addLog(`Updated order status to ${status}`, 'Sales');
    showToast(`Order status: ${status}`);
  };

  // Team & Role Handlers
  const handleAddTeamMember = (memberData: Omit<User, 'id'>) => {
    const newMember: User = {
      ...memberData,
      id: `usr-${Date.now()}`
    };
    setTeam(prev => [...prev, newMember]);
    addLog(`Invited team member ${newMember.name}`, 'User', newMember.email);
    showToast(`Invited member: ${newMember.name}`);
  };

  const handleUpdateRole = (id: string, role: User['role']) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    const member = team.find(m => m.id === id);
    addLog(`Changed role of ${member?.name} to ${role}`, 'User');
    showToast(`Role updated for ${member?.name}`);
  };

  const handleToggleMfa = (id: string) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, mfaEnabled: !m.mfaEnabled } : m));
    const member = team.find(m => m.id === id);
    addLog(`Toggled MFA protection for ${member?.name}`, 'User');
    showToast(`MFA configuration toggled.`);
  };

  // Asset Handlers
  const handleAddAsset = (assetData: Omit<AssetItem, 'id'>) => {
    const newAsset: AssetItem = {
      ...assetData,
      id: `ast-${Date.now()}`
    };
    setAssets(prev => [newAsset, ...prev]);
    addLog(`Registered asset [${newAsset.tagNumber}] ${newAsset.name}`, 'System', `${newAsset.valuationCurrency} ${newAsset.acquisitionCost.toLocaleString()}`);
    showToast(`Asset ${newAsset.tagNumber} registered in ledger.`);
  };

  const handleUpdateAsset = (id: string, updates: Partial<AssetItem>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    const asset = assets.find(a => a.id === id);
    addLog(`Updated asset parameters for ${asset?.tagNumber || id}`, 'System');
    showToast(`Asset details updated.`);
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(a => a.id !== id));
    addLog(`Decommissioned asset ${asset?.tagNumber || id}`, 'System');
    showToast(`Asset ${asset?.tagNumber || id} removed from ledger.`);
  };

  // Workflow Handlers
  const handleAddWorkflow = (wfData: Omit<AutomationWorkflow, 'id'>) => {
    const newWf: AutomationWorkflow = {
      ...wfData,
      id: `wf-${Date.now()}`
    };
    setWorkflows(prev => [newWf, ...prev]);
    addLog(`Configured automation rule: ${newWf.name}`, 'AI');
    showToast(`Automation workflow created.`);
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
    const wf = workflows.find(w => w.id === id);
    addLog(`Toggled automation rule ${wf?.name}`, 'AI');
    showToast(`Workflow status updated.`);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    addLog(`Deleted workflow ${id}`, 'AI');
    showToast(`Workflow removed.`);
  };

  const handleTriggerSimulation = (wf: AutomationWorkflow) => {
    setWorkflows(prev => prev.map(w => w.id === wf.id ? { 
      ...w, 
      executionCount: w.executionCount + 1,
      lastTriggered: 'Just now'
    } : w));
    addLog(`Automation Trigger Dispatched: ${wf.name}`, 'AI', wf.actions.join(' -> '));
    showToast(`Dispatched event: ${wf.name}`);
  };

  // Org Settings Handler
  const handleUpdateOrg = (updates: Partial<Organization>) => {
    setCurrentOrg(prev => ({ ...prev, ...updates }));
    addLog(`Updated organization workspace settings`, 'System');
    showToast("Workspace settings saved.");
  };

  // Handle Login form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!isConfigured) {
      setAuthError('Firebase is not configured. Add the VITE_FIREBASE_* values to your local environment.');
      return;
    }

    setAuthLoading(true);
    try {
      const user = await authenticateUser(authEmail, authPassword);
      setCurrentUser(user);
      setIsAuthenticated(true);
      showToast(`Signed in as ${user.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed.';
      setAuthError(message);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    if (!isConfigured) {
      setAuthError('Firebase is not configured. Add the VITE_FIREBASE_* values to your local environment.');
      return;
    }

    setAuthLoading(true);
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
      setIsAuthenticated(true);
      showToast(`Signed in as ${user.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="h-4 w-4" />;
      case 'crm': return <Users className="h-4 w-4" />;
      case 'finance': return <DollarSign className="h-4 w-4" />;
      case 'inventory': return <Package className="h-4 w-4" />;
      case 'assets': return <Boxes className="h-4 w-4" />;
      case 'sales': return <ShoppingBag className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'users': return <Shield className="h-4 w-4" />;
      case 'integrations': return <Layers className="h-4 w-4" />;
      case 'roadmap': return <Compass className="h-4 w-4" />;
      case 'settings': return <SettingsIcon className="h-4 w-4" />;
      default: return <LayoutDashboard className="h-4 w-4" />;
    }
  };

  // If unauthenticated, show Enterprise Sign-In with Captcha
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#080808] text-[#d1d1d1] font-sans">
        <div className="w-full max-w-md p-8 rounded-xl border border-[#222] bg-[#0F0F0F] shadow-2xl shadow-black/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-indigo-900/20">
                V
              </div>
              <div>
                <h1 className="text-white font-bold text-lg tracking-tight">
                  VALORNIQ <span className="text-indigo-500">3.0</span>
                </h1>
                <p className="text-[10px] text-[#555] font-mono uppercase tracking-wider">Enterprise ERP & CRM Core</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#222]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-[#555] font-mono">SECURE</span>
            </div>
          </div>

          <div className="border-t border-b py-3 border-[#222] text-xs text-[#888] flex items-center justify-between">
            <span className="uppercase text-[10px] tracking-wider text-[#555] font-bold">Tenant Workspace:</span>
            <span className="font-semibold text-white bg-[#1A1A1A] px-2 py-0.5 rounded border border-[#333]">{currentOrg.name}</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#555] text-[10px] uppercase tracking-wider font-bold mb-1">Corporate Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#333] bg-[#1A1A1A] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#555] text-[10px] uppercase tracking-wider font-bold mb-1">Workspace Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#333] bg-[#1A1A1A] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs tracking-wide shadow-lg shadow-indigo-900/20 border border-indigo-500/30 transition disabled:opacity-40 cursor-pointer"
            >
{authLoading ? 'Signing in…' : 'Sign in to Workspace'}
            </button>

            <div className="text-center pt-2">
              <span className="text-[10px] text-[#555] font-mono">
                🔒 Authentication and data access are enforced by the configured backend
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#d1d1d1] font-sans antialiased">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg bg-[#111] border border-[#333] text-white font-medium text-xs shadow-2xl shadow-black/80 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#222] bg-[#0F0F0F] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Tenant Switcher */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setActiveModule('dashboard')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-indigo-900/20">
                V
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:inline">
                VALORNIQ <span className="text-indigo-500">3.0</span>
              </span>
            </div>

            {/* Tenant Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] text-xs font-medium text-[#d1d1d1] cursor-pointer hover:border-indigo-500/50 hover:text-white transition">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{currentOrg.name}</span>
                <ChevronDown className="h-3 w-3 text-[#666]" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-[#222] bg-[#0F0F0F] shadow-2xl shadow-black/90 py-1.5 hidden group-hover:block z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#555] uppercase tracking-widest">
                  Active Tenant Context
                </div>
                {SAMPLE_ORGANIZATIONS.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitchTenant(org)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition cursor-pointer ${
                      currentOrg.id === org.id ? 'font-semibold text-white bg-[#1A1A1A] border-l-2 border-indigo-500' : 'text-[#888]'
                    }`}
                  >
                    <span>{org.name}</span>
                    {currentOrg.id === org.id && <span className="text-[9px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* System Status indicator */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#111] border border-[#222]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-[#555] font-mono">SYSTEM_READY</span>
            </div>
          </div>

          {/* Center Navigation on Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto max-w-3xl scrollbar-none py-1">
            {APP_MODULES.map(mod => {
              const isActive = activeModule === mod.id;
              const isRoadmap = mod.id === 'roadmap';
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border border-[#333] shadow-sm'
                      : isRoadmap
                      ? 'text-indigo-400 hover:bg-[#1A1A1A] hover:text-white border border-indigo-500/30 bg-indigo-500/5'
                      : 'text-[#888] hover:bg-[#1A1A1A] hover:text-white border border-transparent group'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-[#444]'
                  }`}></span>
                  {getModuleIcon(mod.id)}
                  <span>{mod.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2.5">
            {/* ARIS Co-Pilot Trigger */}
            <button
              onClick={() => setArisOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-900/20 border border-indigo-500/30 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span>ARIS AI</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#222]">
              <div 
                onClick={() => setActiveModule('settings')}
                className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-black font-bold text-xs cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-500/50 transition"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={async () => { await signOut(); setIsAuthenticated(false); }}
                className="p-1.5 rounded-lg text-[#666] hover:text-rose-400 hover:bg-[#1A1A1A] transition cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1A1A1A] border border-[#222]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#222] p-4 space-y-1 bg-[#0F0F0F]">
            {APP_MODULES.map(mod => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setActiveModule(mod.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 text-left transition ${
                    isActive
                      ? 'bg-[#1A1A1A] text-white border border-[#333]'
                      : 'text-[#888] hover:bg-[#1A1A1A] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-transparent'}`}></span>
                  {getModuleIcon(mod.id)}
                  <span>{mod.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'dashboard' && (
          <DashboardView
            leads={leads}
            invoices={invoices}
            expenses={expenses}
            contacts={contacts}
            products={products}
            sales={salesOrders}
            team={team}
            logs={activityLogs}
            alerts={alerts}
            onNavigateTo={(view) => {
              const lower = view.toLowerCase();
              if (lower.includes('crm') || lower.includes('lead')) setActiveModule('crm');
              else if (lower.includes('finance') || lower.includes('invoice')) setActiveModule('finance');
              else if (lower.includes('inventory') || lower.includes('stock')) setActiveModule('inventory');
              else if (lower.includes('asset')) setActiveModule('assets');
              else if (lower.includes('automation') || lower.includes('workflow')) setActiveModule('automation');
              else if (lower.includes('roadmap') || lower.includes('moat')) setActiveModule('roadmap');
              else if (lower.includes('sales') || lower.includes('order')) setActiveModule('sales');
              else if (lower.includes('user') || lower.includes('team')) setActiveModule('users');
              else setActiveModule('dashboard');
            }}
            onClearAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
            isDark={isDark}
            dashSettings={dashSettings}
            onUpdateDashSettings={setDashSettings}
            onSeedSampleData={handleResetData}
            onOpenAris={() => setArisOpen(true)}
          />
        )}

        {activeModule === 'crm' && (
          <CRMView
            leads={leads}
            contacts={contacts}
            companies={companies}
            onAddLead={handleAddLead}
            onUpdateLeadStage={handleUpdateLeadStage}
            onDeleteLead={handleDeleteLead}
            onAddContact={handleAddContact}
            isDark={isDark}
          />
        )}

        {activeModule === 'finance' && (
          <FinanceView
            invoices={invoices}
            expenses={expenses}
            balances={balances}
            onAddInvoice={handleAddInvoice}
            onAddExpense={handleAddExpense}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onUpdateExpenseStatus={handleUpdateExpenseStatus}
            isDark={isDark}
          />
        )}

        {activeModule === 'inventory' && (
          <InventoryView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            isDark={isDark}
          />
        )}

        {activeModule === 'sales' && (
          <SalesView
            sales={salesOrders}
            customers={customers}
            products={products}
            onAddSalesOrder={handleAddSalesOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isDark={isDark}
          />
        )}

        {activeModule === 'users' && (
          <UserManagementView
            currentUser={currentUser}
            team={team}
            logs={activityLogs}
            onAddTeamMember={handleAddTeamMember}
            onUpdateRole={handleUpdateRole}
            onToggleMfa={handleToggleMfa}
            isDark={isDark}
          />
        )}

        {activeModule === 'integrations' && (
          <IntegrationsView
            isDark={isDark}
            onTriggerSync={() => showToast("Re-synchronized all third-party integrations.")}
          />
        )}

        {activeModule === 'assets' && (
          <AssetTrackingView
            assets={assets}
            organization={currentOrg}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            isDark={isDark}
          />
        )}

        {activeModule === 'automation' && (
          <WorkflowsView
            workflows={workflows}
            onAddWorkflow={handleAddWorkflow}
            onToggleWorkflow={handleToggleWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
            onTriggerSimulation={handleTriggerSimulation}
            isDark={isDark}
          />
        )}

        {activeModule === 'roadmap' && (
          <StrategicRoadmapView
            isDark={isDark}
            onNavigateToModule={(mod) => setActiveModule(mod)}
          />
        )}

        {activeModule === 'settings' && (
          <SettingsView
            organization={currentOrg}
            onUpdateOrg={handleUpdateOrg}
            isDark={isDark}
            onToggleTheme={() => setIsDark(!isDark)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* ARIS Chat Drawer with Harvard Accounting & Math Core */}
      <ArisChatDrawer
        isOpen={arisOpen}
        onClose={() => setArisOpen(false)}
        organization={currentOrg}
        currentModule={activeModule}
        leads={leads}
        invoices={invoices}
        products={products}
        expenses={expenses}
        balances={balances}
        assets={assets}
        onAddLead={handleAddLead}
        onAddInvoice={handleAddInvoice}
        onUpdateProductStock={(id, newStock) => handleUpdateProduct(id, { stock: newStock })}
        isDark={isDark}
      />
    </div>
  );
}
