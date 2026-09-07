import React, { useState } from 'react';
import { Users, Shield, Laptop, Check, HelpCircle, ToggleLeft, ToggleRight, Activity, Search, Filter, Download, Terminal, ShieldAlert, BadgeInfo, Plus } from 'lucide-react';
import { User, ActivityLog } from '../types';

interface UserManagementViewProps {
  currentUser: User | null;
  team: User[];
  logs: ActivityLog[];
  onAddTeamMember: (member: Omit<User, 'id'>) => void;
  onUpdateRole: (id: string, role: User['role']) => void;
  onToggleMfa: (id: string) => void;
  isDark: boolean;
  onAddActivityLog?: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export default function UserManagementView({
  currentUser,
  team,
  logs,
  onAddTeamMember,
  onUpdateRole,
  onToggleMfa,
  isDark,
  onAddActivityLog
}: UserManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'membership' | 'matrix' | 'devices' | 'audit_logs'>('membership');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [logSearch, setLogSearch] = useState('');
  const [logModule, setLogModule] = useState<'All' | 'CRM' | 'Finance' | 'User' | 'System' | 'Inventory' | 'Sales' | 'AI'>('All');
  const [isSimulating, setIsSimulating] = useState(false);

  // New Member inputs
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemRole, setNewMemRole] = useState<'Admin' | 'Manager' | 'Contributor'>('Contributor');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemEmail) return;

    onAddTeamMember({
      name: newMemName,
      email: newMemEmail,
      role: newMemRole,
      status: 'Active',
      lastActive: 'Just Now',
      device: 'Workstation · TLS Verified',
      location: 'Tenant Boundary',
      mfaEnabled: false
    });

    setNewMemName('');
    setNewMemEmail('');
    setNewMemRole('Contributor');
    setShowAddMemberModal(false);
  };

  // Roles Matrix permissions
  const [permissions, setPermissions] = useState({
    admin: { crm_read: true, crm_write: true, exp_signoff: true, infra_deploy: true },
    manager: { crm_read: true, crm_write: true, exp_signoff: false, infra_deploy: false },
    contributor: { crm_read: true, crm_write: false, exp_signoff: false, infra_deploy: false }
  });

  const togglePermission = (role: 'admin' | 'manager' | 'contributor', key: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !((prev[role] as any)[key])
      }
    }));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
                          log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
                          (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));
    const matchesModule = logModule === 'All' ? true : log.module === logModule;
    return matchesSearch && matchesModule;
  });

  const exportLogsToCSV = () => {
    const headers = ['Log ID', 'Agent', 'Action', 'Module', 'Timestamp', 'Details'].join(',');
    const rows = filteredLogs.map(l => `"${l.id}","${l.user}","${l.action}","${l.module}","${l.timestamp}","${l.details || ''}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `valorniq_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">Team & Access Control (RBAC)</h2>
          <p className="text-xs text-[#888] mt-1">
            Tenant members, role-based authorization policies, device compliance registries, and audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'membership' && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium flex items-center shadow-lg shadow-indigo-900/20 cursor-pointer transition"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-[#111] border border-[#222] rounded-xl max-w-max text-xs">
        <button
          onClick={() => setActiveTab('membership')}
          className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'membership'
              ? 'bg-[#222] text-white shadow-sm'
              : 'text-[#666] hover:text-[#AAA]'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Workspace Roster ({team.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-[#222] text-white shadow-sm'
              : 'text-[#666] hover:text-[#AAA]'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>Permissions Grid</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'devices'
              ? 'bg-[#222] text-white shadow-sm'
              : 'text-[#666] hover:text-[#AAA]'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Laptop className="h-3.5 w-3.5" />
            <span>Device Registry</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'audit_logs'
              ? 'bg-[#222] text-white shadow-sm'
              : 'text-[#666] hover:text-[#AAA]'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Audit Trail ({logs.length})</span>
          </div>
        </button>
      </div>

      <div className="mt-4">
        {/* Tab 1: Membership Roster */}
        {activeTab === 'membership' && (
          <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3.5">User Profile</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">MFA Protection</th>
                  <th className="p-3.5">Last Active</th>
                  <th className="p-3.5">Role Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
                {team.map((mem) => (
                  <tr key={mem.id} className="hover:bg-[#141414] transition">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 font-medium flex items-center justify-center border border-indigo-500/20">
                          {mem.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white capitalize">
                            {mem.name} {currentUser?.id === mem.id && <span className="text-[9px] bg-[#222] px-1.5 py-0.5 rounded text-[#888] ml-1">You</span>}
                          </div>
                          <div className="text-[10px] text-[#666] font-mono">{mem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        mem.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        mem.role === 'Manager' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-[#1A1A1A] text-[#888] border border-[#2A2A2A]'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" /> {mem.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => onToggleMfa(mem.id)}
                        className={`inline-flex items-center space-x-1.5 text-xs font-medium cursor-pointer hover:underline transition ${
                          mem.mfaEnabled ? 'text-emerald-400' : 'text-[#666]'
                        }`}
                      >
                        {mem.mfaEnabled ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>MFA Enforced</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Unenrolled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 text-[#888] font-mono text-[11px]">
                      {mem.lastActive}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={mem.role}
                        onChange={(e) => onUpdateRole(mem.id, e.target.value as User['role'])}
                        className="bg-[#141414] border border-[#222] rounded px-2 py-0.5 text-indigo-400 font-medium text-xs focus:outline-none cursor-pointer"
                        disabled={currentUser?.id === mem.id && currentUser?.role === 'Admin'}
                      >
                        <option value="Admin" className="bg-[#141414] text-white">Admin</option>
                        <option value="Manager" className="bg-[#141414] text-white">Manager</option>
                        <option value="Contributor" className="bg-[#141414] text-white">Contributor</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Permissions Matrix */}
        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#222] bg-[#0F0F0F] text-xs text-[#888]">
              🛡️ <strong className="text-white">RBAC Policy Enforcement:</strong> Toggling attributes updates the authorization scope for that role. The backend strictly validates these permissions independently.
            </div>

            <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">Functional Capability</th>
                    <th className="p-3.5 text-center">Admin</th>
                    <th className="p-3.5 text-center">Manager</th>
                    <th className="p-3.5 text-center">Contributor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
                  <tr className="hover:bg-[#141414]">
                    <td className="p-3.5 font-medium text-white">Read Customer Data (CRM Read)</td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('admin', 'crm_read')} className="cursor-pointer">
                        {permissions.admin.crm_read ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('manager', 'crm_read')} className="cursor-pointer">
                        {permissions.manager.crm_read ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('contributor', 'crm_read')} className="cursor-pointer">
                        {permissions.contributor.crm_read ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#141414]">
                    <td className="p-3.5 font-medium text-white">Create & Update Opportunities (CRM Write)</td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('admin', 'crm_write')} className="cursor-pointer">
                        {permissions.admin.crm_write ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('manager', 'crm_write')} className="cursor-pointer">
                        {permissions.manager.crm_write ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('contributor', 'crm_write')} className="cursor-pointer">
                        {permissions.contributor.crm_write ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#141414]">
                    <td className="p-3.5 font-medium text-white">Approve Corporate Expenses (Finance Signoff)</td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('admin', 'exp_signoff')} className="cursor-pointer">
                        {permissions.admin.exp_signoff ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('manager', 'exp_signoff')} className="cursor-pointer">
                        {permissions.manager.exp_signoff ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('contributor', 'exp_signoff')} className="cursor-pointer">
                        {permissions.contributor.exp_signoff ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#141414]">
                    <td className="p-3.5 font-medium text-white">Deploy System & Integrations Config</td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('admin', 'infra_deploy')} className="cursor-pointer">
                        {permissions.admin.infra_deploy ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('manager', 'infra_deploy')} className="cursor-pointer">
                        {permissions.manager.infra_deploy ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button onClick={() => togglePermission('contributor', 'infra_deploy')} className="cursor-pointer">
                        {permissions.contributor.infra_deploy ? <ToggleRight className="h-6 w-6 text-indigo-400 inline" /> : <ToggleLeft className="h-6 w-6 text-[#444] inline" />}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Devices */}
        {activeTab === 'devices' && (
          <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-3.5">User Identity</th>
                  <th className="p-3.5">Device Platform</th>
                  <th className="p-3.5">Session Action</th>
                  <th className="p-3.5">Time Logged</th>
                  <th className="p-3.5 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1] font-mono text-[11px]">
                {logs.filter(l => l.module === 'User' || l.module === 'System').slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-[#141414] transition">
                    <td className="p-3.5 font-medium text-white font-sans">
                      {log.user}
                    </td>
                    <td className="p-3.5 text-[#888]">MacBook Pro · Chrome</td>
                    <td className="p-3.5 font-sans text-[#AAA]">{log.action}</td>
                    <td className="p-3.5 text-[#666]">{log.timestamp}</td>
                    <td className="p-3.5 text-right font-sans">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111] p-3 rounded-xl border border-[#222]">
              <div className="flex-1 flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#555]" />
                  <input
                    type="text"
                    placeholder="Search logs by action or user..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#222] bg-[#141414] text-white placeholder-[#555] text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#222] rounded-lg px-2.5 py-1.5 text-xs text-[#888]">
                  <Filter className="h-3 w-3 text-[#555]" />
                  <span>Module:</span>
                  <select
                    value={logModule}
                    onChange={(e) => setLogModule(e.target.value as any)}
                    className="focus:outline-none bg-transparent cursor-pointer font-medium text-indigo-400"
                  >
                    <option value="All" className="bg-[#141414]">All</option>
                    <option value="CRM" className="bg-[#141414]">CRM</option>
                    <option value="Finance" className="bg-[#141414]">Finance</option>
                    <option value="User" className="bg-[#141414]">User</option>
                    <option value="System" className="bg-[#141414]">System</option>
                    <option value="Inventory" className="bg-[#141414]">Inventory</option>
                    <option value="Sales" className="bg-[#141414]">Sales</option>
                  </select>
                </div>
              </div>

              <button
                onClick={exportLogsToCSV}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center gap-1.5 text-xs cursor-pointer transition ml-auto"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1] font-mono text-[11px]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#666] font-sans">
                        No logs match current query
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#141414] transition">
                        <td className="p-3 font-medium text-white font-sans capitalize">{log.user}</td>
                        <td className="p-3 font-sans text-[#AAA]">{log.action}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded font-sans ${
                            log.module === 'CRM' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            log.module === 'Finance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            log.module === 'User' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {log.module}
                          </span>
                        </td>
                        <td className="p-3 text-[#666]">{log.timestamp}</td>
                        <td className="p-3 text-right text-[#888] font-sans italic truncate max-w-xs">{log.details || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Invite Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Add Team Member</h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Richard Hendricks"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Email</label>
                <input
                  required
                  type="email"
                  placeholder="richard@piedpiper.com"
                  value={newMemEmail}
                  onChange={(e) => setNewMemEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Role</label>
                <select
                  value={newMemRole}
                  onChange={(e) => setNewMemRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Contributor" className="bg-[#141414]">Contributor (Scoped CRM Access)</option>
                  <option value="Manager" className="bg-[#141414]">Manager (Edit Pipeline & Finances)</option>
                  <option value="Admin" className="bg-[#141414]">Admin (Full Control)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
