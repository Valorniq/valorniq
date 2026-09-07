import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Search, Plus, FileText, Download } from 'lucide-react';
import { SalesOrder, Customer, Product } from '../types';

interface SalesViewProps {
  sales: SalesOrder[];
  customers: Customer[];
  products: Product[];
  onAddSalesOrder: (order: Omit<SalesOrder, 'id' | 'createdAt'>) => void;
  onUpdateOrderStatus: (id: string, status: SalesOrder['status']) => void;
  isDark: boolean;
}

export default function SalesView({
  sales,
  customers,
  products,
  onAddSalesOrder,
  onUpdateOrderStatus,
  isDark
}: SalesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'confirmed' | 'shipped' | 'cancelled'>('all');
  const [isAddingOrder, setIsAddingOrder] = useState(false);

  // New order form inputs
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState(1);

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Direct Enterprise Client';
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Product';
  
  const filteredSales = sales.filter(s => {
    const customerName = s.customerName || getCustomerName(s.customerId);
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadManifest = (order: SalesOrder) => {
    const manifest = {
      orderId: order.id,
      timestamp: new Date().toISOString(),
      customer: order.customerName || getCustomerName(order.customerId),
      items: order.items.map(item => ({
        ...item,
        productName: item.productName || getProductName(item.productId)
      })),
      status: order.status,
      totalValue: order.totalValue
    };
    
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_manifest_${order.id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct) || products[0];
    if (!product) {
      alert("Please register at least one product in Inventory first.");
      return;
    }

    const price = product.price || 100;
    const qty = Number(orderQuantity) || 1;
    const total = price * qty;
    const cust = customers.find(c => c.id === selectedCustomer) || customers[0];

    onAddSalesOrder({
      customerId: cust?.id || 'cust-1',
      customerName: cust?.name || 'Valorniq Client',
      items: [{
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: price
      }],
      totalValue: total,
      status: 'confirmed',
      orderDate: new Date().toISOString().split('T')[0]
    });

    setIsAddingOrder(false);
  };

  const totalCumulativeSales = sales.reduce((acc, s) => acc + (s.totalValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">Sales Orders & Fulfillment</h2>
          <p className="text-xs text-[#888] mt-1">
            Confirmed commercial transactions, order fulfillment tracking, and packing manifests.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-[#666] uppercase tracking-wider">Total Sales Billed</p>
            <p className="text-lg font-mono font-medium text-emerald-400">${totalCumulativeSales.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setIsAddingOrder(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-900/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Sales Order
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 bg-[#111] p-2.5 rounded-xl border border-[#222] shadow-sm flex items-center gap-3">
          <Search className="h-4 w-4 text-[#555] ml-2" />
          <input 
            type="text" 
            placeholder="Filter orders by customer identity or order number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white placeholder-[#555]"
          />
        </div>
        <div className="flex bg-[#111] border border-[#222] p-1 rounded-xl">
           {(['all', 'draft', 'confirmed', 'shipped', 'cancelled'] as const).map(s => (
             <button 
               key={s}
               onClick={() => setStatusFilter(s)}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                 statusFilter === s ? 'bg-[#222] text-white shadow-sm' : 'text-[#666] hover:text-[#AAA]'
               }`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSales.length === 0 ? (
          <div className="col-span-full p-12 text-center text-[#666] border border-dashed border-[#222] rounded-xl bg-[#0F0F0F]">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-[#444]" />
            <p className="text-xs font-medium text-[#888]">No sales orders found</p>
            <p className="text-[10px] text-[#666] mt-1">Create your first sales order using the button above.</p>
          </div>
        ) : (
          filteredSales.map((order) => (
            <div 
              key={order.id}
              className="p-5 rounded-xl border border-[#222] bg-[#0F0F0F] text-[#d1d1d1] shadow-xl transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#666] uppercase tracking-wider">
                      ORD-{order.id.slice(0, 6).toUpperCase()}
                    </span>
                    <h4 className="font-medium text-sm text-white mt-0.5">
                      {order.customerName || getCustomerName(order.customerId)}
                    </h4>
                  </div>
                  <div className={`p-1.5 rounded-lg ${
                    order.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                    order.status === 'shipped' ? 'bg-indigo-500/10 text-indigo-400' :
                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-[#1A1A1A] text-[#888]'
                  }`}>
                    {order.status === 'confirmed' ? <CheckCircle2 className="h-4 w-4" /> :
                     order.status === 'shipped' ? <ShoppingBag className="h-4 w-4" /> :
                     order.status === 'cancelled' ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </div>
                </div>

                <div className="space-y-2 py-3 border-t border-[#222] text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-[#AAA] truncate max-w-[180px]">
                        {item.productName || getProductName(item.productId)} (x{item.quantity})
                      </span>
                      <span className="font-mono font-medium text-white">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#222] flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-[#666] block">Status</span>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as SalesOrder['status'])}
                    className="bg-[#141414] border border-[#222] rounded px-2 py-0.5 text-indigo-400 font-medium text-xs focus:outline-none cursor-pointer capitalize mt-0.5"
                  >
                    <option value="draft" className="bg-[#141414] text-white">Draft</option>
                    <option value="confirmed" className="bg-[#141414] text-white">Confirmed</option>
                    <option value="shipped" className="bg-[#141414] text-white">Shipped</option>
                    <option value="cancelled" className="bg-[#141414] text-white">Cancelled</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#666] block">Total</span>
                  <span className="text-base font-medium font-mono text-emerald-400">
                    ${(order.totalValue || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadManifest(order)}
                className="mt-3 w-full py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] hover:bg-[#222] text-[10px] font-medium text-[#d1d1d1] flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <FileText className="h-3 w-3 text-indigo-400" />
                Download Packing Manifest
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Create Order */}
      {isAddingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Create Sales Order</h3>
              <button 
                onClick={() => setIsAddingOrder(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOrderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {customers.length === 0 ? (
                    <option value="default" className="bg-[#141414]">Default Client Account</option>
                  ) : (
                    customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#141414]">{c.name} ({c.email})</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Product Item</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {products.length === 0 ? (
                    <option value="none" className="bg-[#141414]">No products in inventory</option>
                  ) : (
                    products.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#141414]">{p.name} — ${p.price} ({p.stock} in stock)</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingOrder(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
