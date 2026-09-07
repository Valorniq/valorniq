import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Trash2, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Activity
} from 'lucide-react';
import { AutomationWorkflow } from '../types';

interface WorkflowsViewProps {
  workflows: AutomationWorkflow[];
  onAddWorkflow: (workflow: Omit<AutomationWorkflow, 'id'>) => void;
  onToggleWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
  onTriggerSimulation: (workflow: AutomationWorkflow) => void;
  isDark: boolean;
}

export default function WorkflowsView({
  workflows,
  onAddWorkflow,
  onToggleWorkflow,
  onDeleteWorkflow,
  onTriggerSimulation,
  isDark
}: WorkflowsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'logs'>('all');
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [triggerModule, setTriggerModule] = useState<AutomationWorkflow['triggerModule']>('CRM');
  const [triggerEvent, setTriggerEvent] = useState('lead.stage_changed == "Won"');
  const [conditionDescription, setConditionDescription] = useState('When a deal reaches Won stage and exceeds threshold value');
  const [actionOne, setActionOne] = useState('Generate invoice in Finance module');
  const [actionTwo, setActionTwo] = useState('Send notification to Slack sales-feed');

  const filteredWorkflows = workflows.filter(w => {
    if (activeTab === 'active') return w.isActive;
    return true;
  });

  const totalExecutions = workflows.reduce((acc, w) => acc + w.executionCount, 0);

  const handleSimulate = (w: AutomationWorkflow) => {
    setSimulatingId(w.id);
    onTriggerSimulation(w);
    setTimeout(() => {
      setSimulatingId(null);
    }, 800);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const actions = [actionOne];
    if (actionTwo.trim()) actions.push(actionTwo);

    onAddWorkflow({
      name,
      triggerModule,
      triggerEvent,
      conditionDescription,
      actions,
      isActive: true,
      executionCount: 0,
      lastTriggered: 'Just created'
    });

    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium tracking-tight text-white">Workflow Automation Engine</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              No-Code Engine
            </span>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Event-driven triggers, cross-module business rules, automated invoicing, and low-latency webhook dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#111] border border-[#222] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === 'all' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
              }`}
            >
              All Workflows ({workflows.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTab === 'active' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
              }`}
            >
              Active ({workflows.filter(w => w.isActive).length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-900/20 border border-indigo-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Configured Rules</span>
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-semibold text-white">{workflows.length} Workflows</div>
          <div className="text-[10px] text-emerald-400/90">{workflows.filter(w => w.isActive).length} active event triggers</div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Event Executions</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-white">{totalExecutions.toLocaleString()}</div>
          <div className="text-[10px] text-[#666]">Automated actions dispatched without manual entry</div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Reliability Guarantee</span>
            <ShieldCheck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-semibold text-white">99.98% SLA</div>
          <div className="text-[10px] text-[#666]">Zero-drop queued event architecture</div>
        </div>
      </div>

      {/* Workflows Cards List */}
      <div className="space-y-4">
        {filteredWorkflows.map(w => (
          <div
            key={w.id}
            className={`p-5 rounded-xl border transition-all shadow-xl ${
              w.isActive 
                ? 'border-[#2a2a2a] bg-[#111]' 
                : 'border-[#1c1c1c] bg-[#0d0d0d] opacity-75'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  w.isActive ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'bg-[#181818] text-[#666]'
                }`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{w.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-indigo-400 border border-[#262626]">
                      {w.triggerModule}
                    </span>
                    <span className="text-[11px] text-[#666]">{w.conditionDescription}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSimulate(w)}
                  disabled={!w.isActive || simulatingId === w.id}
                  className="px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:bg-[#1c1c1c] text-[#d1d1d1] hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
                  title="Test-fire this workflow event immediately"
                >
                  <Play className={`h-3 w-3 ${simulatingId === w.id ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                  <span>{simulatingId === w.id ? 'Executing...' : 'Test Run'}</span>
                </button>

                <button
                  onClick={() => onToggleWorkflow(w.id)}
                  className="p-1 text-[#888] hover:text-white transition cursor-pointer"
                  title={w.isActive ? 'Disable rule' : 'Enable rule'}
                >
                  {w.isActive ? (
                    <ToggleRight className="h-6 w-6 text-indigo-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-[#444]" />
                  )}
                </button>

                <button
                  onClick={() => onDeleteWorkflow(w.id)}
                  className="p-1 text-[#666] hover:text-rose-400 transition cursor-pointer"
                  title="Delete workflow"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Visual Trigger -> Actions Pipeline */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#222] font-mono text-[11px] text-amber-400 shrink-0">
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                <span>Trigger: {w.triggerEvent}</span>
              </div>

              <ArrowRight className="hidden md:block h-4 w-4 text-[#444] shrink-0" />

              <div className="flex items-center gap-2 flex-wrap">
                {w.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#262626] text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-[#666] pt-2 border-t border-[#1a1a1a]">
              <span>Dispatched {w.executionCount} times</span>
              <span>Last event: {w.lastTriggered || 'Idle'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* New Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-xl border border-[#222] bg-[#0F0F0F] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="font-medium text-base text-white">Create Automation Workflow</h3>
                <p className="text-[11px] text-[#888]">Define trigger event logic and target actions.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#666] hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Workflow Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asset Amortization Monthly Closing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Source Module</label>
                  <select
                    value={triggerModule}
                    onChange={(e) => setTriggerModule(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRM">CRM</option>
                    <option value="Finance">Finance</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Assets">Assets</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Event Trigger Syntax</label>
                  <input
                    type="text"
                    required
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-amber-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Condition Description</label>
                <input
                  type="text"
                  required
                  value={conditionDescription}
                  onChange={(e) => setConditionDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-[#666]">Action Steps (Sequential)</label>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#181818] text-[#888] flex items-center justify-center text-[10px] font-mono">1</span>
                  <input
                    type="text"
                    required
                    value={actionOne}
                    onChange={(e) => setActionOne(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#181818] text-[#888] flex items-center justify-center text-[10px] font-mono">2</span>
                  <input
                    type="text"
                    placeholder="Optional second action step..."
                    value={actionTwo}
                    onChange={(e) => setActionTwo(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#222] hover:bg-[#1A1A1A] text-[#888] hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer shadow-lg shadow-indigo-900/20"
                >
                  Save & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
