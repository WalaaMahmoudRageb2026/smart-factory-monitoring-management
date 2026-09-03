import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ProductionRecord, Product, ProductionLine, Machine } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Factory,
  Search,
  Plus,
  Edit2,
  Eye,
  X,
  Clock,
  User,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export const ProductionPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProductionRecord | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    productId: '',
    productionLineId: '',
    machineId: '',
    targetQuantity: 1000,
    quantity: 0,
    scrapQuantity: 0,
    status: 'Planned' as 'Planned' | 'Running' | 'Completed' | 'Cancelled',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, prdRes, lineRes, mchRes] = await Promise.all([
        api.get('/production', { search, status: statusFilter, lineId: lineFilter }),
        api.get('/products'),
        api.get('/production-lines'),
        api.get('/machines')
      ]);

      if (prodRes.success) setRecords(prodRes.records);
      if (prdRes.success) setProducts(prdRes.products);
      if (lineRes.success) setLines(lineRes.lines);
      if (mchRes.success) setMachines(mchRes.machines);
    } catch (err) {
      console.error('Error fetching production records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, lineFilter]);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/production', formData);
      if (res.success) {
        toastSuccess('Production Batch Created', `Batch ${res.record.productionId} is initialized.`);
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError('Failed to create batch', err.message);
    }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const res = await api.put(`/production/${selectedRecord.id}`, {
        quantity: formData.quantity,
        scrapQuantity: formData.scrapQuantity,
        status: formData.status,
        notes: formData.notes
      });
      if (res.success) {
        toastSuccess('Batch Updated', `Batch ${selectedRecord.productionId} updated.`);
        setShowEditModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const openEditModal = (rec: ProductionRecord) => {
    setSelectedRecord(rec);
    setFormData({
      productId: rec.productId,
      productionLineId: rec.productionLineId,
      machineId: rec.machineId,
      targetQuantity: rec.targetQuantity,
      quantity: rec.quantity,
      scrapQuantity: rec.scrapQuantity,
      status: rec.status,
      notes: rec.notes || ''
    });
    setShowEditModal(true);
  };

  const openDetailModal = (rec: ProductionRecord) => {
    setSelectedRecord(rec);
    setShowDetailModal(true);
  };

  // Filtered machines based on selected line in create form
  const availableMachines = machines.filter(
    m => !formData.productionLineId || m.productionLineId === formData.productionLineId
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
            <span>{t('Production Batch Management')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Monitor, initialize, and audit production work orders and output quotas.')}
          </p>
        </div>

        {hasRole('Admin', 'Manager', 'Supervisor', 'Employee') && (
          <button
            id="btn-add-production-batch"
            onClick={() => {
              setFormData({
                productId: products[0]?.id || '',
                productionLineId: lines[0]?.id || '',
                machineId: machines[0]?.id || '',
                targetQuantity: 1000,
                quantity: 0,
                scrapQuantity: 0,
                status: 'Planned',
                notes: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-950/50 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('New Production Order')}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-production-input"
            type="text"
            placeholder={t('Search by Batch ID, Product, or Operator...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            id="filter-production-line"
            value={lineFilter}
            onChange={e => setLineFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Production Lines')}</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            id="filter-production-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Statuses')}</option>
            <option value="Running">{t('Running')}</option>
            <option value="Planned">{t('Planned')}</option>
            <option value="Completed">{t('Completed')}</option>
            <option value="Cancelled">{t('Cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Production Batches Bento Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">{t('Batch ID')}</th>
                <th className="px-5 py-3.5">{t('Product Name')}</th>
                <th className="px-5 py-3.5">{t('Production Line')}</th>
                <th className="px-5 py-3.5">{t('Assigned Machine')}</th>
                <th className="px-5 py-3.5">{t('Actual / Target')}</th>
                <th className="px-5 py-3.5">{t('Scrap')}</th>
                <th className="px-5 py-3.5">{t('Efficiency')}</th>
                <th className="px-5 py-3.5">{t('Status')}</th>
                <th className="px-5 py-3.5">{t('Operator')}</th>
                <th className="px-5 py-3.5 text-right rtl:text-left">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>{t('Loading production records...')}</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-400 font-sans">
                    {t('No production orders match the current filters.')}
                  </td>
                </tr>
              ) : (
                records.map(rec => {
                  const progressPct = Math.min(100, Math.round((rec.quantity / (rec.targetQuantity || 1)) * 100));
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-indigo-600 whitespace-nowrap">
                        {rec.productionId}
                      </td>
                      <td className="px-5 py-3.5 font-sans font-semibold text-slate-900 max-w-[180px] truncate">
                        {rec.productName}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-sans text-[11px] whitespace-nowrap">
                        {rec.productionLineName ? rec.productionLineName.split(' - ')[0] : 'Line'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px] whitespace-nowrap">
                        {rec.machineName}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{(rec.quantity || 0).toLocaleString()}</span>
                          <span className="text-slate-400">/ {(rec.targetQuantity || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500">({progressPct}%)</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progressPct >= 90 ? 'bg-emerald-500' : progressPct >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-rose-600 font-bold">
                        {rec.scrapQuantity}
                      </td>
                      <td className="px-5 py-3.5 font-bold">
                        <span className={rec.efficiency >= 90 ? 'text-emerald-600' : rec.efficiency >= 75 ? 'text-indigo-600' : 'text-amber-600'}>
                          {rec.efficiency}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-sans text-[11px] whitespace-nowrap">
                        {rec.operator}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailModal(rec)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(rec)}
                            title="Edit / Update Output"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('Initialize Production Batch', 'Initialize Production Work Order')}</span>
            </h2>

            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Product Name')}</label>
                <select
                  required
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Production Line')}</label>
                  <select
                    required
                    value={formData.productionLineId}
                    onChange={e => setFormData({ ...formData, productionLineId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    {lines.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Assigned Machine')}</label>
                  <select
                    required
                    value={formData.machineId}
                    onChange={e => setFormData({ ...formData, machineId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    {availableMachines.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.machineId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Target Quantity', 'Target Quantity')}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.targetQuantity}
                    onChange={e => setFormData({ ...formData, targetQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Actual / Target', 'Initial Output')}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Notes', 'Shift Execution Notes')}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('Notes')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 dark:shadow-indigo-950/50 cursor-pointer"
                >
                  {t('confirm', 'Initialize Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Update Output Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{t('edit', 'Update Batch Progress')}</h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono mb-4">{selectedRecord.productionId} • {selectedRecord.productName}</p>

            <form onSubmit={handleUpdateRecord} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Actual / Target', 'Completed Units')}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Scrap', 'Scrap / Defect Count')}</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.scrapQuantity}
                    onChange={e => setFormData({ ...formData, scrapQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-rose-600 dark:text-rose-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Status')}</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 font-medium"
                >
                  <option value="Running">{t('Running')}</option>
                  <option value="Planned">{t('Planned')}</option>
                  <option value="Completed">{t('Completed')}</option>
                  <option value="Cancelled">{t('Cancelled')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Notes')}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 dark:shadow-indigo-950/50 cursor-pointer"
                >
                  {t('Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Details Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={selectedRecord.status} />
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedRecord.productionId}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">{selectedRecord.productName}</h2>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Production Line')}:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedRecord.productionLineName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Assigned Machine')}:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedRecord.machineName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Actual / Target')}:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedRecord.quantity} / {selectedRecord.targetQuantity}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Efficiency')}:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedRecord.efficiency}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Operator')}:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedRecord.operator}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Assigned Supervisor')}:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedRecord.supervisor}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('date')}:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedRecord.productionDate} @ {selectedRecord.startTime}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{t('Status')}:</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedRecord.endTime || t('running', 'In Progress')}</span>
              </div>
            </div>

            {selectedRecord.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">{t('Notes')}:</div>
                <p className="text-slate-600 dark:text-slate-400 italic">{selectedRecord.notes}</p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {t('cancel', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
