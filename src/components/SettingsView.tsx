import React, { useState } from 'react';
import { Settings, Building, Moon, Sun, Key, Copy, Check, RotateCcw, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Organization } from '../types';

interface SettingsViewProps {
  organization: Organization;
  onUpdateOrg: (updates: Partial<Organization>) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

export default function SettingsView({
  organization,
  onUpdateOrg,
  isDark,
  onToggleTheme,
  onResetData
}: SettingsViewProps) {
  const [orgName, setOrgName] = useState(organization.name);
  const [currency, setCurrency] = useState(organization.currency || 'USD');
  const [copiedTenantId, setCopiedTenantId] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyTenantId = () => {
    navigator.clipboard.writeText(organization.tenantId);
    setCopiedTenantId(true);
    setTimeout(() => setCopiedTenantId(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrg({
      name: orgName,
      currency: currency
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/mo',
      features: ['Up to 5 Users', 'CRM & Pipeline', 'Basic Invoicing', 'Community Support'],
      active: organization.plan === 'Starter'
    },
    {
      name: 'Scale',
      price: '$199',
      period: '/mo',
      features: ['Up to 25 Users', 'Advanced CRM & Sales', 'Multi-currency Finance', 'ARIS Autonomous AI Assistant', 'Audit Log Trail'],
      active: organization.plan === 'Scale'
    },
    {
      name: 'Enterprise',
      price: '$499',
      period: '/mo',
      features: ['Unlimited Seats', 'Dedicated Isolated Tenant', 'SOC2 / HIPAA Compliance', 'Custom API & Webhooks', '24/7 SLA Priority'],
      active: organization.plan === 'Enterprise'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">Workspace Configuration</h2>
          <p className="text-xs text-[#888] mt-1">
            Tenant configuration, organization metadata, subscription plan, and security controls.
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
            <Check className="h-4 w-4" /> Workspace settings saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant Identifier Box */}
          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-2">
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Multi-Tenant Identifier (Cryptographic Boundary)</span>
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={organization.tenantId}
                className="flex-1 p-2.5 rounded-lg border border-[#222] bg-[#141414] font-mono text-xs text-indigo-400 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyTenantId}
                className="px-3.5 py-2.5 rounded-lg border border-[#222] hover:bg-[#1A1A1A] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer text-[#d1d1d1]"
              >
                {copiedTenantId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#888]" />}
                {copiedTenantId ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-[#666]">All database records, AI operations, and audit logs are strictly isolated under this ID.</p>
          </div>

          {/* Org Profile Form */}
          <form onSubmit={handleSave} className="p-6 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4 text-xs">
            <h3 className="font-medium text-sm text-white">Organization Details</h3>

            <div>
              <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Company / Organization Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Primary Reporting Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="USD" className="bg-[#141414]">USD ($) - United States Dollar</option>
                  <option value="EUR" className="bg-[#141414]">EUR (€) - Eurozone</option>
                  <option value="GBP" className="bg-[#141414]">GBP (£) - British Pound</option>
                  <option value="CAD" className="bg-[#141414]">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Fiscal Year Start</label>
                <input
                  type="text"
                  readOnly
                  value="January 1st (Calendar Year)"
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-[#888] font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer shadow-lg shadow-indigo-900/20"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Subscription Tiers */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-white">Subscription & Plan Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                    p.active 
                      ? 'border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20' 
                      : 'bg-[#111] border-[#222]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm text-white">{p.name}</h4>
                      {p.active && (
                        <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-2xl font-semibold text-white">{p.price}</span>
                      <span className="text-xs text-[#666]">{p.period}</span>
                    </div>
                    <ul className="space-y-2 text-[11px] text-[#888]">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    disabled={p.active}
                    onClick={() => onUpdateOrg({ plan: p.name as any })}
                    className={`mt-5 w-full py-2 rounded-lg text-xs font-medium transition ${
                      p.active 
                        ? 'bg-transparent text-[#555] cursor-default' 
                        : 'bg-[#141414] border border-[#222] hover:border-indigo-500 text-[#d1d1d1] hover:text-white cursor-pointer'
                    }`}
                  >
                    {p.active ? 'Active Tier' : `Switch to ${p.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Theme & Danger Zone */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4">
            <h3 className="font-medium text-sm text-white">Appearance & Theme</h3>
            <p className="text-xs text-[#888]">Toggle between high-contrast dark enterprise theme and crisp neutral light theme.</p>
            <button
              onClick={onToggleTheme}
              className="w-full py-2.5 px-4 rounded-lg border border-[#222] hover:bg-[#1A1A1A] flex items-center justify-between text-xs font-medium text-[#d1d1d1] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </div>
              <span className="text-[10px] text-[#666] uppercase font-mono">{isDark ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-950/10 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-medium text-sm">Tenant Reset Zone</h3>
            </div>
            <p className="text-xs text-[#888] leading-relaxed">
              Reset your tenant workspace back to clean enterprise baseline seed data (sample deals, invoices, inventory, team).
            </p>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to re-seed demo data for this tenant? Current local modifications will reset.")) {
                  onResetData();
                }
              }}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition shadow-lg shadow-rose-900/20"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Tenant Baseline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
