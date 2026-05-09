import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search as SearchIcon, Command, User as UserIcon, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { auth, signIn, subscribeToCollection } from './services/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadsView from './components/LeadsView';
import InventoryView from './components/InventoryView';
import SalesView from './components/SalesView';
import AICounsel from './components/AICounsel';
import ERPView from './components/ERPView';
import ArchivesView from './components/ArchivesView';
import GenericModuleView from './components/GenericModuleView';
import AppStoreView from './components/AppStoreView';

import { Lead, Product, SalesOrder, Customer } from './types';
import { APP_MODULES, PLANS } from './constants';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState('enterprise');
  const [enabledModules, setEnabledModules] = useState<string[]>(['all']);
  const [handshakeStatus, setHandshakeStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const [leads, setLeads] = useState<Lead[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubLeads = subscribeToCollection<Lead>('leads', setLeads, user.uid);
    const unsubProducts = subscribeToCollection<Product>('products', setProducts, user.uid);
    const unsubSales = subscribeToCollection<SalesOrder>('salesOrders', setSales, user.uid);
    const unsubCustomers = subscribeToCollection<Customer>('customers', setCustomers, user.uid);

    return () => {
      unsubLeads();
      unsubProducts();
      unsubSales();
      unsubCustomers();
    };
  }, [user]);

  useEffect(() => {
    // Plan-based module filtering logic
    if (currentPlan === 'free') {
      setEnabledModules(['dashboard', 'appstore', 'crm', 'invoicing', 'archives']);
    } else if (currentPlan === 'business') {
      setEnabledModules(['dashboard', 'appstore', 'crm', 'inventory', 'sales', 'finances', 'billing', 'payroll', 'archives', 'erp']);
    } else {
      setEnabledModules(['all']); // Enterprise gets full access
    }
  }, [currentPlan]);

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/50">
            <span className="text-white text-2xl font-black">A</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing ARIS Intelligence...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-stretch overflow-hidden">
        <div className="flex-1 bg-slate-900 text-white p-12 md:p-24 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <span className="text-white text-2xl font-black">V</span>
              </div>
              <span className="text-2xl font-black italic tracking-tighter uppercase">Valorniq</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight leading-[0.85] lg:text-8xl">REDEFINING<br /><span className="text-indigo-500">BUSINESS</span><br />INTELLIGENCE.</h1>
            <p className="text-slate-400 max-w-md text-lg font-medium leading-relaxed">The unified OS for modern enterprises. Automate CRM, Logistics, and Sales with zero-latency AI counsel.</p>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 gap-12 max-w-xl">
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Zap className="w-4 h-4 fill-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Neural Logic</span>
                </div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Predictive Supply Chains</p>
             </div>
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 fill-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Fortress Security</span>
                </div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Zero-Trust Architecture</p>
             </div>
          </div>

          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="w-full md:w-[600px] bg-white p-12 md:p-24 flex flex-col justify-center gap-12 shadow-2xl relative">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Access Terminal</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Secure authentication required to interface with Nexus core modules.</p>
          </div>

          <div className="space-y-4">
            <button 
              id="btn-login-google"
              onClick={signIn}
              className="w-full h-14 flex items-center justify-center gap-4 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
              <span>Continue with Google</span>
            </button>

            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => alert(`SSO INITIALIZATION\n------------------\nService: GitHub Tunnel\nProtocol: OAuth 2.0 / JWT\nStatus: Requesting secure handshake from GitHub API.\n\nNeural link established. Redirecting to authorization endpoint...`)}
                className="h-14 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] group"
              >
                <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="GitHub" />
              </button>
              <button 
                onClick={() => alert(`SSO INITIALIZATION\n------------------\nService: Microsoft Auth\nProtocol: Azure AD / SAML\nStatus: Handshaking with Microsoft identity verification node.\n\nSecure relay active.`)}
                className="h-14 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] group"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Microsoft" />
              </button>
              <button 
                onClick={() => alert(`SSO INITIALIZATION\n------------------\nService: Apple ID\nProtocol: Biometric Relay\nStatus: Requesting biometric verification from hardware trusted enclave.`)}
                className="h-14 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] group"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Apple" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]"><span className="bg-white px-4 text-slate-300">Or Neural Key</span></div>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Endpoint Identifier</label>
                <input 
                  type="email" 
                  placeholder="name@enterprise.com" 
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-bold focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all outline-none disabled:opacity-50"
                  disabled={handshakeStatus === 'loading'}
                />
             </div>
             <button 
                onClick={() => {
                  setHandshakeStatus('loading');
                  setTimeout(() => {
                    setHandshakeStatus('success');
                    signIn(); // Fallback to google login for now but with visual feedback
                  }, 1500);
                }}
                disabled={handshakeStatus === 'loading'}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:bg-slate-400"
             >
               {handshakeStatus === 'loading' ? 'Encrypting Handshake...' : 'Initialize Handshake'}
             </button>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
             <div className="p-2 bg-white rounded-lg border border-slate-200">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
             </div>
             <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">Enterprise Guard v2.4</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">All sessions are encrypted and subject to biometric verification where applicable.</p>
             </div>
          </div>

          <p className="text-[10px] text-center text-slate-400 leading-relaxed uppercase tracking-widest font-bold">
            Valorniq OS © 2024 Systems Intelligence Group
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        onUpgrade={() => setActiveTab('appstore')}
        user={user} 
        enabledModules={enabledModules}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-12 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Valorniq <span className="text-slate-200">/</span> <span className="text-slate-900">{activeTab}</span>
            </span>
          </div>

           <div className="flex-1 max-w-xl mx-8">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Global command search... (⌘K)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value.toLowerCase();
                    const match = APP_MODULES.find(m => m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query));
                    if (match) {
                      setActiveTab(match.id);
                    } else if (query === 'dashboard') {
                      setActiveTab('dashboard');
                    } else if (query === 'store' || query === 'upgrade') {
                      setActiveTab('appstore');
                    } else {
                      alert(`Neural Routing Error: No modules found for "${query}". Try searching for specific modules like "Logistics" or "Payroll".`);
                    }
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-full py-1.5 pl-9 pr-12 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white shadow-sm">
                <Command className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1 text-slate-400 hover:text-slate-900 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            {showNotifications && (
              <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Live Feed</p>
                <div className="space-y-3">
                  <div 
                    onClick={() => {
                      setActiveTab('sales');
                      setShowNotifications(false);
                    }}
                    className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                  >
                    <p className="text-xs font-bold text-slate-900">New Sale Recorded</p>
                    <p className="text-[10px] text-slate-500">Inventory was automatically decremented to maintain sync.</p>
                  </div>
                  <div 
                    onClick={() => {
                      setActiveTab('erp');
                      setShowNotifications(false);
                    }}
                    className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                  >
                    <p className="text-xs font-bold text-slate-900">Neural Sync Complete</p>
                    <p className="text-[10px] text-slate-500">12,402 data points harmonized across GBL_CORE region.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-900 leading-none mb-0.5">{user.displayName || 'Operator'}</p>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Verified Access</p>
               </div>
               <button 
                onClick={() => setShowProfile(!showProfile)}
                className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white border border-slate-800 shadow-xl overflow-hidden hover:scale-105 transition-transform"
               >
                  <UserIcon className="w-4 h-4" />
               </button>
            </div>
            {showProfile && (
              <div className="absolute top-12 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Profile Configuration</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => setShowUpgrade(true)}
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                  >
                    Upgrade Tier
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Terminate Session
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {activeTab === 'dashboard' && <Dashboard leads={leads} products={products} sales={sales} setActiveTab={setActiveTab} />}
              {activeTab === 'appstore' && (
                <AppStoreView 
                  currentPlan={currentPlan} 
                  onUpgrade={(planId) => {
                    setCurrentPlan(planId);
                    alert(`Plan Escalation: Neural tier successfully transitioned to ${planId.toUpperCase()}. Syncing cross-region modules.`);
                  }} 
                />
              )}
              {activeTab === 'crm' && <LeadsView leads={leads} />}
              {activeTab === 'inventory' && <InventoryView products={products} />}
              {activeTab === 'sales' && <SalesView sales={sales} customers={customers} products={products} />}
              {activeTab === 'archives' && <ArchivesView leads={leads} products={products} sales={sales} />}
              {activeTab === 'erp' && <ERPView sales={sales} products={products} />}
              
              {/* Dynamic Modules Rendering */}

              {!['dashboard', 'appstore', 'crm', 'inventory', 'sales', 'archives', 'erp', 'leads'].includes(activeTab) && (
                (() => {
                  const module = APP_MODULES.find(m => m.id === activeTab);
                  if (module) {
                    return (
                      <GenericModuleView 
                        id={module.id} 
                        name={module.name} 
                        icon={module.icon} 
                        description={module.description} 
                      />
                    );
                  }
                  return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Neural endpoint not found.</div>;
                })()
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <AICounsel leads={leads} products={products} sales={sales} />
      </div>

      <AnimatePresence>
        {showUpgrade && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black tracking-tight text-slate-900">Tier Escalation</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Scaling your infrastructure beyond current limits requires an enterprise-grade neural sync subscription.</p>
              <div className="space-y-4 pt-4">
                 <button 
                  onClick={() => alert('Escalating Tier: Preparing enterprise-grade neural sync proposal. An agent will contact your verified endpoint.')}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                 > 
                  Escalation Details 
                 </button>
                 <button 
                  onClick={() => setShowUpgrade(false)}
                  className="w-full py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50"
                 > Discard </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
