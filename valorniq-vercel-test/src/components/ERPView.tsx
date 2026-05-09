import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Globe, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  LayoutGrid
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

interface ERPViewProps {
  sales: any[];
  products: any[];
}

const ERPView: React.FC<ERPViewProps> = ({ sales, products }) => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [showConfig, setShowConfig] = React.useState(false);
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  
  const handleExport = () => {
    const data = {
      reportType: 'ERP_FINANCIAL_SUMMARY',
      timestamp: new Date().toISOString(),
      revenue: totalRevenue,
      inventoryValue: totalStockValue,
      allocation: resourceAllocation,
      raw_sales: sales,
      raw_inventory: products
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valorniq_erp_report_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      alert('Strategic Simulation Complete: Predictive models suggest a 12.4% increase in liquidity if R&D allocation is pivoted towards Ops Automation by Q3.');
    }, 2000);
  };
  
  // Mock data for ERP visualization
  const monthlyData = [
    { name: 'Jan', revenue: 4000, costs: 2400 },
    { name: 'Feb', revenue: 3000, costs: 1398 },
    { name: 'Mar', revenue: 2000, costs: 9800 },
    { name: 'Apr', revenue: 2780, costs: 3908 },
    { name: 'May', revenue: 1890, costs: 4800 },
    { name: 'Jun', revenue: 2390, costs: 3800 },
    { name: 'Jul', revenue: 3490, costs: 4300 },
  ];

  const resourceAllocation = [
    { name: 'R&D', value: 400, color: '#6366f1' },
    { name: 'Marketing', value: 300, color: '#8b5cf6' },
    { name: 'Ops', value: 300, color: '#3b82f6' },
    { name: 'Legal', value: 200, color: '#f43f5e' },
  ];

  return (
    <div id="erp-view" className="p-8 space-y-8 bg-slate-50 min-h-full">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            ERP Interface
            <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-white uppercase tracking-[0.2em] font-black">Enterprise</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Unified Resource Planning & Financial Intelligence.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Config
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            Export Report
          </button>
        </div>
      </header>

      {/* Financial Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'indigo' },
          { label: 'Asset Value', value: `$${totalStockValue.toLocaleString()}`, change: '+3.2%', icon: PieChart, color: 'emerald' },
          { label: 'Market Cap', value: '$84.2M', change: '+28.4%', icon: Globe, color: 'blue' },
          { label: 'Op. Efficiency', value: '94.2%', change: '+1.5%', icon: Activity, color: 'amber' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Revenue Analysis</h3>
              <p className="text-slate-500 text-xs mt-1">Cash flow velocity vs Operational overhead.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live Ledger</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="costs" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold">Resourcing</h3>
            </div>
            
            <div className="h-[240px] w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={resourceAllocation}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {resourceAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-black">1.2M</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Allocated</p>
              </div>
            </div>

            <div className="space-y-4">
              {resourceAllocation.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-white">{item.value}K</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Department Efficiency</h3>
          <div className="space-y-6">
            {[
              { dept: 'Logistics', score: 92, status: 'Optimal' },
              { dept: 'Sales', score: 85, status: 'High' },
              { dept: 'Tech', score: 98, status: 'Peak' },
            ].map((d, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700">{d.dept}</span>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{d.status}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${d.score}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white">
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-2xl font-black">Strategic Forecast</h3>
              <p className="text-indigo-100 text-sm max-w-[280px]">AI models predict a 15% growth in efficiency upon next-quarter automated logistics cycle.</p>
            </div>
            <div className="mt-8">
              <button 
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-50"
              >
                {isSimulating ? 'Processing Models...' : 'Run Simulation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6"
          >
            <h3 className="text-2xl font-bold">ERP Configuration</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Currency Sync</p>
                <p className="text-sm font-bold text-slate-900">Standard: USD ($)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fiscal Boundary</p>
                <p className="text-sm font-bold text-slate-900">End Date: Dec 31, 2026</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowConfig(false)}
                className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={() => {
                  alert('System Preferences: Cross-region ledger synchronization defaults updated. Neural link state persisted.');
                  setShowConfig(false);
                }}
                className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                Sync Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ERPView;
