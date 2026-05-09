import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Archive, 
  Download, 
  Search, 
  Calendar, 
  FileJson, 
  Database,
  History,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ArchivesViewProps {
  sales: any[];
  leads: any[];
  products: any[];
}

const ArchivesView: React.FC<ArchivesViewProps> = ({ sales, leads, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const archiveRecords = [
    { 
      id: 'ARC-2024-Q1', 
      name: 'Q1 2024 Financial Ledger', 
      date: '2024-03-31', 
      size: '2.4 MB', 
      type: 'JSON', 
      status: 'sealed',
      items: 1240
    },
    { 
      id: 'ARC-2023-FY', 
      name: 'FY 2023 Comprehensive Audit', 
      date: '2023-12-31', 
      size: '14.8 MB', 
      type: 'PDF/JSON', 
      status: 'sealed',
      items: 45200
    },
    { 
      id: 'ARC-CRM-MAINT', 
      name: 'CRM Heritage Sync (Legacy)', 
      date: '2023-06-15', 
      size: '850 KB', 
      type: 'CSV', 
      status: 'available',
      items: 340
    },
    { 
      id: 'ARC-INV-SNAPSHOT', 
      name: 'Inventory Baseline Zero', 
      date: '2023-01-01', 
      size: '1.2 MB', 
      type: 'JSON', 
      status: 'sealed',
      items: 890
    }
  ];

  const handleDownload = (record: any) => {
    alert(`Decryption initiated for ${record.id}. The secure archive manifest is being prepared for download.`);
    
    const mockData = {
      archiveId: record.id,
      timestamp: record.date,
      metadata: {
        itemCount: record.items,
        extractionDate: new Date().toISOString()
      },
      content: "ENCRYPTED_DATA_STREAM"
    };

    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.id}_manifest.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredArchives = archiveRecords.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="archives-view" className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-full">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            System Archives
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-[10px] text-emerald-600 uppercase tracking-[0.2em] font-black">
              <Lock className="w-3 h-3" />
              Immutable
            </div>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Deep-storage historical ledgers and legacy datasets.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Infrastructure Notice: System restore requires L2 Admin clearance. Your request has been logged for high-tier verification.')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm"
          >
            <History className="w-3.5 h-3.5" />
            Restore Point
          </button>
          <button 
            onClick={() => alert(`State Snapshotted: Region GBL_CORE has been frozen and committed to the neural ledger. Record ID: SNAP-${new Date().getTime().toString().slice(-6)}`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-900/20"
          >
            Snapshot State
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Archives', value: '4 Assets', description: 'Verified integrity', icon: Database },
          { label: 'Storage Used', value: '19.25 MB', description: 'Cold tier storage', icon: Archive },
          { label: 'Last Sync', value: '2h ago', description: 'Global node consistency', icon: History },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
               <stat.icon className="w-6 h-6" />
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
               <p className="text-xl font-bold text-slate-900 leading-none mb-1">{stat.value}</p>
               <p className="text-[10px] text-slate-400 font-medium">{stat.description}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Archive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-50 flex items-center gap-4">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Search archives by name or hash..."
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none font-medium"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button 
                  onClick={() => alert('Archive Indexer: Advanced filtering for cold-storage assets is currently undergoing optimization. Basic query remains operational.')}
                  className="p-2 text-slate-400 hover:text-slate-900"
                >
                   <Filter className="w-4 h-4" />
                </button>
             </div>
             <div className="divide-y divide-slate-50">
               {filteredArchives.map((record, i) => (
                 <motion.div 
                   key={record.id}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="p-6 hover:bg-slate-50 transition-colors group flex items-center justify-between"
                 >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                        <FileJson className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{record.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.date}
                          </span>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{record.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         record.status === 'sealed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'
                       }`}>
                         {record.status}
                       </span>
                       <button 
                         onClick={() => handleDownload(record)}
                         className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
                       >
                         <Download className="w-4 h-4" />
                       </button>
                    </div>
                 </motion.div>
               ))}
             </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Live Data Sync</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">Current session state is active. A final snapshot will be generated upon logout for record integrity.</p>
                
                <div className="space-y-4">
                   {[
                     { label: 'Leads Payload', items: leads.length },
                     { label: 'Inventory State', items: products.length },
                     { label: 'Sales Ledger', items: sales.length },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between group/item">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover/item:text-slate-300 transition-colors">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{item.items}</span>
                          <ChevronRight className="w-3 h-3 text-indigo-500 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Security Protocol</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">End-to-End Encryption</p>
                    <p className="text-[10px] text-slate-400 mt-1">AES-256 GCM applied to all archive assets.</p>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivesView;
