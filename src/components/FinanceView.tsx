import React, { useState } from 'react';
import { DollarSign, FileText, Receipt, Landmark, Plus, Download, Eye, Tag, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Invoice, Expense, AccountBalance } from '../types';
import { exportToCSV } from '../utils/csvExport';

interface FinanceViewProps {
  invoices: Invoice[];
  expenses: Expense[];
  balances: AccountBalance;
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'issuedDate'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onUpdateExpenseStatus: (id: string, status: Expense['status']) => void;
  isDark: boolean;
}

export default function FinanceView({
  invoices,
  expenses,
  balances,
  onAddInvoice,
  onAddExpense,
  onUpdateInvoiceStatus,
  onUpdateExpenseStatus,
  isDark
}: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'invoices' | 'expenses'>('accounts');
  
  // Sorting state for Invoices
  const [invoiceSortField, setInvoiceSortField] = useState<keyof Invoice>('dueDate');
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sorting state for Expenses
  const [expenseSortField, setExpenseSortField] = useState<keyof Expense>('date');
  const [expenseSortOrder, setExpenseSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleInvoiceSort = (field: keyof Invoice) => {
    if (invoiceSortField === field) {
      setInvoiceSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setInvoiceSortField(field);
      setInvoiceSortOrder('asc');
    }
  };

  const handleExpenseSort = (field: keyof Expense) => {
    if (expenseSortField === field) {
      setExpenseSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setExpenseSortField(field);
      setExpenseSortOrder('asc');
    }
  };

  const renderSortIcon = (field: string, currentField: string, order: 'asc' | 'desc') => {
    if (field !== currentField) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600 transition" />;
    }
    return order === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 text-[#6E56CF] transition" />
      : <ArrowDown className="h-3.5 w-3.5 text-[#6E56CF] transition" />;
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    let valA = a[invoiceSortField];
    let valB = b[invoiceSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return invoiceSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return invoiceSortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedExpenses = [...expenses].sort((a, b) => {
    let valA = a[expenseSortField];
    let valB = b[expenseSortField];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return expenseSortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return expenseSortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [viewInvoiceDetail, setViewInvoiceDetail] = useState<Invoice | null>(null);

  // New Invoice inputs
  const [invClientName, setInvClientName] = useState('');
  const [invClientEmail, setInvClientEmail] = useState('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invItemDesc, setInvItemDesc] = useState('');
  const [invItemQty, setInvItemQty] = useState(1);
  const [invItemPrice, setInvItemPrice] = useState(0);

  // New Expense inputs
  const [expMerchant, setExpMerchant] = useState('');
  const [expCategory, setExpCategory] = useState<'Software' | 'Marketing' | 'Office' | 'Compliance' | 'Travel' | 'Operations'>('Software');
  const [expAmount, setExpAmount] = useState(0);
  const [expReference, setExpReference] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  const handleInvoiceCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName || !invDueDate || !invItemDesc || invItemPrice <= 0) return;
    
    const totalAmount = Number(invItemQty) * Number(invItemPrice);

    onAddInvoice({
      clientName: invClientName,
      clientEmail: invClientEmail || 'billing@client.com',
      amount: totalAmount,
      status: 'Pending',
      dueDate: invDueDate,
      items: [{ description: invItemDesc, quantity: Number(invItemQty), unitPrice: Number(invItemPrice) }]
    });

    setInvClientName('');
    setInvClientEmail('');
    setInvDueDate('');
    setInvItemDesc('');
    setInvItemQty(1);
    setInvItemPrice(0);
    setShowAddInvoiceModal(false);
  };

  const handleExpenseCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expMerchant || expAmount <= 0) return;

    onAddExpense({
      merchant: expMerchant,
      category: expCategory,
      amount: Number(expAmount),
      date: expDate || new Date().toISOString().split('T')[0],
      reference: expReference || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending'
    });

    setExpMerchant('');
    setExpCategory('Software');
    setExpAmount(0);
    setExpReference('');
    setShowAddExpenseModal(false);
  };

  const handleExportCSV = () => {
    if (activeTab === 'invoices') {
      exportToCSV(invoices, {
        invoiceNumber: 'Invoice Number',
        clientName: 'Client Recipient',
        clientEmail: 'Client Email',
        amount: 'Billing Amount ($)',
        dueDate: 'Due Date',
        issuedDate: 'Issued Date',
        status: 'Invoice Status',
        items: 'Line Items'
      }, 'valorniq_invoices_ledger');
    } else if (activeTab === 'expenses') {
      exportToCSV(expenses, {
        merchant: 'Merchant Vendor',
        category: 'Cost Center Category',
        amount: 'Expense Amount ($)',
        date: 'Filing Date',
        reference: 'Receipt Code Ref',
        status: 'Status'
      }, 'valorniq_expenses_ledger');
    } else if (activeTab === 'accounts') {
      const balanceData = [
        { account: 'Primary Checking', balance: balances.checking, notes: 'Operational Liquidity' },
        { account: 'Yield Savings', balance: balances.savings, notes: 'Reserve Capital Treasury' },
        { account: 'Accounts Receivable', balance: balances.receivables, notes: 'Unsettled Client Invoices' },
        { account: 'Accounts Payable', balance: balances.payables, notes: 'Pending Operating Expenses' }
      ];
      exportToCSV(balanceData, {
        account: 'Account',
        balance: 'Ledger Balance ($)',
        notes: 'Operational Footnote'
      }, 'valorniq_accounts_balances');
    }
  };

  const totalExpenseBurns = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-white">Finance & Ledger Hub</h2>
          <p className="text-xs text-[#888] mt-1">
            Accounts balances, itemized invoices, payment tracking, and operational cost controls.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-xs font-medium flex items-center text-[#d1d1d1] shadow-sm cursor-pointer transition"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-indigo-400" /> Export CSV
          </button>

          {activeTab === 'invoices' ? (
            <button
              onClick={() => setShowAddInvoiceModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium flex items-center shadow-lg shadow-indigo-900/20 cursor-pointer transition"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Draft Invoice
            </button>
          ) : activeTab === 'expenses' ? (
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-medium flex items-center shadow-lg shadow-indigo-900/20 cursor-pointer transition"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Log Expense
            </button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-[#141414] border border-[#222] rounded-lg max-w-max text-xs">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-[#222] text-white shadow-sm border border-[#333]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Landmark className="h-3.5 w-3.5 text-indigo-400" />
            <span>Accounts & Treasury</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-[#222] text-white shadow-sm border border-[#333]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>Invoices Ledger ({invoices.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-3.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-[#222] text-white shadow-sm border border-[#333]'
              : 'text-[#888] hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Receipt className="h-3.5 w-3.5 text-indigo-400" />
            <span>Operating Expenses ({expenses.length})</span>
          </div>
        </button>
      </div>

      <div className="mt-4">
        {/* TAB 1: Accounts */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-[#222] bg-[#111] hover:border-[#333] transition shadow-sm">
                <span className="text-[11px] uppercase font-bold text-[#555] tracking-wider">Checking Balance</span>
                <p className="text-3xl font-light tracking-tight mt-2 text-white">${balances.checking.toLocaleString()}</p>
                <p className="text-xs text-[#888] mt-1">Tenant Primary Account</p>
              </div>

              <div className="p-5 rounded-xl border border-[#222] bg-[#111] hover:border-[#333] transition shadow-sm">
                <span className="text-[11px] uppercase font-bold text-[#555] tracking-wider">Yield Savings</span>
                <p className="text-3xl font-light tracking-tight mt-2 text-white">${balances.savings.toLocaleString()}</p>
                <p className="text-xs text-[#888] mt-1">SaaS Reserve Treasury</p>
              </div>

              <div className="p-5 rounded-xl border border-[#222] bg-[#111] hover:border-[#333] transition shadow-sm">
                <span className="text-[11px] uppercase font-bold text-amber-500 tracking-wider">Receivables</span>
                <p className="text-3xl font-light tracking-tight mt-2 text-amber-400">${balances.receivables.toLocaleString()}</p>
                <p className="text-xs text-[#888] mt-1">Unpaid Client Invoices</p>
              </div>

              <div className="p-5 rounded-xl border border-[#222] bg-[#111] hover:border-[#333] transition shadow-sm">
                <span className="text-[11px] uppercase font-bold text-rose-400 tracking-wider">Payables</span>
                <p className="text-3xl font-light tracking-tight mt-2 text-rose-400">${balances.payables.toLocaleString()}</p>
                <p className="text-xs text-[#888] mt-1">Pending Unapproved Outflows</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl">
                <h3 className="font-semibold text-sm text-white">Treasury Reconciliation</h3>
                <p className="text-xs text-[#888] mt-0.5 mb-4">Unified liquidity tracking ledger</p>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#1A1A1A] text-[#AAA]">
                    <span>Liquid Cash & Reserves</span>
                    <span className="font-medium text-white">${(balances.checking + balances.savings).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1A1A1A] text-[#AAA]">
                    <span>Pending Inbound Receivables</span>
                    <span className="font-medium text-amber-400">${balances.receivables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#1A1A1A] text-[#AAA]">
                    <span>Approved Expense Deductions</span>
                    <span className="font-medium text-rose-400">-${totalExpenseBurns.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 pt-3 font-semibold text-sm border-t border-[#222] text-white">
                    <span>Net Effective Capital</span>
                    <span className="text-indigo-400">${(balances.checking + balances.savings + balances.receivables - totalExpenseBurns).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#222] bg-[#111] shadow-xl">
                <h3 className="font-semibold text-sm text-white">Cost Center Distribution</h3>
                <p className="text-xs text-[#888] mt-0.5 mb-4">Expense categories breakdown</p>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#AAA] font-medium">Software & Cloud Infra</span>
                      <span className="font-semibold text-white">55%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] border border-[#222] h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '55%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#AAA] font-medium">Marketing & Sales Drive</span>
                      <span className="font-semibold text-white">25%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] border border-[#222] h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#AAA] font-medium">Compliance, Legal & Audits</span>
                      <span className="font-semibold text-white">20%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] border border-[#222] h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Invoices */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                    <th 
                      className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                      onClick={() => handleInvoiceSort('invoiceNumber')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Invoice #</span>
                        {renderSortIcon('invoiceNumber', invoiceSortField, invoiceSortOrder)}
                      </div>
                    </th>
                    <th 
                      className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                      onClick={() => handleInvoiceSort('clientName')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Client</span>
                        {renderSortIcon('clientName', invoiceSortField, invoiceSortOrder)}
                      </div>
                    </th>
                    <th 
                      className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                      onClick={() => handleInvoiceSort('amount')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Amount</span>
                        {renderSortIcon('amount', invoiceSortField, invoiceSortOrder)}
                      </div>
                    </th>
                    <th 
                      className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                      onClick={() => handleInvoiceSort('dueDate')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Due Date</span>
                        {renderSortIcon('dueDate', invoiceSortField, invoiceSortOrder)}
                      </div>
                    </th>
                    <th 
                      className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                      onClick={() => handleInvoiceSort('status')}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>Status</span>
                        {renderSortIcon('status', invoiceSortField, invoiceSortOrder)}
                      </div>
                    </th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
                  {sortedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#666]">
                        No invoices generated yet
                      </td>
                    </tr>
                  ) : (
                    sortedInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#141414] transition">
                        <td className="p-3.5 font-mono font-medium text-indigo-400">
                          INV-{inv.invoiceNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-white capitalize">{inv.clientName}</div>
                          <div className="text-[10px] text-[#666] font-mono">{inv.clientEmail}</div>
                        </td>
                        <td className="p-3.5 font-medium font-mono text-white">
                          ${inv.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-[#888] font-mono">
                          {inv.dueDate}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                            inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            inv.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => onUpdateInvoiceStatus(inv.id, 'Paid')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium px-2.5 py-1 rounded-md text-[10px] border border-emerald-500/30 cursor-pointer transition"
                            >
                              Settle (Mark Paid)
                            </button>
                          )}
                          <button
                            onClick={() => setViewInvoiceDetail(inv)}
                            className="bg-[#1A1A1A] hover:bg-[#222] border border-[#333] text-[#d1d1d1] px-2.5 py-1 rounded-md text-[10px] font-medium cursor-pointer transition"
                          >
                            <Eye className="h-3 w-3 inline mr-1 text-indigo-400" /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Detailed Statement View */}
            {viewInvoiceDetail && (
              <div className="p-5 rounded-xl border border-[#222] bg-[#0D0D0D] mt-4 text-xs flex flex-col space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#222]">
                  <h4 className="font-medium text-sm text-white">Invoice Statement: <span className="font-mono text-indigo-400">#INV-{viewInvoiceDetail.invoiceNumber}</span></h4>
                  <button onClick={() => setViewInvoiceDetail(null)} className="font-medium text-[#888] hover:text-white cursor-pointer">Close</button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[#AAA]">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[#555]">Client Info</span>
                    <span className="font-medium text-white text-sm capitalize">{viewInvoiceDetail.clientName}</span>
                    <span className="block font-mono text-[11px] text-[#666]">{viewInvoiceDetail.clientEmail}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[#555]">Billing Timeline</span>
                    <span className="text-[#AAA]">Issued: {viewInvoiceDetail.issuedDate}</span>
                    <span className="block font-medium text-rose-400">Due: {viewInvoiceDetail.dueDate}</span>
                  </div>
                </div>

                <div className="bg-[#111] p-4 rounded-lg border border-[#222]">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="text-[#555] border-b border-[#222] pb-2 text-[10px] uppercase">
                        <th className="py-1.5">Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th className="text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A]">
                      {viewInvoiceDetail.items?.map((item, idx) => (
                        <tr key={idx} className="text-[#d1d1d1]">
                          <td className="py-2.5">{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>${item.unitPrice.toLocaleString()}</td>
                          <td className="text-right font-medium text-white">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Expenses */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleExpenseSort('merchant')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Merchant / Vendor</span>
                      {renderSortIcon('merchant', expenseSortField, expenseSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleExpenseSort('reference')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Receipt Code</span>
                      {renderSortIcon('reference', expenseSortField, expenseSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleExpenseSort('amount')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Amount</span>
                      {renderSortIcon('amount', expenseSortField, expenseSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleExpenseSort('date')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Date</span>
                      {renderSortIcon('date', expenseSortField, expenseSortOrder)}
                    </div>
                  </th>
                  <th 
                    className="p-3.5 cursor-pointer hover:bg-[#141414] transition"
                    onClick={() => handleExpenseSort('status')}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>Status</span>
                      {renderSortIcon('status', expenseSortField, expenseSortOrder)}
                    </div>
                  </th>
                  <th className="p-3.5 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
                {sortedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#666]">
                      No expenses logged yet
                    </td>
                  </tr>
                ) : (
                  sortedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#141414] transition">
                      <td className="p-3.5">
                        <div className="font-medium text-white">{exp.merchant}</div>
                        <span className="inline-flex items-center text-[10px] text-[#888] font-medium">
                          <Tag className="h-3 w-3 mr-1 text-indigo-400" /> {exp.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[#AAA]">{exp.reference}</td>
                      <td className="p-3.5 font-medium font-mono text-white">
                        ${exp.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-[#888] font-mono">{exp.date}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                          exp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          exp.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {exp.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => onUpdateExpenseStatus(exp.id, 'Approved')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium px-2.5 py-1 rounded-md text-[10px] border border-emerald-500/30 cursor-pointer transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onUpdateExpenseStatus(exp.id, 'Rejected')}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium px-2.5 py-1 rounded-md text-[10px] border border-rose-500/30 cursor-pointer transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Draft Invoice */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Draft Corporate Invoice</h3>
              <button 
                onClick={() => setShowAddInvoiceModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvoiceCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Billing Client</label>
                <input
                  required
                  type="text"
                  placeholder="Acme Corporation"
                  value={invClientName}
                  onChange={(e) => setInvClientName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Client Email</label>
                <input
                  type="email"
                  placeholder="billing@acme.com"
                  value={invClientEmail}
                  onChange={(e) => setInvClientEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Due Date</label>
                <input
                  required
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Service Description</label>
                <input
                  required
                  type="text"
                  placeholder="Cloud Infrastructure Retainer Services"
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={invItemQty}
                    onChange={(e) => setInvItemQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    value={invItemPrice}
                    onChange={(e) => setInvItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Draft Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log Expense */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Log Operating Expense</h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Merchant / Vendor</label>
                <input
                  required
                  type="text"
                  placeholder="AWS Cloud Services"
                  value={expMerchant}
                  onChange={(e) => setExpMerchant(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Cost Center</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Software">Software & Cloud</option>
                    <option value="Marketing">Marketing Campaigns</option>
                    <option value="Office">Office & Logistics</option>
                    <option value="Compliance">Security & Audits</option>
                    <option value="Travel">Business Travel</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Amount ($)</label>
                  <input
                    required
                    type="number"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Reference Code</label>
                <input
                  type="text"
                  placeholder="AWS-REF-9021"
                  value={expReference}
                  onChange={(e) => setExpReference(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Log Outflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
