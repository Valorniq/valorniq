import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Cpu, 
  ChevronRight,
  Building2,
  Boxes,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface StrategicRoadmapViewProps {
  isDark: boolean;
  onNavigateToModule?: (moduleId: string) => void;
}

export default function StrategicRoadmapView({
  isDark,
  onNavigateToModule
}: StrategicRoadmapViewProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'status' | 'moat' | 'sprints'>('matrix');

  const comparisonData = [
    {
      category: 'Core Platform',
      mvp: 'Multi-tenant SaaS Foundation',
      final: 'Fully Distributed, Scalable Cloud + Optional Self-Hosting',
      status: 'Delivered in Valorniq 3.0 (Multi-Tenant Isolate)',
      module: 'settings'
    },
    {
      category: 'CRM',
      mvp: 'Contacts, Leads, Pipeline Tracking',
      final: 'AI-driven Sales Forecasting, Automation Workflows',
      status: 'Delivered in Valorniq 3.0 (Pipelines + ARIS Forecast)',
      module: 'crm'
    },
    {
      category: 'ERP (Finance)',
      mvp: 'Invoicing, Basic Accounting, Payments',
      final: 'Full Financial Suite: Tax Automation, Multi-Currency, Forecasting, Compliance',
      status: 'Delivered in Valorniq 3.0 (Multi-Currency + Ledgers)',
      module: 'finance'
    },
    {
      category: 'Asset Tracking',
      mvp: 'Basic Equipment & Fixed Assets',
      final: 'Non-Monetary Assets, Digital IP, Fleet, In-Kind Nonprofit Contributions',
      status: 'Delivered in Valorniq 3.0 (Non-Monetary & Grants)',
      module: 'assets'
    },
    {
      category: 'Inventory',
      mvp: 'Basic Stock Tracking',
      final: 'Real-time Supply Chain Optimization, Predictive Restocking',
      status: 'Delivered in Valorniq 3.0 (SKUs, Reorder Points, Dispatch)',
      module: 'inventory'
    },
    {
      category: 'User Management',
      mvp: 'Roles & Permissions',
      final: 'Fine-grained RBAC, Audit Logs, Compliance Layers (SOC2)',
      status: 'Delivered in Valorniq 3.0 (Audit Trail & MFA)',
      module: 'users'
    },
    {
      category: 'Dashboarding',
      mvp: 'Static Dashboards',
      final: 'Custom Analytics, AI Insights, Real-time Data Pipelines',
      status: 'Delivered in Valorniq 3.0 (Custom Widget Metrics)',
      module: 'dashboard'
    },
    {
      category: 'Integrations',
      mvp: 'Email + Basic APIs',
      final: 'Marketplace of Plugins, 3rd-Party Integrations (Stripe, SAP, Slack)',
      status: 'Delivered in Valorniq 3.0 (Webhooks & API Keys)',
      module: 'integrations'
    },
    {
      category: 'UI/UX',
      mvp: 'Functional Admin Interface',
      final: 'Highly Polished, Customizable Workspace UI (Anti-Slop Design)',
      status: 'Delivered in Valorniq 3.0 (High-Contrast Obsidian Theme)',
      module: 'dashboard'
    },
    {
      category: 'Automation',
      mvp: 'Minimal (Manual Workflows)',
      final: 'Full Workflow Engine + No-Code Automation Builder',
      status: 'Delivered in Valorniq 3.0 (Event Triggers & Action Simulator)',
      module: 'automation'
    },
    {
      category: 'AI Capabilities',
      mvp: 'None / Minimal',
      final: 'Embedded AI Copilots for Operations, Finance, and CRM (ARIS)',
      status: 'Delivered in Valorniq 3.0 (Server-Side Function Calling)',
      module: 'dashboard'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium tracking-tight text-white">Strategic Roadmap & Competitive Moat</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Odoo Contender · MVP to Final
            </span>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Executive status update, functional scope comparison table, and architectural differentiation against legacy monolithic ERPs.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#111] border border-[#222] rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
              activeTab === 'matrix' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            Scope Matrix
          </button>
          <button
            onClick={() => setActiveTab('moat')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
              activeTab === 'moat' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            Odoo Moat
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
              activeTab === 'status' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            Executive Status
          </button>
          <button
            onClick={() => setActiveTab('sprints')}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer font-medium ${
              activeTab === 'sprints' ? 'bg-[#1e1e1e] text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            Sprint Timeline
          </button>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="text-[#d1d1d1] italic font-serif">
            “A Software Service tailored to businesses, enterprises, corporations, nonprofits, and other entities that handle various currencies and non-monetary assets. Developing an enterprise-focused software platform designed to support financial operations, customer relationship management, and asset tracking.”
          </p>
          <div className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">
            Valorniq Strategic Mission Statement · Target Launch Window: 10 - 16 Weeks
          </div>
        </div>
      </div>

      {/* TAB 1: SCOPE COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#222] bg-[#141414] text-[10px] uppercase font-bold text-[#666] tracking-wider">
                    <th className="py-3 px-4 w-1/5">Category</th>
                    <th className="py-3 px-4 w-1/4">MVP (Launch-Critical)</th>
                    <th className="py-3 px-4 w-1/3">Final Product Vision</th>
                    <th className="py-3 px-4">Valorniq 3.0 Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c1c1c] text-[#d1d1d1]">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{row.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#aaa]">
                        {row.mvp}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        {row.final}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] text-emerald-400 font-medium">{row.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPETITIVE MOAT VS ODOO */}
      {activeTab === 'moat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="font-medium text-sm text-white">Modern Modular Architecture</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Unlike Odoo’s monolithic roots and tangled PostgreSQL ORM extensions, Valorniq adopts an API-first, modular architecture with cryptographically isolated tenant boundaries from Day One.
            </p>
            <ul className="text-[11px] text-[#aaa] space-y-1.5 pt-2 border-t border-[#1c1c1c]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                <span>Zero legacy monolith baggage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                <span>Multi-tenant SaaS cloud-native core</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-indigo-400" />
                <span>Extensible REST & Webhook layers</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-medium text-sm text-white">AI-Embedded at Core (ARIS)</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Competitors bolt on basic LLM chat boxes as external gimmicks. Valorniq embeds ARIS deep into the operational layer with structured tool calling for direct lead creation, invoicing, and restocking.
            </p>
            <ul className="text-[11px] text-[#aaa] space-y-1.5 pt-2 border-t border-[#1c1c1c]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Real-time tenant ledger grounding</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Structured function-calling execution</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>AI sales forecasting & cash projections</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="font-medium text-sm text-white">UI/UX & Cognitive Simplicity</h3>
            <p className="text-xs text-[#888] leading-relaxed">
              Odoo suffers from notorious UI clutter, confusing configuration menus, and steep onboarding friction. Valorniq eliminates bloat with a unified, high-contrast dark aesthetic and immediate workflows.
            </p>
            <ul className="text-[11px] text-[#aaa] space-y-1.5 pt-2 border-t border-[#1c1c1c]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400" />
                <span>Instant sub-second module switching</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400" />
                <span>Zero visual clutter or nested tabs</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-amber-400" />
                <span>Role-tailored enterprise ergonomics</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTIVE STATUS */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="font-medium text-sm text-white">Milestones Achieved</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Strategic Direction Defined</div>
                <div className="text-[#888]">Clear positioning as an all-in-one business platform (ERP + CRM hybrid) targeting SMEs, enterprises, and nonprofits.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Core Product Vision Established</div>
                <div className="text-[#888]">Modular system architecture with cross-industry adaptability and multi-currency / non-monetary asset tracking.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Repository Infrastructure Initialized</div>
                <div className="text-[#888]">Unified workspace with production bundling, full TypeScript type safety, and Express proxy backend.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Product Category Alignment</div>
                <div className="text-[#888]">Targeting high-demand verticals: operations, finance, CRM, supply chain, and asset governance.</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              <h3 className="font-medium text-sm text-white">Current Velocity & In-Progress Tracks</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Core System Architecture</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Completed v3.0</span>
                </div>
                <div className="text-[#888]">API-first backend services and normalized data schemas for accounts, transactions, contacts, and assets.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Module Interconnection</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Completed v3.0</span>
                </div>
                <div className="text-[#888]">Cohesive flow connecting CRM deals to invoices, inventory deductions, and automated workflows.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Frontend Framework & UI System</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Completed v3.0</span>
                </div>
                <div className="text-[#888]">Obsidian dark mode enterprise design with WCAG AA compliance and zero clichéd AI slop patterns.</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222] space-y-1">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Authentication & Multi-Tenant Design</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Completed v3.0</span>
                </div>
                <div className="text-[#888]">Multi-tenant isolation boundaries, security captchas, fine-grained RBAC rosters, and audit trails.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPRINT TIMELINE */}
      {activeTab === 'sprints' && (
        <div className="p-6 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#222] pb-4">
            <div>
              <h3 className="font-medium text-sm text-white">Development Sprint Cycles (2-Week Iterations)</h3>
              <p className="text-xs text-[#888]">Timeline and delivery trajectory targeting official MVP Launch (10 - 16 Weeks Window).</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Phase: Beta Release Prep (On Track)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-lg bg-[#141414] border border-[#2a2a2a] space-y-2">
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Sprint 1 - 3</div>
              <div className="font-semibold text-white">Core Backend</div>
              <p className="text-[11px] text-[#888]">APIs, database schemas, cryptographic tenant auth, and ARIS endpoint proxy.</p>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-[#2a2a2a] space-y-2">
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Sprint 4 - 6</div>
              <div className="font-semibold text-white">Frontend MVP UI</div>
              <p className="text-[11px] text-[#888]">Executive Dashboard, CRM Pipeline, Invoicing UI, and Asset Tracking.</p>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-[#2a2a2a] space-y-2">
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Sprint 7 - 8</div>
              <div className="font-semibold text-white">Module Integration</div>
              <p className="text-[11px] text-[#888]">Connecting CRM to Invoicing, Inventory stock deductions, and No-Code Workflows.</p>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-indigo-500/40 bg-indigo-500/5 space-y-2">
              <div className="text-[10px] uppercase font-mono text-indigo-400 font-bold">Sprint 9</div>
              <div className="font-semibold text-white">Internal Testing</div>
              <p className="text-[11px] text-[#888]">Security validation, multi-currency edge case checks, and performance profiling.</p>
              <div className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" /> In Validation
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#141414] border border-[#222] space-y-2 opacity-85">
              <div className="text-[10px] uppercase font-mono text-amber-400 font-bold">Sprint 10</div>
              <div className="font-semibold text-white">Beta Release Prep</div>
              <p className="text-[11px] text-[#888]">Early customer onboarding, telemetry feedback loops, and deployment hardening.</p>
              <div className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" /> Upcoming
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
