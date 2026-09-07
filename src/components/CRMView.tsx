import React, { useState } from 'react';
import { 
  Briefcase, 
  Building2, 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  Plus,
  Sparkles,
  TrendingUp,
  Target,
  BarChart2
} from 'lucide-react';
import { Lead, Contact, Company } from '../types';
import { exportToCSV } from '../utils/csvExport';
import { SAMPLE_FORECASTS } from '../constants';

interface CRMViewProps {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onUpdateLeadStage: (id: string, stage: Lead['stage']) => void;
  onDeleteLead: (id: string) => void;
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  isDark: boolean;
}

export default function CRMView({
  leads,
  contacts,
  companies,
  onAddLead,
  onUpdateLeadStage,
  onDeleteLead,
  onAddContact,
  isDark
}: CRMViewProps) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts' | 'companies' | 'forecasting'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');

  // CSV Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [validationPreview, setValidationPreview] = useState<any[]>([]);
  
  // Sorting state for Contacts Ledger table
  const [contactSortField, setContactSortField] = useState<keyof Contact>('name');
  const [contactSortOrder, setContactSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleContactSort = (field: keyof Contact) => {
    if (contactSortField === field) {
      setContactSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setContactSortField(field);
      setContactSortOrder('asc');
    }
  };

  const renderSortIcon = (field: string, currentField: string, order: 'asc' | 'desc') => {
    if (field !== currentField) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-[#555] transition" />;
    }
    return order === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-indigo-400 transition" />
      : <ArrowDown className="h-3.5 w-3.5 text-indigo-400 transition" />;
  };

  const parseCSVData = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).map(line => line.trim());
      const nonEmptyLines = lines.filter(line => line.length > 0);
      if (nonEmptyLines.length < 2) {
        setCsvError('The CSV file appears to be empty or lacks data rows.');
        return;
      }

      const headers = nonEmptyLines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const titleIndex = headers.findIndex(h => /title|opportunity|deal|name/i.test(h));
      const companyIndex = headers.findIndex(h => /company|account|org/i.test(h));
      const valueIndex = headers.findIndex(h => /value|amount|est/i.test(h));
      const assignedIndex = headers.findIndex(h => /assigned|owner|rep/i.test(h));
      const contactIndex = headers.findIndex(h => /contact|person/i.test(h));
      const emailIndex = headers.findIndex(h => /email|mail/i.test(h));

      if (titleIndex === -1 || companyIndex === -1) {
        setCsvError('Required headers missing. Please include at least "Title" and "Company" in the header row.');
        return;
      }

      const parsedRecords: any[] = [];
      for (let i = 1; i < nonEmptyLines.length; i++) {
        const line = nonEmptyLines[i];
        const columns: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(cur.trim().replace(/^"|"$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        columns.push(cur.trim().replace(/^"|"$/g, ''));

        if (columns.length === 0 || !columns[titleIndex]) continue;

        const title = columns[titleIndex] || '';
        const company = columns[companyIndex] || 'Enterprise';
        const contactName = contactIndex !== -1 ? columns[contactIndex] || 'Primary Contact' : 'Primary Contact';
        const email = emailIndex !== -1 ? columns[emailIndex] || 'client@enterprise.com' : 'client@enterprise.com';
        const valueStr = valueIndex !== -1 ? columns[valueIndex].replace(/[^0-9]/g, '') : '25000';
        const value = Number(valueStr) || 25000;
        const assignedTo = assignedIndex !== -1 ? columns[assignedIndex] || 'Sales Rep' : 'Sales Rep';

        parsedRecords.push({
          title,
          company,
          contactName,
          email,
          value,
          stage: 'Lead' as const,
          confidence: 60,
          assignedTo
        });
      }

      if (parsedRecords.length === 0) {
        setCsvError('No valid rows could be extracted.');
      } else {
        setValidationPreview(parsedRecords);
        setCsvError(null);
      }
    } catch {
      setCsvError('Error occurred parsing CSV file.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          parseCSVData(evt.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        setCsvError('Please provide a valid .csv file.');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        parseCSVData(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const commitCSVImport = () => {
    if (validationPreview.length === 0) return;
    validationPreview.forEach(lead => onAddLead(lead));
    setValidationPreview([]);
    setCsvError(null);
    setShowImportModal(false);
  };

  // Modals state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // New Lead form inputs
  const [newLeadTitle, setNewLeadTitle] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadContact, setNewLeadContact] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadValue, setNewLeadValue] = useState(15000);
  const [newLeadConfidence, setNewLeadConfidence] = useState(50);
  const [newLeadAssigned, setNewLeadAssigned] = useState('Sarah Jenkins');

  // New Contact form inputs
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactCompany, setNewContactCompany] = useState('');
  const [newContactRole, setNewContactRole] = useState('');

  const stages: Lead['stage'][] = ['Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadTitle || !newLeadCompany) return;
    onAddLead({
      title: newLeadTitle,
      company: newLeadCompany,
      contactName: newLeadContact || 'Representative',
      email: newLeadEmail || 'contact@firm.com',
      value: Number(newLeadValue) || 10000,
      stage: 'Lead',
      confidence: Number(newLeadConfidence) || 50,
      assignedTo: newLeadAssigned
    });
    setNewLeadTitle('');
    setNewLeadCompany('');
    setNewLeadContact('');
    setNewLeadEmail('');
    setNewLeadValue(15000);
    setNewLeadConfidence(50);
    setShowAddLeadModal(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactEmail) return;
    onAddContact({
      name: newContactName,
      email: newContactEmail,
      phone: newContactPhone || '',
      company: newContactCompany || 'Enterprise',
      role: newContactRole || 'Account Owner',
      status: 'Active'
    });
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactCompany('');
    setNewContactRole('');
    setShowAddContactModal(false);
  };

  const filteredLeads = leads.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let valA = (a[contactSortField] || '') as string;
    let valB = (b[contactSortField] || '') as string;
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return contactSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return contactSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleExportCSV = () => {
    if (activeTab === 'pipeline') {
      exportToCSV(filteredLeads, {
        title: 'Opportunity Title',
        company: 'Company Account',
        contactName: 'Contact Person',
        email: 'Contact Email',
        value: 'Estimated Deal Value ($)',
        stage: 'Pipeline Stage',
        confidence: 'Confidence Score (%)',
        assignedTo: 'Lead Owner',
        createdAt: 'Created Date'
      }, 'valorniq_crm_leads');
    } else if (activeTab === 'contacts') {
      exportToCSV(filteredContacts, {
        name: 'Client Name',
        company: 'Organization',
        email: 'Email',
        phone: 'Phone',
        role: 'Role Title',
        status: 'Status',
        createdAt: 'Created Date'
      }, 'valorniq_crm_contacts');
    } else if (activeTab === 'companies') {
      exportToCSV(filteredCompanies, {
        name: 'Company Name',
        domain: 'Domain',
        industry: 'Industry',
        size: 'Company Size',
        revenue: 'ARR Value'
      }, 'valorniq_crm_companies');
    }
  };

  return (
    <div className="space-y-6">
      {/* CRM Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">CRM & Pipeline Management</h2>
          <p className="text-xs text-[#888] mt-1">
            Accounts, deal pipelines, probability matrices, and client contact directories.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-xs font-medium flex items-center text-[#d1d1d1] shadow-sm cursor-pointer transition"
          >
            <Download className="h-4 w-4 mr-1.5 text-indigo-400" /> Export CSV
          </button>

          {activeTab === 'pipeline' && (
            <button
              onClick={() => {
                setValidationPreview([]);
                setCsvError(null);
                setShowImportModal(true);
              }}
              className="px-3.5 py-2 rounded-lg border border-dashed border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-medium flex items-center text-indigo-300 shadow-sm cursor-pointer transition"
            >
              <Upload className="h-4 w-4 mr-1.5" /> Import CSV
            </button>
          )}

          {activeTab === 'pipeline' ? (
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium flex items-center shadow-lg shadow-indigo-900/20 cursor-pointer transition"
            >
              <Plus className="h-4 w-4 mr-1.5" /> New Deal
            </button>
          ) : activeTab === 'contacts' ? (
            <button
              onClick={() => setShowAddContactModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium flex items-center shadow-lg shadow-indigo-900/20 cursor-pointer transition"
            >
              <UserPlus className="h-4 w-4 mr-1.5" /> Add Contact
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1 p-1 bg-[#111] border border-[#222] rounded-xl max-w-max">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-[#222] text-white shadow-xs font-medium'
                : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            Pipeline Stages ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#222] text-white shadow-xs font-medium'
                : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            Contacts Ledger ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-[#222] text-white shadow-xs font-medium'
                : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'forecasting'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs font-medium'
                : 'text-[#666] hover:text-[#aaa]'
            }`}
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>AI Sales Forecasting</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 border border-[#222] px-3 py-1.5 rounded-xl w-full sm:max-w-xs bg-[#111] text-[#d1d1d1]">
          <Search className="h-4 w-4 text-[#555] shrink-0" />
          <input
            type="text"
            placeholder="Search deals, contacts, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-xs text-white placeholder-[#555]"
          />
        </div>
      </div>

      {/* View Content */}
      <div className="mt-4">
        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {stages.slice(0, 4).map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage);
              const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);

              return (
                <div 
                  key={stage} 
                  className="p-4 rounded-xl border border-[#222] bg-[#0F0F0F] shrink-0 min-h-[360px] flex flex-col shadow-lg"
                >
                  <div className="flex items-center justify-between border-b pb-2 mb-3 border-[#222]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                      <h4 className="font-medium text-xs text-white">{stage}</h4>
                    </div>
                    <span className="text-[10px] text-[#888] font-mono bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#666] uppercase font-bold tracking-wider mb-3">
                    Valuation: <span className="text-indigo-400 font-mono">${stageValue.toLocaleString()}</span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageLeads.length === 0 ? (
                      <p className="text-[11px] text-[#555] text-center py-10">No deals in this stage</p>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3.5 rounded-lg border border-[#222] bg-[#141414] hover:border-[#333] transition text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h5 className="font-medium text-white">{lead.title}</h5>
                              <button
                                onClick={() => onDeleteLead(lead.id)}
                                className="text-[#555] hover:text-rose-400 p-0.5 transition cursor-pointer"
                                title="Remove deal"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-[11px] text-[#888] font-mono block mt-0.5">{lead.company}</span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-medium font-mono text-white text-xs">
                              ${lead.value.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-medium bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400">
                              {lead.confidence}% Conf.
                            </span>
                          </div>

                          <div className="border-t border-[#222] mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                            <span className="text-[#666] truncate max-w-[60%]">Rep: {lead.assignedTo}</span>
                            <select
                              value={lead.stage}
                              onChange={(e) => onUpdateLeadStage(lead.id, e.target.value as Lead['stage'])}
                              className="bg-[#1A1A1A] border border-[#333] text-indigo-300 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer text-[10px]"
                            >
                              {stages.map(stg => (
                                <option key={stg} value={stg} className="bg-[#141414] text-white">{stg}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}

            {/* Won Pipeline Summary Block */}
            <div className="p-4 rounded-xl border border-[#222] bg-[#0F0F0F] min-h-[360px] flex flex-col justify-between shadow-lg">
              <div>
                <h4 className="font-medium text-xs text-white flex items-center mb-1">
                  <CheckCircle className="h-4 w-4 mr-1.5 text-emerald-400" /> Closed Won Deals
                </h4>
                <p className="text-[10px] text-[#666] pb-3 border-b border-[#222]">
                  Executed contracts ready for invoicing
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mt-3">
                  {filteredLeads.filter(l => l.stage === 'Won').length === 0 ? (
                    <p className="text-[11px] text-[#555] text-center py-10">Close deals to populate</p>
                  ) : (
                    filteredLeads.filter(l => l.stage === 'Won').map(lead => (
                      <div key={lead.id} className="p-3 rounded-lg border border-[#222] bg-[#141414] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{lead.title}</p>
                          <span className="text-[10px] text-[#888] font-mono">{lead.company}</span>
                        </div>
                        <span className="font-medium font-mono text-emerald-400">${lead.value.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-400 mt-4">
                <span className="text-[10px] uppercase font-bold text-emerald-500/80 block">Total Won Revenue</span>
                <strong className="text-base font-medium font-mono text-emerald-300">
                  ${filteredLeads.filter(l => l.stage === 'Won').reduce((sum, l) => sum + l.value, 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Contacts Ledger */}
        {activeTab === 'contacts' && (
          <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleContactSort('name')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Contact Name</span>
                      {renderSortIcon('name', contactSortField, contactSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleContactSort('company')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Organization</span>
                      {renderSortIcon('company', contactSortField, contactSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleContactSort('email')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Email & Phone</span>
                      {renderSortIcon('email', contactSortField, contactSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleContactSort('role')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Role</span>
                      {renderSortIcon('role', contactSortField, contactSortOrder)}
                    </div>
                  </th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
                {sortedContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#666]">
                      No contacts registered yet
                    </td>
                  </tr>
                ) : (
                  sortedContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-[#141414] transition">
                      <td className="p-3.5 font-medium text-white capitalize">
                        {contact.name}
                      </td>
                      <td className="p-3.5 flex items-center">
                        <Building2 className="h-3.5 w-3.5 text-[#666] mr-1.5" />
                        <span className="text-[#AAA]">{contact.company}</span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div className="text-white">{contact.email}</div>
                        {contact.phone && <div className="text-[#666]">{contact.phone}</div>}
                      </td>
                      <td className="p-3.5 text-[#AAA]">{contact.role}</td>
                      <td className="p-3.5">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-500/20">
                          {contact.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Companies */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.length === 0 ? (
              <p className="col-span-full p-8 text-center text-[#666]">No company accounts listed</p>
            ) : (
              filteredCompanies.map((comp) => (
                <div 
                  key={comp.id} 
                  className="p-5 rounded-xl border border-[#222] bg-[#111] flex flex-col justify-between shadow-xl hover:border-indigo-500/40 transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-white">{comp.name}</h4>
                        <span className="text-xs text-indigo-400 font-mono block mt-0.5">{comp.domain}</span>
                      </div>
                      <Building2 className="h-5 w-5 text-[#666]" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-[#888]">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-[#555]">Sector</span>
                        <span className="font-medium text-[#d1d1d1]">{comp.industry}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-[#555]">Headcount</span>
                        <span className="font-medium text-[#d1d1d1]">{comp.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#222] mt-4 pt-3 flex items-center justify-between text-xs">
                    <span className="text-[#666]">ARR Valuation</span>
                    <span className="font-medium font-mono text-white">${comp.revenue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            {/* Header / Intro banner */}
            <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">ARIS Predictive Pipeline & Quota Modeling</h3>
                  <p className="text-xs text-[#888] mt-0.5">
                    Machine-learning weighted forecast combining historic win-velocity, contract size, and multi-tenant deal telemetry.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                Model: Valorniq Quota AI
              </span>
            </div>

            {/* Quarterly Forecast Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {SAMPLE_FORECASTS.map((fc, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#222] pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-indigo-400" />
                      <h4 className="font-semibold text-white text-sm">{fc.quarter}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {fc.aiConfidenceScore}% AI Confidence
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#888]">Weighted Pipeline:</span>
                      <span className="font-mono font-semibold text-white">${fc.weightedPipeline.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888]">Predicted Won ARR:</span>
                      <span className="font-mono font-bold text-emerald-400">${fc.predictedWon.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888]">Commit Target:</span>
                      <span className="font-mono text-sky-400">${fc.commitTarget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888]">Best Case Scenario:</span>
                      <span className="font-mono text-[#aaa]">${fc.bestCase.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress bar towards commit */}
                  <div className="space-y-1 pt-2 border-t border-[#1c1c1c]">
                    <div className="flex justify-between text-[10px] text-[#666]">
                      <span>Attainment Ratio</span>
                      <span className="text-white font-mono">{Math.round((fc.predictedWon / fc.commitTarget) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#1e1e1e] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((fc.predictedWon / fc.commitTarget) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key anchor deals */}
                  <div className="space-y-1 text-[11px] pt-2 border-t border-[#1c1c1c]">
                    <span className="text-[10px] uppercase font-bold text-[#555] block">Anchor Opportunities</span>
                    {fc.keyDeals.map((d, dIdx) => (
                      <div key={dIdx} className="text-[#bbb] flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block shrink-0"></span>
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Conversion Efficiency Breakdown */}
            <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-3">
              <h4 className="font-medium text-xs text-white uppercase tracking-wider">Active Pipeline Stage Velocity</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                  <div className="text-[#888] text-[10px] uppercase font-semibold">Total Pipeline Value</div>
                  <div className="text-lg font-bold text-white font-mono mt-1">
                    ${leads.reduce((s, l) => s + l.value, 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#666]">{leads.length} active opportunities</div>
                </div>

                <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                  <div className="text-[#888] text-[10px] uppercase font-semibold">Weighted Pipeline</div>
                  <div className="text-lg font-bold text-indigo-400 font-mono mt-1">
                    ${Math.round(leads.reduce((s, l) => s + (l.value * (l.confidence / 100)), 0)).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#666]">Factoring deal confidence %</div>
                </div>

                <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                  <div className="text-[#888] text-[10px] uppercase font-semibold">Average Deal Size</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    ${leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.value, 0) / leads.length).toLocaleString() : '0'}
                  </div>
                  <div className="text-[10px] text-[#666]">Per identified opportunity</div>
                </div>

                <div className="p-3 rounded-lg bg-[#141414] border border-[#222]">
                  <div className="text-[#888] text-[10px] uppercase font-semibold">Avg Win Probability</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                    {leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.confidence, 0) / leads.length) : 0}%
                  </div>
                  <div className="text-[10px] text-[#666]">Across active pipeline</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add Opportunity */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Add Sales Opportunity</h3>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Opportunity Title</label>
                <input
                  required
                  type="text"
                  placeholder="Enterprise License Expansion"
                  value={newLeadTitle}
                  onChange={(e) => setNewLeadTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Company Account</label>
                  <input
                    required
                    type="text"
                    placeholder="Acme Corp"
                    value={newLeadCompany}
                    onChange={(e) => setNewLeadCompany(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="Liam Vance"
                    value={newLeadContact}
                    onChange={(e) => setNewLeadContact(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    value={newLeadValue}
                    onChange={(e) => setNewLeadValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Confidence (%)</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    value={newLeadConfidence}
                    onChange={(e) => setNewLeadConfidence(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Contact */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Add Contact Person</h3>
              <button 
                onClick={() => setShowAddContactModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Elena Rostova"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Direct Email</label>
                <input
                  required
                  type="email"
                  placeholder="elena@company.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 555-019-28"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Company</label>
                  <input
                    type="text"
                    placeholder="Stripe"
                    value={newContactCompany}
                    onChange={(e) => setNewContactCompany(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="VP Procurement"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-medium text-sm text-white">Batch Import Opportunities (CSV)</h3>
                  <p className="text-[10px] text-[#666]">Import deal pipelines from external CRM exports</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setValidationPreview([]);
                  setCsvError(null);
                }}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {csvError && (
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg flex items-start space-x-2 border border-rose-500/20 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{csvError}</p>
              </div>
            )}

            {validationPreview.length === 0 ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-3 transition ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-[#2A2A2A] bg-[#111]'
                }`}
              >
                <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-xs">
                  <p className="font-medium text-sm text-white">Drag and drop your CRM CSV file here</p>
                  <p className="text-[#666] text-[11px] mt-0.5">Headers required: Title, Company (optional: Value, Assigned, Contact, Email)</p>
                </div>
                
                <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20">
                  Browse File
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-xs font-medium text-emerald-400">
                  <span>✓ {validationPreview.length} records ready for import</span>
                  <button 
                    onClick={() => setValidationPreview([])}
                    className="text-[#888] hover:text-white font-normal transition"
                  >
                    Clear & reload
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-[#222] bg-[#111] rounded-lg p-2 font-mono text-[11px]">
                  {validationPreview.map((rec, i) => (
                    <div key={i} className="py-1 border-b border-[#222] flex justify-between">
                      <span className="font-sans font-medium text-[#d1d1d1]">{rec.title} ({rec.company})</span>
                      <span className="text-emerald-400 font-mono">${rec.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#222] flex justify-end space-x-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setValidationPreview([]);
                  setCsvError(null);
                }}
                className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={validationPreview.length === 0}
                onClick={commitCSVImport}
                className="px-4 py-2 font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 cursor-pointer shadow-lg shadow-indigo-900/20 transition"
              >
                Import {validationPreview.length} Deals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
