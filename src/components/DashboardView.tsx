import React, { useState } from 'react';
import { DollarSign, Users, Briefcase, TrendingUp, AlertTriangle, CheckCircle2, Sliders, Check, EyeOff, LayoutTemplate, RotateCw, Package, ShoppingCart, Presentation, FileText, Sparkles, Boxes, Zap, Compass } from 'lucide-react';
import { Lead, Invoice, Expense, Contact, User, ActivityLog, AlertNotification, DashboardCustomSettings, Product, SalesOrder } from '../types';
import { exportElementToPNG, exportElementToPDF, compileExecutivePresentationPDF } from '../utils/chartExport';

interface DashboardViewProps {
  leads: Lead[];
  invoices: Invoice[];
  expenses: Expense[];
  contacts: Contact[];
  products: Product[];
  sales: SalesOrder[];
  team: User[];
  logs: ActivityLog[];
  alerts: AlertNotification[];
  onNavigateTo: (view: string) => void;
  onClearAlert: (id: string) => void;
  isDark: boolean;
  dashSettings: DashboardCustomSettings;
  onUpdateDashSettings: (settings: DashboardCustomSettings) => void;
  onSeedSampleData?: () => void;
  onOpenAris?: () => void;
}

export default function DashboardView({
  leads,
  invoices,
  expenses,
  contacts,
  products,
  sales,
  team,
  logs,
  alerts,
  onNavigateTo,
  onClearAlert,
  isDark,
  dashSettings,
  onUpdateDashSettings,
  onSeedSampleData,
  onOpenAris
}: DashboardViewProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportingDeck, setExportingDeck] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportSingle = async (elementId: string, baseName: string, format: 'PNG' | 'PDF') => {
    try {
      const fileName = `${baseName}_${new Date().toISOString().slice(0, 10)}`;
      const options = { elementId, fileName, isDark };
      if (format === 'PNG') {
        await exportElementToPNG(options);
      } else {
        await exportElementToPDF(options);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Export error: ${err.message || err}`);
    }
  };

  const handleCompileDeck = async () => {
    setExportingDeck(true);
    setExportError(null);
    try {
      const widgets = [
        { id: 'revenue-statement-card', title: 'Revenue & Operating Expenses Statement Ledger' },
        { id: 'pipeline-progress-card', title: 'Active Pipeline & Quota Performance' }
      ];
      
      await compileExecutivePresentationPDF(widgets, {
        fileName: `Valorniq_Executive_Briefing_${new Date().toISOString().slice(0, 10)}`,
        isDark,
        reportTitle: 'Valorniq Executive Performance Briefing',
        enterpriseMetadata: {
          tenantName: 'Enterprise Operating Tenant',
          executiveUser: team[0]?.name || 'Valorniq Administrator',
          timestamp: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        }
      });
      setShowExportModal(false);
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || 'Render failed during PDF compilation.');
    } finally {
      setExportingDeck(false);
    }
  };

  // Financial Calculators
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingReceivables = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
  const overdues = invoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalApprovedExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
  const cashNetProfit = paidRevenue - totalApprovedExpenses;

  // Inventory & Sales
  const inventoryValuation = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const salesRevenue = sales.reduce((sum, s) => sum + (s.totalValue || 0), 0);
  const activePipelineValue = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').reduce((sum, l) => sum + l.value, 0);

  const activeAlerts = alerts.filter(a => !a.read);
  const pipelineTargetValue = dashSettings.crmGoalTarget || 500000;
  const crmTargetPct = Math.min(100, Math.round((activePipelineValue / pipelineTargetValue) * 100));

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium tracking-tight text-white">
              Command Center
            </h1>
            <span className="bg-[#222] text-[#888] text-[10px] px-2 py-0.5 rounded font-mono">
              Live
            </span>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Real-time unified ERP, CRM, and financial intelligence with zero-latency synchronization.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={triggerRefresh}
            className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-xs font-medium flex items-center text-[#d1d1d1] transition cursor-pointer"
            title="Sync metrics with database"
          >
            <RotateCw className={`h-3.5 w-3.5 mr-1.5 text-[#888] ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Sync'}
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-xs font-medium flex items-center text-[#d1d1d1] transition cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
            Configure
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/10 hover:bg-indigo-600/20 text-xs font-medium flex items-center text-indigo-300 transition cursor-pointer"
          >
            <Presentation className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
            Presentation Deck
          </button>

          {onOpenAris && (
            <button
              onClick={onOpenAris}
              className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold flex items-center text-indigo-400 transition cursor-pointer shadow-lg shadow-indigo-900/20"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-300" />
              Ask ARIS
            </button>
          )}

          <div className="flex items-center space-x-2 bg-[#111] text-[#888] px-3 py-1.5 rounded-lg border border-[#222] text-xs">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-[10px]">TENANT_ISOLATED</span>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-[#111] border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3 shadow-lg">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-xs text-amber-400">Notice Feed ({activeAlerts.length})</h3>
            <div className="mt-1.5 space-y-1">
              {activeAlerts.slice(0, 2).map(alert => (
                <div key={alert.id} className="flex items-center justify-between text-xs text-[#AAA]">
                  <span>• {alert.message} <span className="font-semibold text-[#888]">({alert.module})</span></span>
                  <button 
                    onClick={() => onClearAlert(alert.id)}
                    className="ml-2 font-semibold text-amber-400 hover:underline cursor-pointer text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clean Slate Seeding Banner */}
      {leads.length === 0 && invoices.length === 0 && onSeedSampleData && (
        <div className="p-5 rounded-xl border border-[#222] bg-[#111] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Workspace Initialized (Clean Slate)</h4>
            </div>
            <p className="text-xs text-[#888] leading-relaxed">
              Your tenant sandbox is freshly allocated. You can create leads, contacts, products, and invoices from the sidebar modules, or seed sample enterprise records to explore the visual dashboards.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Seed sample enterprise records to test CRM, Finance, Inventory, and Analytics?")) {
                onSeedSampleData();
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg whitespace-nowrap cursor-pointer text-xs transition flex items-center space-x-1.5 shadow-lg shadow-indigo-900/20"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Load Sample Data</span>
          </button>
        </div>
      )}

      {/* Valorniq 3.0 Strategic Focus Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTo('Assets')}
          className="p-3.5 rounded-xl border border-[#222] bg-[#111] hover:border-indigo-500/40 hover:bg-[#141414] text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-indigo-400 group-hover:border-indigo-500/40 transition">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition">Asset Ledger</div>
              <div className="text-[10px] text-[#777]">Non-monetary & Multi-currency</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#555] group-hover:text-indigo-400">→</span>
        </button>

        <button
          onClick={() => onNavigateTo('Automation')}
          className="p-3.5 rounded-xl border border-[#222] bg-[#111] hover:border-indigo-500/40 hover:bg-[#141414] text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-amber-400 group-hover:border-amber-500/40 transition">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition">Workflow Automation</div>
              <div className="text-[10px] text-[#777]">Event triggers & Action rules</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#555] group-hover:text-amber-400">→</span>
        </button>

        <button
          onClick={() => onNavigateTo('Roadmap')}
          className="p-3.5 rounded-xl border border-[#222] bg-[#111] hover:border-indigo-500/40 hover:bg-[#141414] text-left transition flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-emerald-400 group-hover:border-emerald-500/40 transition">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition">Competitive Moat</div>
              <div className="text-[10px] text-[#777]">Valorniq vs Odoo Strategy</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#555] group-hover:text-emerald-400">→</span>
        </button>
      </div>

      {/* Primary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        {dashSettings.showNetProfit && (
          <div 
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col justify-between cursor-pointer hover:border-[#333] transition" 
            onClick={() => onNavigateTo('Finance')}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#555] uppercase font-bold tracking-wider">Net Cash Flow (M)</span>
              <span className="p-1.5 rounded-lg bg-[#1A1A1A] border border-[#222] text-green-500">
                <DollarSign className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl text-white font-light tracking-tight">
                ${cashNetProfit.toLocaleString()}
              </h3>
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                +12.4% <span className="text-[#444]">vs last quarter</span>
              </div>
            </div>
          </div>
        )}

        {/* Receivables */}
        {dashSettings.showReceivables && (
          <div 
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col justify-between cursor-pointer hover:border-[#333] transition" 
            onClick={() => onNavigateTo('Finance')}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#555] uppercase font-bold tracking-wider">Open Receivables</span>
              <span className="p-1.5 rounded-lg bg-[#1A1A1A] border border-[#222] text-amber-500">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl text-white font-light tracking-tight">
                ${pendingReceivables.toLocaleString()}
              </h3>
              <div className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                {overdues > 0 ? `${overdues} Overdue` : 'Settled'} <span className="text-[#444]">— action req</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Pipeline */}
        {dashSettings.showPipeline && (
          <div 
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col justify-between cursor-pointer hover:border-[#333] transition" 
            onClick={() => onNavigateTo('CRM')}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#555] uppercase font-bold tracking-wider">Pipeline Value</span>
              <span className="p-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl text-white font-light tracking-tight">
                ${activePipelineValue.toLocaleString()}
              </h3>
              <div className="text-xs text-indigo-400 flex items-center gap-1 mt-1">
                {leads.length} Active Leads <span className="text-[#444]">in stage</span>
              </div>
            </div>
          </div>
        )}

        {/* Stock & Assets */}
        {dashSettings.showCustomers && (
          <div 
            className="bg-[#111] border border-[#222] rounded-xl p-5 flex flex-col justify-between cursor-pointer hover:border-[#333] transition" 
            onClick={() => onNavigateTo('Inventory')}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#555] uppercase font-bold tracking-wider">Inventory Health</span>
              <span className="p-1.5 rounded-lg bg-[#1A1A1A] border border-[#222] text-green-500">
                <Package className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="text-3xl text-white font-light tracking-tight">
                94.2%
              </h3>
              <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                Low Stock Alert <span className="text-[#444]">— 3 SKUs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Financial Charts & Pipeline Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Statement Visualizer */}
        <div id="revenue-statement-card" className="col-span-1 lg:col-span-2 bg-[#111] border border-[#222] rounded-xl overflow-hidden flex flex-col shadow-xl">
          <div className="p-5 border-b border-[#222] flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-sm text-white">Financial Ledger & Performance</h3>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => handleExportSingle('revenue-statement-card', 'Revenue_Statement', 'PNG')}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#222] hover:bg-[#333] text-[#AAA] border border-[#333] font-semibold cursor-pointer"
                  >
                    PNG
                  </button>
                  <button 
                    onClick={() => handleExportSingle('revenue-statement-card', 'Revenue_Statement', 'PDF')}
                    className="px-2 py-0.5 rounded text-[10px] bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 font-semibold cursor-pointer"
                  >
                    PDF
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#888] mt-0.5">Rolling operational ledger performance curve</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center text-[#d1d1d1]"><span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-1.5"></span> Invoiced</span>
              <span className="flex items-center text-[#d1d1d1]"><span className="inline-block h-2 w-2 rounded-full bg-rose-400 mr-1.5"></span> Expenses</span>
            </div>
          </div>

          <div className="p-6 relative flex-1 flex flex-col justify-between">
            {/* Visual SVG Chart */}
            <div className="h-48 w-full relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <line x1="0" y1="30" x2="500" y2="30" stroke="#222" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#222" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#222" strokeWidth="1" strokeDasharray="3" />

                {dashSettings.chartType === 'Area' && (
                  <path
                    d="M 0,130 C 50,110 100,120 150,90 C 200,60 250,55 300,45 C 350,35 400,25 500,20 L 500,150 L 0,150 Z"
                    fill="url(#revGrad)"
                    opacity="0.3"
                  />
                )}

                {dashSettings.chartType === 'Bar' ? (
                  <>
                    <rect x="35" y="100" width="14" height="50" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="52" y="125" width="14" height="25" rx="3" fill="#fb7185" opacity="0.85" />

                    <rect x="110" y="85" width="14" height="65" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="127" y="115" width="14" height="35" rx="3" fill="#fb7185" opacity="0.85" />

                    <rect x="185" y="65" width="14" height="85" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="202" y="110" width="14" height="40" rx="3" fill="#fb7185" opacity="0.85" />

                    <rect x="260" y="55" width="14" height="95" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="277" y="90" width="14" height="60" rx="3" fill="#fb7185" opacity="0.85" />

                    <rect x="335" y="35" width="14" height="115" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="352" y="70" width="14" height="80" rx="3" fill="#fb7185" opacity="0.85" />

                    <rect x="410" y="15" width="14" height="135" rx="3" fill="#6366f1" opacity="0.85" />
                    <rect x="427" y="55" width="14" height="95" rx="3" fill="#fb7185" opacity="0.85" />
                  </>
                ) : (
                  <>
                    <path
                      d="M 0,130 C 50,110 100,120 150,90 C 200,60 250,55 300,45 C 350,35 400,25 500,20"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0,140 C 60,130 110,138 160,115 C 210,95 270,110 320,95 C 385,85 430,90 500,65"
                      fill="none"
                      stroke="#fb7185"
                      strokeWidth={dashSettings.chartType === 'DualLine' ? '3.5' : '2'}
                      strokeLinecap="round"
                      strokeDasharray={dashSettings.chartType === 'DualLine' ? undefined : '4 2'}
                    />
                  </>
                )}

                <circle cx="300" cy="45" r="5" fill="#6366f1" />
                <circle cx="500" cy="20" r="5" fill="#818cf8" />

                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-[#555] mt-2 font-mono px-1">
              <span>Q1-Start</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Current</span>
            </div>
          </div>

          <div className="p-4 bg-[#0D0D0D] border-t border-[#222] grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#555]">Total Billed</p>
              <p className="font-light text-base text-white mt-0.5">${totalInvoiced.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#555]">Approved Deductions</p>
              <p className="font-light text-base text-rose-400 mt-0.5">${totalApprovedExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#555]">Operating Margin</p>
              <p className="font-light text-base text-green-500 mt-0.5">
                {totalInvoiced > 0 ? `${Math.round((cashNetProfit / totalInvoiced) * 100)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Quota Progress */}
        <div id="pipeline-progress-card" className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm text-white">Pipeline Quota Realization</h3>
                <p className="text-xs text-[#888] mt-0.5">Target: ${(pipelineTargetValue).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleExportSingle('pipeline-progress-card', 'Pipeline_Quota', 'PNG')}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#222] hover:bg-[#333] text-[#AAA] border border-[#333] font-semibold cursor-pointer"
                >
                  PNG
                </button>
                <button 
                  onClick={() => handleExportSingle('pipeline-progress-card', 'Pipeline_Quota', 'PDF')}
                  className="px-2 py-0.5 rounded text-[10px] bg-indigo-600/20 text-indigo-400 rounded border border-indigo-500/30 font-semibold cursor-pointer"
                >
                  PDF
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center py-6">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#1A1A1A]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-500"
                    strokeDasharray={`${crmTargetPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="text-center z-10">
                  <span className="text-2xl font-light text-white tracking-tight">{crmTargetPct}%</span>
                  <span className="block text-[9px] text-[#555] font-bold uppercase tracking-wider">Achieved</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#888]">Active Unsettled</span>
                <span className="font-medium text-white">${activePipelineValue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#222]">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${crmTargetPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 p-3.5 rounded-xl mt-4 text-xs">
            <h4 className="font-bold text-indigo-400 uppercase tracking-widest text-[10px]">
              ARIS Recommendation
            </h4>
            <p className="text-[#AAA] mt-1 leading-relaxed text-xs">
              Open ARIS Copilot floating assistant to analyze deal win probabilities and automatically draft invoices for won deals.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Opportunities & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CRM Leads Preview */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <div>
              <h3 className="font-semibold text-sm text-white">Active Pipeline Opportunities</h3>
              <p className="text-xs text-[#888] mt-0.5">Top deals in active sales cycle</p>
            </div>
            <button 
              onClick={() => onNavigateTo('CRM')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Open CRM →
            </button>
          </div>

          <div className="divide-y divide-[#1A1A1A] mt-2">
            {leads.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-6">No active leads logged yet</p>
            ) : (
              leads.slice(0, 4).map(lead => (
                <div key={lead.id} className="py-2.5 px-2 flex items-center justify-between text-xs hover:bg-[#141414] rounded-lg transition-colors">
                  <div>
                    <h4 className="font-medium text-white">{lead.title}</h4>
                    <span className="text-[10px] text-[#555]">{lead.company} · {lead.assignedTo}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">${lead.value.toLocaleString()}</p>
                    <span className="inline-block bg-[#1A1A1A] border border-[#333] text-indigo-400 px-2 py-0.5 rounded text-[9px] font-medium">
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Audit Logs */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#222] pb-3">
            <div>
              <h3 className="font-semibold text-sm text-white">Security & Audit Trails</h3>
              <p className="text-xs text-[#888] mt-0.5">Immutable compliance activity events</p>
            </div>
            <button 
              onClick={() => onNavigateTo('User')}
              className="text-xs text-[#888] hover:text-white font-medium cursor-pointer"
            >
              Full Ledger →
            </button>
          </div>

          <div className="divide-y divide-[#1A1A1A] mt-2 font-mono">
            {logs.length === 0 ? (
              <p className="text-xs text-[#666] text-center py-6 font-sans">No audit logs recorded</p>
            ) : (
              logs.slice(0, 4).map(log => (
                <div key={log.id} className="py-2.5 px-2 flex items-center justify-between text-xs text-[#d1d1d1] hover:bg-[#141414] rounded-lg transition-colors">
                  <div className="flex items-center space-x-2 shrink-0 max-w-[70%] truncate">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#333] text-indigo-400">
                      {log.module}
                    </span>
                    <span className="truncate">{log.action}</span>
                  </div>
                  <div className="text-right shrink-0 text-[10px] text-[#555]">
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Layout Customization */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-xl border border-[#222] bg-[#0F0F0F] text-[#d1d1d1] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#222]">
              <div className="flex items-center space-x-2">
                <LayoutTemplate className="h-4 w-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">Dashboard Configuration</h3>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="block text-[#666] text-[10px] uppercase font-bold tracking-wider mb-2">Display KPI Blocks</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateDashSettings({ ...dashSettings, showNetProfit: !dashSettings.showNetProfit })}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition text-[11px] font-medium cursor-pointer ${
                      dashSettings.showNetProfit ? 'border-indigo-500/40 bg-indigo-600/10 text-white' : 'border-[#222] bg-[#141414] text-[#666]'
                    }`}
                  >
                    <span>Net Cash Flow</span>
                    {dashSettings.showNetProfit && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => onUpdateDashSettings({ ...dashSettings, showReceivables: !dashSettings.showReceivables })}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition text-[11px] font-medium cursor-pointer ${
                      dashSettings.showReceivables ? 'border-indigo-500/40 bg-indigo-600/10 text-white' : 'border-[#222] bg-[#141414] text-[#666]'
                    }`}
                  >
                    <span>Receivables</span>
                    {dashSettings.showReceivables && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => onUpdateDashSettings({ ...dashSettings, showPipeline: !dashSettings.showPipeline })}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition text-[11px] font-medium cursor-pointer ${
                      dashSettings.showPipeline ? 'border-indigo-500/40 bg-indigo-600/10 text-white' : 'border-[#222] bg-[#141414] text-[#666]'
                    }`}
                  >
                    <span>Pipeline</span>
                    {dashSettings.showPipeline && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => onUpdateDashSettings({ ...dashSettings, showCustomers: !dashSettings.showCustomers })}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition text-[11px] font-medium cursor-pointer ${
                      dashSettings.showCustomers ? 'border-indigo-500/40 bg-indigo-600/10 text-white' : 'border-[#222] bg-[#141414] text-[#666]'
                    }`}
                  >
                    <span>Stock Assets</span>
                    {dashSettings.showCustomers && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[#666] text-[10px] uppercase font-bold tracking-wider mb-2">Ledger Curve Style</span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#141414] border border-[#222] rounded-lg">
                  {(['Area', 'Line', 'Bar', 'DualLine'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onUpdateDashSettings({ ...dashSettings, chartType: t })}
                      className={`py-1 rounded text-center transition cursor-pointer text-[10px] font-semibold ${
                        dashSettings.chartType === t
                          ? 'bg-[#222] text-white shadow-sm border border-[#333]'
                          : 'text-[#666] hover:text-[#AAA]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#666] text-[10px] uppercase font-bold tracking-wider">CRM Quota Goal</span>
                  <span className="font-mono text-xs text-indigo-400 font-bold">${(dashSettings.crmGoalTarget).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={1000000}
                  step={50000}
                  value={dashSettings.crmGoalTarget}
                  onChange={(e) => onUpdateDashSettings({ ...dashSettings, crmGoalTarget: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#222] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="border-t pt-3 border-[#222] flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs cursor-pointer transition shadow-lg shadow-indigo-900/20"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Boardroom Presentation Export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl border border-[#222] bg-[#0F0F0F] text-[#d1d1d1] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#222]">
              <div className="flex items-center space-x-2">
                <Presentation className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">Boardroom Presentation Export</h3>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {exportError && (
              <div className="p-2.5 bg-rose-950/30 border border-rose-900/50 text-rose-400 rounded-lg text-xs flex gap-1.5 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{exportError}</p>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[#888]">
                Compiles the active revenue statement, operational metrics, and pipeline targets into an executive landscape slide deck (PDF format).
              </p>
              <div className="bg-[#141414] border border-[#222] p-3 rounded-lg space-y-1 font-mono text-[11px] text-[#AAA]">
                <div>• Slide 1: Executive Cover Page & Confidentiality</div>
                <div>• Slide 2: Revenue Statement & Margins</div>
                <div>• Slide 3: Pipeline Realization Progress</div>
              </div>
            </div>

            <div className="border-t pt-3 border-[#222] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] border border-[#333] hover:bg-[#222] text-[#AAA] hover:text-white font-medium rounded-lg text-xs cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={exportingDeck}
                onClick={handleCompileDeck}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition shadow-lg shadow-indigo-900/20"
              >
                {exportingDeck ? 'Compiling PDF...' : 'Download Slide Deck'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
