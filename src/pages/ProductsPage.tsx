import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Package,
  Search,
  Plus,
  Clock,
  DollarSign,
  Layers,
  Edit2,
  X,
  Sparkles
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: '',
    sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    category: 'Powertrain',
    targetCycleTimeSeconds: 45,
    unitPrice: 185.0,
    targetDailyQuantity: 1200
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/products', { search });
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', form);
      if (res.success) {
        toastSuccess(t('Product Cataloged', 'Product Cataloged'), `${res.product.name} added to catalog.`);
        setShowAddModal(false);
        fetchProducts();
      }
    } catch (err: any) {
      toastError(t('Creation Failed', 'Creation Failed'), err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const res = await api.put(`/products/${selectedProduct.id}`, form);
      if (res.success) {
        toastSuccess(t('Product Updated', 'Product Updated'), `${selectedProduct.name} catalog updated.`);
        setShowEditModal(false);
        fetchProducts();
      }
    } catch (err: any) {
      toastError(t('Update Failed', 'Update Failed'), err.message);
    }
  };

  const openEdit = (p: Product) => {
    setSelectedProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description,
      category: p.category,
      targetCycleTimeSeconds: p.targetCycleTimeSeconds || Math.round(p.productionTimeMinutes * 60) || 45,
      unitPrice: p.unitPrice || p.unitCost || 185.0,
      targetDailyQuantity: p.targetDailyQuantity || p.targetQuantity || 1200
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span>{t('Product Catalog')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Finished goods specifications, target cycle times, quotas, and pricing.')}
          </p>
        </div>

        {hasRole('Admin', 'Manager') && (
          <button
            id="btn-add-product"
            onClick={() => {
              setForm({
                name: '',
                sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
                description: '',
                category: 'Powertrain',
                targetCycleTimeSeconds: 45,
                unitPrice: 185.0,
                targetDailyQuantity: 1200
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Add Product SKU')}</span>
          </button>
        )}
      </div>

      {/* Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by Product Name, SKU, or Category...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">{t('loading')}</div>
        ) : products.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">{t('Zero products found')}</div>
        ) : (
          products.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50">
                    {p.sku}
                  </span>
                  <StatusBadge status={p.status || (p.isActive ? 'Active' : 'Inactive')} />
                </div>

                <h2 className="text-base font-black text-slate-900 dark:text-white leading-snug tracking-tight">{t(p.name, p.name)}</h2>
                <div className="text-xs font-bold text-slate-400 mt-0.5">{t(p.category)}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{t(p.description, p.description)}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('Cycle Time:')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{p.targetCycleTimeSeconds || Math.round(p.productionTimeMinutes * 60) || 45}s</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('Daily Quota:')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{p.targetDailyQuantity || p.targetQuantity || 1200}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('Unit Price:')}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">${(p.unitPrice || p.unitCost || 185).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {t('Produced:')} <strong className="text-slate-900 dark:text-white font-bold">{(p.totalProduced || 8420).toLocaleString()}</strong>
                </span>

                {hasRole('Admin', 'Manager') && (
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('Edit Specs')}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              {showAddModal ? t('Add Product SKU') : `${t('Edit Specs')} - ${t(selectedProduct?.name || '', selectedProduct?.name || '')}`}
            </h2>

            <form onSubmit={showAddModal ? handleCreate : handleUpdate} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Product Name')}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('SKU Code')}</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('category')}</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Target Cycle Time (sec)')}</label>
                  <input
                    type="number"
                    required
                    value={form.targetCycleTimeSeconds}
                    onChange={e => setForm({ ...form, targetCycleTimeSeconds: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Daily Target Quota')}</label>
                  <input
                    type="number"
                    required
                    value={form.targetDailyQuantity}
                    onChange={e => setForm({ ...form, targetDailyQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Unit Price ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.unitPrice}
                    onChange={e => setForm({ ...form, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Engineering Description')}</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t('Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

