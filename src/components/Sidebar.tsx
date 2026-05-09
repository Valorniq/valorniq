import React from 'react';
import { 
  LogOut,
  LayoutDashboard,
  Store as AppStore,
  ChevronDown,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';
import { APP_MODULES } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  user: any;
  enabledModules: string[];
  onManageFolders?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  onUpgrade, 
  user,
  enabledModules
}) => {
  const [expandedCats, setExpandedCats] = React.useState<string[]>(['Sales', 'Finance']);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const categories = Array.from(new Set(APP_MODULES.map(m => m.category)));

  return (
    <aside id="nexus-sidebar" className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
      <div className="p-6 h-14 flex items-center border-b border-slate-200 bg-slate-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white text-xs font-black">V</span>
          </div>
          <span className="font-black text-xs tracking-widest text-white uppercase italic">Valorniq OS</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        <div className="space-y-6">
          <section>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-bold text-xs uppercase tracking-widest ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('appstore')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-bold text-xs uppercase tracking-widest mt-1 ${
                activeTab === 'appstore' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <AppStore className={`w-4 h-4 ${activeTab === 'appstore' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span>App Store</span>
            </button>
          </section>

          {categories.map(cat => {
            const catModules = APP_MODULES.filter(m => m.category === cat && (enabledModules.includes('all') || enabledModules.includes(m.id)));
            if (catModules.length === 0) return null;

            return (
              <section key={cat} className="space-y-1">
                <button 
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                >
                  {cat}
                  {expandedCats.includes(cat) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                
                {expandedCats.includes(cat) && (
                  <div className="space-y-1 mt-1">
                    {catModules.map(module => (
                      <button
                        key={module.id}
                        onClick={() => setActiveTab(module.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group font-medium text-sm ${
                          activeTab === module.id 
                            ? 'bg-white text-indigo-700 shadow-sm border border-slate-100' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <module.icon className={`w-4 h-4 ${activeTab === module.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="truncate">{module.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          <section>
             <button
              onClick={() => setActiveTab('erp')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-bold text-xs uppercase tracking-widest ${
                activeTab === 'erp' 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Admin Sync</span>
            </button>
          </section>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
        <button 
          onClick={onManageFolders}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-white hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all border border-slate-200 hover:border-indigo-300"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Organize Apps</span>
        </button>
        
        <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 opacity-60">Verified Identity</p>
            <p className="text-sm font-bold truncate leading-none">{user?.displayName || 'Enterprise User'}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-2">Neural Tier III</p>
            <button 
              onClick={onUpgrade}
              className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black py-3 px-3 rounded-xl transition-all uppercase tracking-[0.2em] active:scale-[0.98] shadow-lg shadow-indigo-500/30"
            >
              Scale Cap
            </button>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

