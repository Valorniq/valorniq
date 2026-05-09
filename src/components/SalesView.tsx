import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, FileText, CheckCircle2, Clock, XCircle, Search, ShoppingCart } from 'lucide-react';
import { SalesOrder, Customer, Product } from '../types';

interface SalesViewProps {
  sales: SalesOrder[];
  customers: Customer[];
  products: Product[];
}

const SalesView: React.FC<SalesViewProps> = ({ sales, customers, products }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown Customer';
  
  const filteredSales = sales.filter(s => 
    getCustomerName(s.customerId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadManifest = (order: SalesOrder) => {
    const manifest = {
      orderId: order.id,
      timestamp: new Date().toISOString(),
      customer: getCustomerName(order.customerId),
      items: order.items.map(item => ({
        ...item,
        productName: products.find(p => p.id === item.productId)?.name || 'Unknown Item'
      })),
      status: order.status,
      total: order.totalValue
    };
    
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order_manifest_${order.id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="sales-view" className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <header className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sales History</h2>
          <p className="text-slate-500 text-sm">Audited transaction records and fulfillment tracking.</p>
        </header>

        <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Cumulative Revenue</p>
            <p className="text-xl font-bold text-emerald-600">${sales.reduce((acc, s) => acc + s.totalValue, 0).toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all focus-within:border-indigo-300">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input 
          id="search-orders"
          type="text" 
          placeholder="Filter orders by customer identity or serial #..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSales.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer relative group overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ORDER SEC-{order.id.slice(0,6).toUpperCase()}</p>
                <h4 className="font-bold text-lg text-slate-900 leading-tight">{getCustomerName(order.customerId)}</h4>
              </div>
              <div className={`p-2 rounded-xl ${
                order.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600' :
                order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                'bg-slate-50 text-slate-600'
              }`}>
                {order.status === 'confirmed' ? <CheckCircle2 className="w-5 h-5" /> :
                 order.status === 'shipped' ? <ShoppingBag className="w-5 h-5" /> :
                 order.status === 'cancelled' ? <XCircle className="w-5 h-5" /> :
                 <Clock className="w-5 h-5" />}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 mb-8">
              {order.items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="text-slate-600 font-medium">{products.find(p => p.id === item.productId)?.name || 'Line Item'} (x{item.quantity})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {order.items.length > 2 && (
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest pl-3">+{order.items.length - 2} Additional Items</p>
              )}
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verification Status</p>
                <p className="text-xs font-bold text-slate-900 capitalize">{order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Value</p>
                <p className="text-2xl font-bold text-slate-900 font-mono">${order.totalValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex justify-center translate-y-8 group-hover:translate-y-0 duration-500 bg-gradient-to-t from-white via-white/95 to-transparent pt-12">
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadManifest(order);
                }}
                className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 shadow-2xl active:scale-95 transition-all"
               >
                 <FileText className="w-3.5 h-3.5 text-indigo-400" />
                 Download Manifest
               </button>
            </div>
          </motion.div>
        ))}

        {filteredSales.length === 0 && (
          <div className="col-span-full py-40 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
              <ShoppingCart className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Vault Empty</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-xs mt-3 leading-relaxed font-medium uppercase tracking-wider">No transactional records detected in the current ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// View Component
export default SalesView;
