import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight,
  LucideIcon
} from 'lucide-react';

interface GenericModuleViewProps {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const GenericModuleView: React.FC<GenericModuleViewProps> = ({ id, name, icon: Icon, description }) => {
  const [items, setItems] = React.useState<any[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Mock stats
  const mockStats = [
    { label: `Active ${name}`, value: (124 + items.length).toString(), trend: '+12%', up: true },
    { label: `Linked ${name}`, value: '12', trend: '-2%', up: false },
    { label: `History ${name}`, value: '892', trend: '+5%', up: true },
  ];

  const handleAdd = () => {
    const newItem = {
      id: `${id.toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'VERIFIED'
    };
    setItems(prev => [newItem, ...prev]);
    alert(`Protocol Success: New ${name} entry synchronized with local ledger. Verification pending regional sync.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-slate-900">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{name}</h1>
            <p className="text-slate-500 text-sm font-medium">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New {name}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default"
          >
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-900 leading-none">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative group max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${name.toLowerCase()}...`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsSearching(true);
                  setTimeout(() => setIsSearching(false), 1500);
                  e.currentTarget.value = '';
                }
              }}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert('Interface Notice: Refinement filters are under global maintenance. Basic sorting remains active.')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button 
              onClick={() => alert(`Module Metadata: ID=${id} | Status=DEVOPS_SYNCED | Region=GBL_CORE`)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 min-h-[300px]">
          {isSearching ? (
            <div className="p-12 text-center animate-pulse flex flex-col items-center justify-center h-full">
               <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Search Query Active...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors px-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">
                    {item.id.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.id}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Synced at {item.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                    {item.status}
                  </span>
                  <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                <Icon className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No {name.toLowerCase()} records found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Initializing your first ${name.toLowerCase()} record will activate the neural ledger for this module.</p>
              </div>
              <button 
                onClick={handleAdd}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Synthesize entry record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericModuleView;
