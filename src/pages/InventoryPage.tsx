import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { InventoryItem, InventoryTransaction } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Boxes,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  X,
  History
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Transaction form
  const [txnForm, setTxnForm] = useState({
    itemId: '',
    type: 'Stock In' as 'Stock In' | 'Stock Out' | 'Adjustment' | 'Transfer',
    quantity: 100,
    referenceNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: ''
  });

  // New Item form
  const [itemForm, setItemForm] = useState({
    name: '',
    sku: `SKU-MAT-${Math.floor(100 + Math.random() * 900)}`,
    category: 'Raw Materials',
    currentStock: 500,
    minStockLevel: 100,
    maxStockLevel: 2000,
    reorderPoint: 250,
    unit: 'pcs',
    unitPrice: 12.5,
    location: 'Warehouse Bay C-02'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invRes, txnRes] = await Promise.all([
        api.get('/inventory', { search, category: categoryFilter, status: statusFilter }),
        api.get('/inventory/transactions')
      ]);

      if (invRes.success) setItems(invRes.items);
      if (txnRes.success) setTransactions(txnRes.transactions);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, statusFilter]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/transactions', txnForm);
      if (res.success) {
        toastSuccess(t('Inventory Updated', 'Inventory Updated'), `${txnForm.type} of ${txnForm.quantity} units processed.`);
        setShowTransactionModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError(t('Transaction Failed', 'Transaction Failed'), err.message);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', itemForm);
      if (res.success) {
        toastSuccess(t('Item Cataloged', 'Item Cataloged'), `${res.item.name} added to stock ledger.`);
        setShowAddItemModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError(t('Item Creation Failed', 'Item Creation Failed'), err.message);
    }
  };

  const totalValuation = items.reduce((acc, item) => acc + item.totalValue, 0);
  const lowStockCount = items.filter(i => i.status === 'Low Stock' || i.status === 'Critical' || i.status === 'Out of Stock').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <span>{t('Inventory & Raw Materials')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Stock balances, warehouse bin locations, reorder thresholds, and material issue slips.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasRole('Admin', 'Manager', 'Supervisor', 'Employee') && (
            <button
              id="btn-log-stock-movement"
              onClick={() => {
                setTxnForm({
                  itemId: items[0]?.id || '',
                  type: 'Stock In',
                  quantity: 100,
                  referenceNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                  notes: ''
                });
                setShowTransactionModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Log Stock Movement')}</span>
            </button>
          )}

          {hasRole('Admin', 'Manager') && (
            <button
              id="btn-add-inventory-item"
              onClick={() => {
                setItemForm({
                  name: '',
                  sku: `SKU-MAT-${Math.floor(100 + Math.random() * 900)}`,
                  category: 'Raw Materials',
                  currentStock: 500,
                  minStockLevel: 100,
                  maxStockLevel: 2000,
                  reorderPoint: 250,
                  unit: 'pcs',
                  unitPrice: 12.5,
                  location: 'Warehouse Bay C-02'
                });
                setShowAddItemModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>{t('Catalog New SKU')}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Bento Grid Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="uppercase font-bold tracking-wider text-[11px]">{t('Total SKUs Stocked')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{items.length} {t('SKUs', 'SKUs')}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">{t('Active stock codes')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="uppercase font-bold tracking-wider text-[11px]">{t('Inventory Valuation')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">${(totalValuation || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">{t('Total asset valuation')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="uppercase font-bold tracking-wider text-[11px]">{t('Low Stock Warnings')}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{lowStockCount} {t('Reorder Items')}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-sans">{t('Below safety buffer levels')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'stock'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          {t('Warehouse Stock Ledger')}
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('Stock Movements History')}</span>
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div className="space-y-4">
          {/* Filters Bento Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
              <input
                type="text"
                placeholder={t('Search by SKU, Material Name, or Location...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono`}
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">{t('All Categories')}</option>
                <option value="Raw Materials">{t('Raw Materials')}</option>
                <option value="Components">{t('Components')}</option>
                <option value="Finished Goods">{t('Finished Goods')}</option>
                <option value="Spare Parts">{t('Spare Parts')}</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">{t('All Statuses')}</option>
                <option value="Normal">{t('Normal')}</option>
                <option value="Low Stock">{t('Low Stock')}</option>
                <option value="Critical">{t('Critical')}</option>
                <option value="Out of Stock">{t('Out of Stock')}</option>
              </select>
            </div>
          </div>

          {/* Bento Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">{t('SKU Code')}</th>
                    <th className="px-5 py-3.5">{t('Material / Part Name')}</th>
                    <th className="px-5 py-3.5">{t('category')}</th>
                    <th className="px-5 py-3.5">{t('Current Physical Stock')}</th>
                    <th className="px-5 py-3.5">{t('Reorder Point')}</th>
                    <th className="px-5 py-3.5">{t('Unit Price')}</th>
                    <th className="px-5 py-3.5">{t('Total Valuation')}</th>
                    <th className="px-5 py-3.5">{t('Bin / Rack Location')}</th>
                    <th className="px-5 py-3.5 text-right rtl:text-left">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-sans">{t('loading')}</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-sans">{t('Zero warehouse inventory records match criteria')}</td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="px-5 py-3.5 font-sans font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                          {t(item.name, item.name)}
                        </td>
                        <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-300 text-[11px] whitespace-nowrap">
                          {t(item.category)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {(item.currentStock || 0).toLocaleString()} {t(item.unit, item.unit)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {(item.reorderPoint || 0).toLocaleString()} {t(item.unit, item.unit)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                          ${(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                          ${(item.totalValue || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-sans text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {t(item.location, item.location)}
                        </td>
                        <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Transactions Tab */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">{t('Txn ID', 'Txn ID')}</th>
                  <th className="px-5 py-3.5">{t('Timestamp')}</th>
                  <th className="px-5 py-3.5">{t('Item Name')}</th>
                  <th className="px-5 py-3.5">{t('Movement Type')}</th>
                  <th className="px-5 py-3.5">{t('quantity')}</th>
                  <th className="px-5 py-3.5">{t('Reference / PO Number')}</th>
                  <th className="px-5 py-3.5">{t('Operator')}</th>
                  <th className="px-5 py-3.5">{t('Notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400 font-sans">{t('No inventory transactions logged.')}</td>
                  </tr>
                ) : (
                  transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {txn.id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {txn.timestamp ? new Date(txn.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {t(txn.itemName, txn.itemName)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          txn.type === 'Stock In'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : txn.type === 'Stock Out'
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}>
                          {txn.type === 'Stock In' ? <ArrowDownRight className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                          <span>{t(txn.type)}</span>
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 font-bold ${txn.type === 'Stock In' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {txn.type === 'Stock In' ? `+${txn.quantity}` : `-${txn.quantity}`}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {txn.referenceNumber}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {txn.performedBy}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-slate-500 dark:text-slate-400 text-[11px] max-w-[200px] truncate">
                        {txn.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Movement Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowTransactionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('Log Stock Movement / Goods Receipt')}</span>
            </h2>

            <form onSubmit={handleCreateTransaction} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Material / Part Name')}</label>
                <select
                  required
                  value={txnForm.itemId}
                  onChange={e => setTxnForm({ ...txnForm, itemId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-medium"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.sku}) - {t('Current Physical Stock')}: {i.currentStock} {i.unit}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Movement Type')}</label>
                  <select
                    value={txnForm.type}
                    onChange={e => setTxnForm({ ...txnForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="Stock In">{t('Stock In')}</option>
                    <option value="Stock Out">{t('Stock Out')}</option>
                    <option value="Adjustment">{t('Adjustment')}</option>
                    <option value="Transfer">{t('Transfer')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('quantity')}</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={txnForm.quantity}
                    onChange={e => setTxnForm({ ...txnForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Reference / PO Number')}</label>
                <input
                  type="text"
                  required
                  value={txnForm.referenceNumber}
                  onChange={e => setTxnForm({ ...txnForm, referenceNumber: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Movement Notes')}</label>
                <textarea
                  rows={2}
                  value={txnForm.notes}
                  onChange={e => setTxnForm({ ...txnForm, notes: e.target.value })}
                  placeholder="Delivery receipt notes, batch lot numbers..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  {t('Execute Stock Movement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowAddItemModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('Catalog New SKU')}</span>
            </h2>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Material / Part Name')}</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('SKU Code')}</label>
                  <input
                    type="text"
                    required
                    value={itemForm.sku}
                    onChange={e => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('category')}</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="Raw Materials">{t('Raw Materials')}</option>
                    <option value="Components">{t('Components')}</option>
                    <option value="Finished Goods">{t('Finished Goods')}</option>
                    <option value="Spare Parts">{t('Spare Parts')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Bin / Rack Location')}</label>
                  <input
                    type="text"
                    required
                    value={itemForm.location}
                    onChange={e => setItemForm({ ...itemForm, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Current Physical Stock')}</label>
                  <input
                    type="number"
                    required
                    value={itemForm.currentStock}
                    onChange={e => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Reorder Point')}</label>
                  <input
                    type="number"
                    required
                    value={itemForm.reorderPoint}
                    onChange={e => setItemForm({ ...itemForm, reorderPoint: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Unit Price ($)')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemForm.unitPrice}
                    onChange={e => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  {t('Catalog New SKU')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

