import React, { useState } from 'react';
import { Layers, CheckCircle, RefreshCw, Key, ExternalLink, ShieldCheck, ArrowRight, Webhook, Send } from 'lucide-react';

interface IntegrationsViewProps {
  isDark: boolean;
  onTriggerSync?: () => void;
}

export default function IntegrationsView({ isDark, onTriggerSync }: IntegrationsViewProps) {
  const [stripeConnected, setStripeConnected] = useState(true);
  const [resendConnected, setResendConnected] = useState(true);
  const [gcsConnected, setGcsConnected] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.valorniq.cloud/v1/webhooks/incoming');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'testing' | 'success'>('idle');

  const handleTestWebhook = () => {
    setWebhookStatus('testing');
    setTimeout(() => {
      setWebhookStatus('success');
      setTimeout(() => setWebhookStatus('idle'), 3000);
    }, 1000);
  };

  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe Corporate Billing',
      category: 'Payments & Subscriptions',
      status: stripeConnected ? 'Active' : 'Disconnected',
      description: 'Synchronizes invoices, card settlements, ACH transfers, and automatic subscription renewals.',
      icon: '💳',
      lastSync: '5 mins ago',
      connected: stripeConnected,
      onToggle: () => setStripeConnected(!stripeConnected)
    },
    {
      id: 'resend',
      name: 'Resend Transactional Mail',
      category: 'Email Deliverability',
      status: resendConnected ? 'Active' : 'Disconnected',
      description: 'Dispatches automated PDF invoice receipts, payment reminders, and auth reset links via DKIM verified domain.',
      icon: '✉️',
      lastSync: 'Real-time',
      connected: resendConnected,
      onToggle: () => setResendConnected(!resendConnected)
    },
    {
      id: 'gcs',
      name: 'Google Cloud Storage (GCS)',
      category: 'Cold Storage & Backups',
      status: gcsConnected ? 'Active' : 'Disconnected',
      description: 'Automated nightly snapshots of tenant database state, invoice manifests, and SOC2 audit exports.',
      icon: '☁️',
      lastSync: '2 hours ago',
      connected: gcsConnected,
      onToggle: () => setGcsConnected(!gcsConnected)
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">API & Ecosystem Integrations</h2>
          <p className="text-xs text-[#888] mt-1">
            Connect external payment gateways, transactional mail relays, and cloud infrastructure pipelines.
          </p>
        </div>

        <button
          onClick={onTriggerSync}
          className="px-3.5 py-2 rounded-lg bg-[#111] border border-[#222] hover:bg-[#1A1A1A] text-xs font-medium flex items-center text-[#d1d1d1] shadow-sm cursor-pointer transition"
        >
          <RefreshCw className="h-4 w-4 mr-1.5 text-indigo-400" /> Re-sync All Gateways
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] border border-[#222] flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-white">{item.name}</h4>
                    <span className="text-[10px] text-[#666] font-medium block">{item.category}</span>
                  </div>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  item.connected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1A1A1A] text-[#666] border border-[#2A2A2A]'
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-[#888] mt-4 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="border-t border-[#1A1A1A] mt-5 pt-3 flex items-center justify-between text-xs">
              <span className="text-[#666] text-[10px]">Sync: {item.lastSync}</span>
              <button
                onClick={item.onToggle}
                className={`font-medium cursor-pointer text-xs transition ${
                  item.connected ? 'text-rose-400 hover:text-rose-300' : 'text-indigo-400 hover:text-indigo-300 hover:underline'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks Config Box */}
      <div className="p-6 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Webhook className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="font-medium text-sm text-white">Tenant Event Webhooks</h3>
              <p className="text-xs text-[#666]">Stream realtime ERP events (invoice.created, lead.won, stock.low) to external endpoints</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
            HMAC-SHA256 SIGNED
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1 p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={handleTestWebhook}
            disabled={webhookStatus === 'testing'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-lg shadow-indigo-900/20"
          >
            {webhookStatus === 'testing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : webhookStatus === 'success' ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {webhookStatus === 'testing' ? 'Dispatching...' : webhookStatus === 'success' ? 'Dispatched (200 OK)' : 'Test Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
}
