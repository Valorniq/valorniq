import React, { useState } from 'react';
import { Plus, Package, Search, AlertTriangle, Edit2, Trash2, Download, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  isDark: boolean;
}

export default function InventoryView({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  isDark
}: InventoryViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: 100,
    stock: 25,
    category: 'General'
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;
    onAddProduct({
      name: newProduct.name,
      sku: newProduct.sku,
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0,
      category: newProduct.category
    });
    setNewProduct({ name: '', sku: '', price: 100, stock: 25, category: 'General' });
    setIsAdding(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct.id, {
      name: editingProduct.name,
      sku: editingProduct.sku,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock),
      category: editingProduct.category
    });
    setEditingProduct(null);
  };

  const handleReplenish = (id: string, currentStock: number) => {
    onUpdateProduct(id, { stock: currentStock + 25 });
  };

  const handleExport = () => {
    const data = {
      report: 'INVENTORY_AUDIT_MANIFEST',
      timestamp: new Date().toISOString(),
      totalSKUs: products.length,
      valuation: products.reduce((acc, p) => acc + (p.price * p.stock), 0),
      items: products
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_manifest_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockCount = products.filter(p => p.stock < 10).length;
  const totalValuation = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2 border-b border-[#222] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-white">Inventory & Stock Tracking</h2>
          <p className="text-xs text-[#888] mt-1">
            Product catalog, SKU tracking, live inventory valuation, and stock replenishment workflows.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-xs font-medium text-[#d1d1d1] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            Export Manifest
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-900/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Register Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-[#111] p-3 rounded-xl border border-[#222] shadow-sm flex items-center gap-3">
          <Search className="h-4 w-4 text-[#555] ml-2" />
          <input 
            type="text" 
            placeholder="Search by Product Name, SKU, or Category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-white placeholder-[#555]"
          />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Low Stock Threshold</p>
            <p className="text-xs font-medium font-mono text-amber-300">
              {lowStockCount} SKU{lowStockCount === 1 ? '' : 's'} below 10 units
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-[#222] rounded-xl bg-[#111] shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0D0D0D] border-b border-[#222] text-[#555] text-[10px] font-bold uppercase tracking-wider">
              <th className="p-3.5">Product & SKU</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Stock Level</th>
              <th className="p-3.5">Unit Price</th>
              <th className="p-3.5">Asset Value</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A] text-[#d1d1d1]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#666]">
                  No inventory products registered yet
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#141414] transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-indigo-400">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="font-mono text-[10px] text-[#666] uppercase">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-[#1A1A1A] border border-[#2A2A2A] text-[#AAA] px-2 py-0.5 rounded text-[10px] font-medium">
                      {p.category || 'General'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-medium ${p.stock < 10 ? 'text-rose-400' : 'text-white'}`}>
                        {p.stock}
                      </span>
                      {p.stock < 10 && (
                        <button
                          onClick={() => handleReplenish(p.id, p.stock)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center cursor-pointer transition"
                          title="Replenish +25 units"
                        >
                          <RefreshCw className="h-2.5 w-2.5 mr-0.5" /> +25 Units
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[#AAA]">${p.price.toLocaleString()}</td>
                  <td className="p-3.5 font-mono font-medium text-white">${(p.price * p.stock).toLocaleString()}</td>
                  <td className="p-3.5 text-right space-x-1">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-1.5 hover:bg-[#1A1A1A] rounded-lg text-[#888] hover:text-white cursor-pointer transition"
                      title="Edit Product"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-[#888] hover:text-rose-400 rounded-lg cursor-pointer transition"
                      title="Delete Product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl bg-[#0F0F0F] border border-[#222] flex items-center justify-between text-xs">
        <span className="text-[#888]">Total Catalog Inventory Valuation:</span>
        <span className="font-medium font-mono text-indigo-400 text-sm">${totalValuation.toLocaleString()}</span>
      </div>

      {/* Modal: Add Product */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Register Inventory Product</h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Product Name</label>
                <input 
                  required
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enterprise Core License"
                />
              </div>
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">SKU / Code</label>
                <input 
                  required
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newProduct.sku}
                  onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  placeholder="SKU-COR-990"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Unit Price ($)</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Initial Stock</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Category</label>
                <input 
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="Software / Hardware / Logistics"
                />
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Product */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-xl shadow-2xl space-y-4 bg-[#0F0F0F] border border-[#222] text-[#d1d1d1]">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-medium text-sm text-white">Edit Product</h3>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1 hover:bg-[#1A1A1A] text-[#888] hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Product Name</label>
                <input 
                  required
                  className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Price ($)</label>
                  <input 
                    type="number"
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-[#666] text-[10px] uppercase font-bold mb-1">Current Stock</label>
                  <input 
                    type="number"
                    className="w-full p-2.5 rounded-lg border border-[#222] bg-[#141414] text-white text-xs placeholder-[#555] focus:outline-none focus:border-indigo-500 transition-colors"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 font-medium bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-[#d1d1d1] transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-900/20 cursor-pointer transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
