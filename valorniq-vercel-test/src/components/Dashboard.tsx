import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ShoppingBag, ArrowUpRight, Activity, Percent, Plus, X, Settings as Gear, Grid, List, Check } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { WIDGETS } from '../constants';

interface DashboardProps {
  leads: any[];
  products: any[];
  sales: any[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, products, sales, setActiveTab }) => {
  const [activeWidgets, setActiveWidgets] = useState<string[]>(['leads_metric', 'sales_velocity', 'inventory_alerts', 'unpaid_invoices']);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const growthData = timeframe === '7d' ? [
    { name: 'Mon', net: 4000, target: 3500 },
    { name: 'Tue', net: 3000, target: 3800 },
    { name: 'Wed', net: 5000, target: 4100 },
    { name: 'Thu', net: 4200, target: 4400 },
    { name: 'Fri', net: 6500, target: 4800 },
    { name: 'Sat', net: 5900, target: 5100 },
    { name: 'Sun', net: 8400, target: 5500 },
  ] : [
    { name: 'Week 1', net: 15000, target: 12000 },
    { name: 'Week 2', net: 18000, target: 16000 },
    { name: 'Week 3', net: 22000, target: 20000 },
    { name: 'Week 4', net: 31000, target: 25000 },
  ];

  return (
    <div id="valorniq-dashboard" className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
               <Grid className="text-white w-4 h-4" />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Node</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Cross-module performance telemetry aggregated via ARIS.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowWidgetConfig(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Gear className="w-4 h-4 text-slate-400" />
            Configure View
          </button>
          <button 
            onClick={() => setActiveTab('erp')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Neural Audit
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeWidgets.includes('leads_metric') && (
          <WidgetCard label="Open Leads" value={leads.length} icon={Activity} color="text-blue-500" trend="+4.2%" />
        )}
        {activeWidgets.includes('unpaid_invoices') && (
          <WidgetCard label="Unpaid Invoices" value={8} icon={Percent} color="text-rose-500" trend="-1.5%" />
        )}
        {activeWidgets.includes('subscription_renewals') && (
          <WidgetCard label="Renewals" value="24" icon={TrendingUp} color="text-emerald-500" trend="+12%" />
        )}
        <WidgetCard label="Active Users" value={142} icon={ShoppingBag} color="text-purple-500" trend="+8.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeWidgets.includes('sales_velocity') && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden h-[450px]">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                      <Percent className="text-indigo-400 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Velocity Projection</h3>
                      <p className="text-slate-500 text-xs mt-0.5">Real-time asset movement vs target thresholds.</p>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['7d', '30d'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTimeframe(t as any)}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all rounded-md ${
                          timeframe === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t === '7d' ? '7 Days' : '30 Days'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 -mx-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} />
                      <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {activeWidgets.includes('inventory_alerts') && (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-500" />
                  Neural Feed
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider">Alerts (3)</span>
              </div>
              <div className="space-y-4">
                {leads.slice(0, 4).map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => setActiveTab('crm')}
                    className="flex gap-4 items-center p-3 hover:bg-slate-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-indigo-400 font-black text-xs group-hover:scale-110 transition-transform">
                      {lead.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate text-slate-900 mb-0.5">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Priority: <span className="text-indigo-500">High</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Configuration Modal */}
      <AnimatePresence>
        {showWidgetConfig && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-2xl w-full rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowWidgetConfig(false)}
                className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Widget Manifest</h3>
                <p className="text-slate-500 text-sm font-medium">Synchronize cross-module telemetry with your dashboard interface.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {WIDGETS.map(widget => (
                  <button 
                    key={widget.id}
                    onClick={() => toggleWidget(widget.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      activeWidgets.includes(widget.id)
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{widget.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{widget.category}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      activeWidgets.includes(widget.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'
                    }`}>
                      {activeWidgets.includes(widget.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100">
                <button 
                  onClick={() => setShowWidgetConfig(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                  Confirm Configuration
                </button>
              </div>
              
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl invisible md:visible" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WidgetCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="flex items-center justify-between mb-4">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</p>
      <div className="flex items-center gap-1 text-emerald-600">
        <TrendingUp className="w-3 h-3" />
        <span className="text-[10px] font-black">{trend}</span>
      </div>
    </div>
  </motion.div>
);

export default Dashboard;

