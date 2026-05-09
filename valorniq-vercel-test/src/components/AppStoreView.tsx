import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Shield, Crown, Blocks, Layers, Monitor, Plus } from 'lucide-react';
import { PLANS, APP_MODULES } from '../constants';

interface AppStoreViewProps {
  currentPlan: string;
  onUpgrade: (planId: string) => void;
}

const AppStoreView: React.FC<AppStoreViewProps> = ({ currentPlan, onUpgrade }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          SCALABLE <span className="text-indigo-600">INFRASTRUCTURE</span> FOR ANY SCALE.
        </h1>
        <p className="text-slate-500 font-medium">Select the interface modules and neural sync capacity that matches your enterprise velocity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-[2.5rem] border shadow-2xl flex flex-col ${
              plan.id === 'enterprise' 
                ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/40' 
                : 'bg-white text-slate-900 border-slate-100 shadow-slate-200/50'
            }`}
          >
            {plan.id === 'business' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                Most Popular
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                plan.id === 'enterprise' ? 'bg-indigo-500' : 'bg-slate-50 border border-slate-100'
              }`}>
                {i === 0 ? <Blocks className="w-6 h-6" /> : i === 1 ? <Layers className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                <p className={`${plan.id === 'enterprise' ? 'text-slate-400' : 'text-slate-500'} text-xs font-medium`}>{plan.description}</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-black">${plan.price}</span>
              <span className={`${plan.id === 'enterprise' ? 'text-slate-400' : 'text-slate-500'} text-sm font-bold uppercase tracking-wider`}>/ month</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {(plan.id === 'enterprise' ? ['Full Module Access', 'Neural Prediction', '24/7 Priority Sync', 'Cross-Region Hosting'] : 
                plan.id === 'business' ? ['CRM & Sales Pack', 'Finance & Accounting', 'Inventory Control', 'Advanced Reports'] :
                ['Standard Metrics', 'Basic CRM', 'Invoicing Core', '1 User Profile']).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <div className={`p-1 rounded-full ${plan.id === 'enterprise' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onUpgrade(plan.id)}
              disabled={currentPlan === plan.id}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                plan.id === 'enterprise'
                  ? 'bg-white text-slate-900 hover:bg-slate-50 shadow-xl'
                  : currentPlan === plan.id 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'
              }`}
            >
              {currentPlan === plan.id ? 'Current Interface' : i === 0 ? 'Downgrade' : 'Initialize Sync'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="pt-12 space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-bold tracking-tight text-slate-900">Module Marketplace</h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">30 available modules</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {APP_MODULES.slice(0, 8).map((module) => (
            <div 
              key={module.id} 
              onClick={() => onUpgrade(module.id)}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-500 transition-colors group cursor-pointer"
            >
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                 <module.icon className="w-5 h-5" />
               </div>
               <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">{module.name}</h4>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{module.description}</p>
            </div>
          ))}
          <div 
            onClick={() => alert('Interface Notice: The full module repository is being indexed. All 30 modules are available via the sidebar command terminal.')}
            className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-2 group hover:bg-slate-100 transition-all cursor-pointer"
          >
             <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center text-slate-400">
               <Plus className="w-5 h-5" />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explore All {APP_MODULES.length} Apps</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppStoreView;
