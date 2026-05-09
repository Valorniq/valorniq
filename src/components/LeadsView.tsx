import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Mail, Trash2, XCircle, Users, Upload, AlertCircle } from 'lucide-react';
import { createDocument, updateDocument, removeDocument } from '../services/firebase';
import { Lead } from '../types';
import ImportWizard from './ImportWizard';
import ImportHistory from './ImportHistory';

interface LeadsViewProps {
  leads: Lead[];
}

const LeadsView: React.FC<LeadsViewProps> = ({ leads }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
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
    try {
      await createDocument('leads', newLead);
      setNewLead({ name: '', email: '', source: 'Website', status: 'new', estimatedValue: 0 });
      setIsAdding(false);
    } catch (error) {
      alert('Failed to create lead. Please try again.');
    }
  };

  const updateStatus = async (id: string, status: any) => {
    try {
      await updateDocument('leads', id, { status });
    } catch (error) {
      alert('Failed to update lead status');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await removeDocument('leads', id);
    } catch (error) {
      alert('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}?subject=Valorniq Enterprise Solutions`;
  };

  return (
    <div id="leads-view" className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <header className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">CRM & Leads</h2>
          <p className="text-slate-500 text-sm">Targeted prospect management and pipeline tracking.</p>
        </header>

        <div className="flex gap-2">
          <button 
            id="btn-import-leads"
            onClick={() => setShowImportWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button 
            id="btn-history-leads"
            onClick={() => setShowImportHistory(!showImportHistory)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            📋 History
          </button>
          <button 
            id="btn-add-lead"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {showImportHistory && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
        >
          <ImportHistory moduleType="leads" />
        </motion.div>
      )}

      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            id="search-leads"
            type="text" 
            placeholder="Search leads by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-700 outline-none"
          />
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
           {(['all', 'new', 'contacted', 'qualified'] as const).map(s => (
             <button 
               key={s}
               id={`filter-${s}`}
               onClick={() => setFilterStatus(s)}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                 filterStatus === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               {s === 'all' ? 'All' : s}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 p-4 border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="pl-4">Name / Contact</div>
          <div>Status</div>
          <div>Value</div>
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
              className="grid grid-cols-5 p-4 items-center hover:bg-slate-50/80 transition-all group"
            >
              <div className="pl-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500 truncate">{lead.email}</p>
                </div>
              </div>

              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'contacted' ? 'bg-amber-100 text-amber-700' :
                  lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {lead.status}
                </span>
              </div>

              <div className="font-mono text-sm font-bold text-slate-900">
                ${(lead.estimatedValue || 0).toLocaleString()}
              </div>

              <div className="text-xs font-medium text-slate-500">
                {lead.source}
              </div>

              <div className="flex items-center justify-end gap-2 pr-4">
                <button 
                  id={`email-${lead.id}`}
                  onClick={() => lead.email && handleEmail(lead.email)}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <select 
                  id={`status-${lead.id}`}
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="text-xs font-bold border-none bg-slate-100 rounded-lg py-1 px-2 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                </select>
                <button 
                  id={`delete-${lead.id}`}
                  onClick={() => handleDeleteLead(lead.id)}
                  className="p-2 text-slate-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> 
                </button>
              </div>
            </motion.div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <Users className="w-12 h-12 text-slate-200 mx-auto" />
              <div>
                <p className="text-slate-900 font-bold">No leads found</p>
                <p className="text-slate-500 text-xs">Start by adding your first prospect or importing from CSV.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">New Lead</h3>
                <button 
                  id="close-add-lead"
                  onClick={() => setIsAdding(false)} 
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Name *</label>
                  <input 
                    id="input-lead-name"
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                    value={newLead.name}
                    onChange={e => setNewLead({...newLead, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Email</label>
                  <input 
                    id="input-lead-email"
                    type="email"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                    value={newLead.email}
                    onChange={e => setNewLead({...newLead, email: e.target.value})}
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Value ($)</label>
                    <input 
                      id="input-lead-value"
                      type="number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                      value={newLead.estimatedValue}
                      onChange={e => setNewLead({...newLead, estimatedValue: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1">Source</label>
                    <select 
                      id="input-lead-source"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-900 outline-none"
                      value={newLead.source}
                      onChange={e => setNewLead({...newLead, source: e.target.value})}
                    >
                      <option>Website</option>
                      <option>Referral</option>
                      <option>LinkedIn</option>
                      <option>Cold Outreach</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    id="btn-cancel-lead"
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    id="btn-save-lead"
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-slate-900 rounded-lg text-sm font-bold text-white hover:bg-slate-800"
                  >
                    Create Lead
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showImportWizard && (
          <ImportWizard 
            moduleType="leads"
            onClose={() => setShowImportWizard(false)}
            onImportComplete={() => {
              setShowImportWizard(false);
              setShowImportHistory(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadsView;
