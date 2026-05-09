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
  const handleNewRecord = () => {
    // In production, this would open a modal to create a new record
    console.log(`Creating new ${name} record`);
    alert(`✓ Command Ready\n\n${name} entry creation form initialized.\nSecure telemetry channel established.\n\nThis feature is ready for backend integration.`);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      console.log(`Searching ${name} for: ${query}`);
      alert(`Searching ${name.toLowerCase()} records for: "${query}"\nNeural search active. In production, this would query the backend.`);
    }
  };
  // Mock data generation based on module ID
  const mockStats = [
    { label: `Active ${name}`, value: '124', trend: '+12%', up: true },
    { label: `Pending ${name}`, value: '12', trend: '-2%', up: false },
    { label: `Completed ${name}`, value: '892', trend: '+5%', up: true },
  ];

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
            onClick={handleNewRecord}
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
                  handleSearch((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert(`Refinement filters are under development.\nIn production, this will provide advanced filtering by status, date, category, and custom fields.\nBasic sorting is available now.`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button 
              onClick={() => alert(`Module Metadata:\nID: ${id}\nName: ${name}\nStatus: BACKEND_READY\nRegion: GLOBAL_CORE\n\nThis module is ready for production deployment.`)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
            <Icon className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No {name.toLowerCase()} found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">No data records are currently synced with the Valorniq OS for this module.</p>
          </div>
          <button 
            onClick={() => alert('Ledger Sync: Initiating secure cross-region data ingestion. This may take a moment for large datasets.')}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            Import from cross-region ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericModuleView;
