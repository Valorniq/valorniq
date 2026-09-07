import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Building2, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Tag, 
  Layers, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Trash2,
  Edit2
} from 'lucide-react';
import { AssetItem, AssetCategory, AssetCondition, Organization, CurrencyRate } from '../types';
import { SAMPLE_CURRENCIES } from '../constants';

interface AssetTrackingViewProps {
  assets: AssetItem[];
  organization: Organization;
  onAddAsset: (asset: Omit<AssetItem, 'id'>) => void;
  onUpdateAsset: (id: string, updates: Partial<AssetItem>) => void;
  onDeleteAsset: (id: string) => void;
  isDark: boolean;
}

export default function AssetTrackingView({
  assets,
  organization,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  isDark
}: AssetTrackingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterNonMonetaryOnly, setFilterNonMonetaryOnly] = useState<boolean>(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(organization.currency || 'USD');
  const [showAddModal, setShowAddModal] = useState(false);
  const [calculatingDepreciation, setCalculatingDepreciation] = useState(false);

  // New Asset Form State
  const [name, setName] = useState('');
  const [tagNumber, setTagNumber] = useState(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState<AssetCategory>('Equipment & Fleet');
  const [isNonMonetary, setIsNonMonetary] = useState(true);
  const [acquisitionCost, setAcquisitionCost] = useState<number>(50000);
  const [fairMarketValue, setFairMarketValue] = useState<number>(48000);
  const [depreciationMethod, setDepreciationMethod] = useState<AssetItem['depreciationMethod']>('Straight-Line');
  const [depreciationRatePercent, setDepreciationRatePercent] = useState<number>(10);
  const [location, setLocation] = useState('Austin Logistics Hub / Sector 2');
  const [custodian, setCustodian] = useState('Alex Vance (Admin)');
  const [condition, setCondition] = useState<AssetCondition>('Excellent');
  const [grantOrDonorReference, setGrantOrDonorReference] = useState('');
  const [notes, setNotes] = useState('');

  // Currency exchange helper
  const currentRate = SAMPLE_CURRENCIES.find(c => c.code === selectedCurrency)?.rateToUSD || 1.0;
  const currencySymbol = SAMPLE_CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || '$';

  const convertAmount = (valInUSD: number) => {
    // valInUSD converted to selected currency
    if (selectedCurrency === 'USD') return valInUSD;
    return valInUSD / currentRate;
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesNonMonetary = !filterNonMonetaryOnly || a.isNonMonetary;

    return matchesSearch && matchesCategory && matchesNonMonetary;
  });

  // Aggregated totals
  const totalAcquisitionCostUSD = assets.reduce((sum, a) => sum + a.acquisitionCost, 0);
  const totalBookValueUSD = assets.reduce((sum, a) => sum + a.currentBookValue, 0);
  const totalFairMarketValueUSD = assets.reduce((sum, a) => sum + a.fairMarketValue, 0);
  const nonMonetaryCount = assets.filter(a => a.isNonMonetary).length;
  const nonMonetaryRatio = assets.length > 0 ? Math.round((nonMonetaryCount / assets.length) * 100) : 0;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const currentBook = Math.max(0, acquisitionCost - (acquisitionCost * (depreciationRatePercent / 100)));

    onAddAsset({
      name,
      tagNumber,
      category,
      isNonMonetary,
      acquisitionDate: new Date().toISOString().split('T')[0],
      valuationCurrency: selectedCurrency,
      acquisitionCost,
      fairMarketValue,
      depreciationMethod,
      depreciationRatePercent,
      accumulatedDepreciation: acquisitionCost - currentBook,
      currentBookValue: currentBook,
      location,
      custodian,
      condition,
      grantOrDonorReference: grantOrDonorReference || undefined,
      notes: notes || undefined
    });

    setShowAddModal(false);
    setName('');
    setNotes('');
    setGrantOrDonorReference('');
    setTagNumber(`AST-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleRunDepreciationCycle = () => {
    setCalculatingDepreciation(true);
    setTimeout(() => {
      assets.forEach(a => {
        if (a.depreciationRatePercent > 0 && a.currentBookValue > 0) {
          const addedDepr = a.acquisitionCost * (a.depreciationRatePercent / 100 / 4); // quarterly
          const newAccum = Math.min(a.acquisitionCost, a.accumulatedDepreciation + addedDepr);
          const newBook = Math.max(0, a.acquisitionCost - newAccum);
          onUpdateAsset(a.id, {
            accumulatedDepreciation: Math.round(newAccum),
            currentBookValue: Math.round(newBook)
          });
        }
      });
      setCalculatingDepreciation(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['Tag Number', 'Asset Name', 'Category', 'Non-Monetary', 'Book Value (USD)', 'Fair Market Value', 'Condition', 'Custodian', 'Location'];
    const rows = filteredAssets.map(a => [
      a.tagNumber,
      `"${a.name}"`,
      `"${a.category}"`,
      a.isNonMonetary ? 'YES' : 'NO',
      a.currentBookValue,
      a.fairMarketValue,
      a.condition,
      `"${a.custodian}"`,
      `"${a.location}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `valorniq_asset_register_${organization.tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-medium tracking-tight text-white">Asset & Non-Monetary Tracking</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Enterprise & Nonprofit
            </span>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Tracking multi-currency physical assets, intellectual property, logistics fleets, and nonprofit in-kind grant contributions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Multi-Currency Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#222] bg-[#111] text-xs text-[#888]">
            <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[10px] uppercase font-bold text-[#555]">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              aria-label="Reporting Currency"
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {SAMPLE_CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-[#111] text-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunDepreciationCycle}
            disabled={calculatingDepreciation}
            className="px-3 py-1.5 rounded-lg border border-[#222] hover:bg-[#1A1A1A] text-[#d1d1d1] hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${calculatingDepreciation ? 'animate-spin text-indigo-400' : 'text-[#888]'}`} />
            <span>{calculatingDepreciation ? 'Calculating...' : 'Run Depreciation'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-[#222] hover:bg-[#1A1A1A] text-[#d1d1d1] hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#888]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-900/20 border border-indigo-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Total Book Value</span>
            <Boxes className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-semibold text-white">
            {currencySymbol}{Math.round(convertAmount(totalBookValueUSD)).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666]">Net amortized balance after depreciation</div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Fair Market Value (FMV)</span>
            <Tag className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold text-white">
            {currencySymbol}{Math.round(convertAmount(totalFairMarketValueUSD)).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400/80">Active replacement appraisal benchmark</div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Non-Monetary Ratio</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-semibold text-white">{nonMonetaryRatio}%</div>
          <div className="text-[10px] text-[#666]">{nonMonetaryCount} of {assets.length} items classified as physical/in-kind</div>
        </div>

        <div className="p-4 rounded-xl border border-[#222] bg-[#111] shadow-xl space-y-1">
          <div className="flex items-center justify-between text-[#888]">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Acquisition Base</span>
            <Building2 className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-semibold text-white">
            {currencySymbol}{Math.round(convertAmount(totalAcquisitionCostUSD)).toLocaleString()}
          </div>
          <div className="text-[10px] text-[#666]">Historical gross purchase value</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-[#222] bg-[#111] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#666]" />
          <input
            type="text"
            placeholder="Search by tag, equipment name, custodian, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#222] bg-[#141414] text-white placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Asset Category Filter"
            className="p-2 rounded-lg border border-[#222] bg-[#141414] text-[#d1d1d1] focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#141414]">All Categories</option>
            <option value="Equipment & Fleet" className="bg-[#141414]">Equipment & Fleet</option>
            <option value="Proprietary Technology" className="bg-[#141414]">Proprietary Technology</option>
            <option value="In-Kind Contribution / Grant" className="bg-[#141414]">In-Kind Contribution / Grant (Nonprofit)</option>
            <option value="Real Estate & Facilities" className="bg-[#141414]">Real Estate & Facilities</option>
            <option value="Financial & Treasury Asset" className="bg-[#141414]">Financial & Treasury Asset</option>
          </select>

          {/* Toggle Non-monetary only */}
          <button
            onClick={() => setFilterNonMonetaryOnly(!filterNonMonetaryOnly)}
            className={`px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
              filterNonMonetaryOnly 
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                : 'border-[#222] bg-[#141414] text-[#888] hover:text-white'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Non-Monetary Only</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-xl border border-[#222] bg-[#111] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414] text-[10px] uppercase font-bold text-[#666] tracking-wider">
                <th className="py-3 px-4">Tag / Asset</th>
                <th className="py-3 px-4">Category & Scope</th>
                <th className="py-3 px-4">Book Value ({selectedCurrency})</th>
                <th className="py-3 px-4">Fair Market Value</th>
                <th className="py-3 px-4">Amortization</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Custodian / Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c] text-[#d1d1d1]">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#666]">
                    No assets match your active search or classification criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const bookValConv = Math.round(convertAmount(asset.currentBookValue));
                  const fmvConv = Math.round(convertAmount(asset.fairMarketValue));
                  return (
                    <tr key={asset.id} className="hover:bg-[#161616] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[11px] text-indigo-400 font-semibold">{asset.tagNumber}</div>
                        <div className="font-medium text-white text-xs">{asset.name}</div>
                        {asset.grantOrDonorReference && (
                          <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                            Grant Ref: {asset.grantOrDonorReference}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-white">{asset.category}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono mt-0.5 ${
                          asset.isNonMonetary 
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {asset.isNonMonetary ? 'Non-Monetary' : 'Financial'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {currencySymbol}{bookValConv.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#666]">Cost: {currencySymbol}{Math.round(convertAmount(asset.acquisitionCost)).toLocaleString()}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-emerald-400">
                          {currencySymbol}{fmvConv.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#666]">{asset.depreciationMethod}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs">{asset.depreciationRatePercent}% / yr</div>
                        <div className="text-[10px] text-rose-400/80">
                          Depr: -{currencySymbol}{Math.round(convertAmount(asset.accumulatedDepreciation)).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          asset.condition === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          asset.condition === 'Good' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                          asset.condition === 'Fair' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {asset.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-white">{asset.custodian}</div>
                        <div className="text-[10px] text-[#666] truncate max-w-[150px]">{asset.location}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg text-[#666] hover:text-rose-400 hover:bg-[#1f1f1f] transition cursor-pointer"
                          title="Decommission / Remove Asset"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-xl border border-[#222] bg-[#0F0F0F] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div>
                <h3 className="font-medium text-base text-white">Register Capital or Non-Monetary Asset</h3>
                <p className="text-[11px] text-[#888]">Track asset tag, non-monetary status, and depreciation model.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#666] hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Asset Tag Number</label>
                  <input
                    type="text"
                    required
                    value={tagNumber}
                    onChange={(e) => setTagNumber(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Asset Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategory)}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Equipment & Fleet">Equipment & Fleet</option>
                    <option value="Proprietary Technology">Proprietary Technology</option>
                    <option value="In-Kind Contribution / Grant">In-Kind Contribution / Grant</option>
                    <option value="Real Estate & Facilities">Real Estate & Facilities</option>
                    <option value="Financial & Treasury Asset">Financial & Treasury Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Asset Designation / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Transporter Fleet Unit 105"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-[#222] bg-[#141414]">
                <input
                  type="checkbox"
                  id="nonMonetaryCheck"
                  checked={isNonMonetary}
                  onChange={(e) => setIsNonMonetary(e.target.checked)}
                  className="rounded border-[#333] text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                />
                <label htmlFor="nonMonetaryCheck" className="text-xs text-[#d1d1d1] cursor-pointer">
                  <span className="font-semibold text-white">Non-Monetary Asset Classification</span>
                  <p className="text-[10px] text-[#888]">Asset is tangible property, equipment, IP, or nonprofit in-kind grant (not cash reserves).</p>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Acquisition Cost ({selectedCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Fair Market Value ({selectedCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={fairMarketValue}
                    onChange={(e) => setFairMarketValue(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Depreciation Method</label>
                  <select
                    value={depreciationMethod}
                    onChange={(e) => setDepreciationMethod(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Straight-Line">Straight-Line</option>
                    <option value="Declining Balance">Declining Balance</option>
                    <option value="Fair Value Revaluation">Fair Value Revaluation</option>
                    <option value="None (In-Kind / Land)">None (In-Kind / Land)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Annual Depreciation %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={depreciationRatePercent}
                    onChange={(e) => setDepreciationRatePercent(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Custodian / Responsible Lead</label>
                  <input
                    type="text"
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Physical / Virtual Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#666] mb-1">Grant / Donor Reference (Nonprofit in-kind)</label>
                <input
                  type="text"
                  placeholder="e.g. USAID-2026-Grant-B9 (optional)"
                  value={grantOrDonorReference}
                  onChange={(e) => setGrantOrDonorReference(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#222] bg-[#141414] text-white focus:outline-none focus:border-indigo-500"
                />
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
