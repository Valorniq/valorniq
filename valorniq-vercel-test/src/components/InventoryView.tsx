import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Package, Search, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { createDocument, updateDocument, removeDocument } from '../services/firebase';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
}

const InventoryView: React.FC<InventoryViewProps> = ({ products }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    category: 'General'
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;
    await createDocument('products', newProduct);
    setNewProduct({ name: '', sku: '', price: 0, stock: 0, category: 'General' });
    setIsAdding(false);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateDocument('products', editingProduct.id, {
      name: editingProduct.name,
      sku: editingProduct.sku,
      price: editingProduct.price,
      stock: editingProduct.stock,
      category: editingProduct.category
    });
    setEditingProduct(null);
  };

  const handleExport = () => {
    const data = {
      report: 'INVENTORY_MANIFEST',
      timestamp: new Date().toISOString(),
      totalItems: products.length,
      valuation: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
      items: products
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_audit_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const replenishStock = async (id: string, currentStock: number) => {
    const amount = 50;
    await updateDocument('products', id, { stock: currentStock + amount });
    alert(`Logistics Pipeline: Securely dispatched ${amount} units to SKU link. Asset ledger updated.`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="inventory-view" className="p-8 max-w-7xl mx-auto space-y-8">
       <div className="flex items-center justify-between">
        <header className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Inventory Control</h2>
          <p className="text-slate-500 text-sm">Real-time stock monitoring and replenishment coordination.</p>
        </header>

        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            Export Sheet
          </button>
          <button 
            id="btn-add-product"
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all focus-within:border-indigo-300">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            id="search-inventory"
            type="text" 
            placeholder="Query products by SKU or Material Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 outline-none"
          />
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600 relative z-10">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Logic: Low Stock</p>
            <p className="text-sm font-bold text-amber-900">
              {products.filter(p => p.stock < 10).length} Line Items Below Limit
            </p>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200/20 rounded-full -mr-8 -mt-8" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Product Line</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Valuation</th>
              <th className="px-6 py-4 text-right pr-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <motion.tr 
                key={product.id}
                layout
                className="hover:bg-slate-50/80 transition-all group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${product.stock < 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                      {product.stock.toString().padStart(3, '0')}
                    </span>
                    {product.stock < 10 && (
                      <button 
                        onClick={() => replenishStock(product.id, product.stock)}
                        className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter hover:underline"
                      >
                        REPLENISH
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-mono font-bold text-slate-900">${product.price.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4 text-right pr-6">
                  <div className="flex items-center justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2 hover:bg-white hover:text-indigo-600 text-slate-400 rounded-xl border border-transparent hover:border-slate-200 shadow-sm transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeDocument('products', product.id)}
                      className="p-2 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                      <Package className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Stock Repository Empty</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <h3 className="text-2xl font-bold">Register Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                  <input 
                    required
                    id="new-product-name"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SKU / Identifier</label>
                  <input 
                    required
                    id="new-product-sku"
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price ($)</label>
                    <input 
                      type="number"
                      id="new-product-price"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Inital Stock</label>
                    <input 
                      type="number"
                      id="new-product-stock"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold bg-[#141414] text-white hover:shadow-lg transition-all"
                  >
                    Add to Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <h3 className="text-2xl font-bold">Edit Product</h3>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                  <input 
                    required
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stock</label>
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#141414]"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold bg-[#141414] text-white hover:shadow-lg transition-all"
                  >
                    Update Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryView;
