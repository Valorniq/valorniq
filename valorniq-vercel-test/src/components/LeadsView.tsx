import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Mail, Trash2, XCircle, Users } from 'lucide-react';
import { createDocument, updateDocument, removeDocument } from '../services/firebase';
import { Lead } from '../types';

interface LeadsViewProps {
  leads: Lead[];
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    source: 'Website',
    status: 'new' as const,
    estimatedValue: 0
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name) return;
    await createDocument('leads', newLead);
    setNewLead({ name: '', email: '', source: 'Website', status: 'new', estimatedValue: 0 });
    setIsAdding(false);
  };

  const updateStatus = async (id: string, status: any) => {
    await updateDocument('leads', id, { status });
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleEmail = (email: string) => {
    alert(`Drafting intelligent response for ${email}. Neural context applied.`);
    window.location.href = `mailto:${email}?subject=Valorniq Enterprise Solutions`;
  };

  return (
    <div id="leads-view" className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <header className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM & Leads</h2>
          <p className="text-slate-500 text-sm">Targeted prospect management and pipeline tracking.</p>
        </header>

        <div className="flex gap-3">
          <button 
            onClick={() => {
              const data = { leads: filteredLeads };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `leads_export_${new Date().getTime()}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            Export CSV
          </button>
          <button 
            id="btn-add-lead"
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-indigo-300">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            id="search-leads"
            type="text" 
            placeholder="Search leads by name, email or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-700 outline-none"
          />
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
           {['all', 'new', 'contacted', 'qualified'].map(s => (
             <button 
               key={s}
               onClick={() => setFilterStatus(s)}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                 filterStatus === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="grid grid-cols-5 p-4 border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="pl-4">Name / Contact</div>
          <div>Status</div>
          <div>Estimated Value</div>
          <div>Source</div>
          <div className="text-right pr-4">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLeads.map((lead) => (
            <motion.div 
              key={lead.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/80 transition-all group cursor-pointer"
            >
              <div className="pl-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors capitalize">
                  {lead.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                </div>
              </div>

              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  lead.status === 'new' ? 'bg-indigo-100 text-indigo-700' :
                  lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                  lead.status === 'qualified' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {lead.status}
                </span>
              </div>

              <div className="font-mono text-sm font-bold text-slate-900">
                ${lead.estimatedValue?.toLocaleString() || '0'}
              </div>

              <div className="text-xs font-medium text-slate-500">
                {lead.source}
              </div>

              <div className="flex items-center justify-end gap-2 pr-4">
                <button 
                  onClick={() => lead.email && handleEmail(lead.email)}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-slate-200 shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <select 
                  id={`status-select-${lead.id}`}
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="text-xs font-bold font-mono border-none bg-slate-100 rounded-lg py-1 px-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-700"
                >
                  <option value="new">NEW</option>
                  <option value="contacted">CON</option>
                  <option value="qualified">QUAL</option>
                  <option value="lost">LOST</option>
                </select>
                <button 
                  onClick={() => removeDocument('leads', lead.id)}
                  className="p-2 text-slate-200 hover:text-rose-600 transition-colors"
                >
                   <Trash2 className="w-4 h-4" /> 
                </button>
              </div>
            </motion.div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <Users className="w-8 h-8 text-slate-200" />
              </div>
              <div>
                <p className="text-slate-900 font-bold">No leads found</p>
                <p className="text-slate-500 text-xs">Start building your pipeline by adding your first prospect.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-8 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">New Prospect</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      required
                      id="new-lead-name"
                      className="input-field"
                      value={newLead.name}
                      onChange={e => setNewLead({...newLead, name: e.target.value})}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      type="email"
                      id="new-lead-email"
                      className="input-field"
                      value={newLead.email}
                      onChange={e => setNewLead({...newLead, email: e.target.value})}
                      placeholder="john@enterprise.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deal Value ($)</label>
                    <input 
                      type="number"
                      id="new-lead-value"
                      className="input-field"
                      value={newLead.estimatedValue}
                      onChange={e => setNewLead({...newLead, estimatedValue: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Source</label>
                    <select 
                      id="new-lead-source"
                      className="input-field appearance-none"
                      value={newLead.source}
                      onChange={e => setNewLead({...newLead, source: e.target.value})}
                    >
                      <option>Website</option>
                      <option>Referral</option>
                      <option>Direct Outreach</option>
                      <option>LinkedIn Intelligence</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary flex-1 justify-center py-3"
                  >
                    Generate Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsView;
