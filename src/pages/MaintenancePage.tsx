import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MaintenanceRecord, Machine } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Wrench,
  Search,
  Plus,
  CheckCircle2,
  X
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const [form, setForm] = useState({
    machineId: '',
    maintenanceType: 'Preventive' as 'Preventive' | 'Corrective' | 'Emergency',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    technician: 'Frank Kowalski',
    cost: 450
  });

  const [actualCost, setActualCost] = useState(450);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [maintRes, mchRes] = await Promise.all([
        api.get('/maintenance', { search, status: statusFilter, type: typeFilter }),
        api.get('/machines')
      ]);

      if (maintRes.success) setRecords(maintRes.records);
      if (mchRes.success) setMachines(mchRes.machines);
    } catch (err) {
      console.error('Failed to fetch maintenance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, typeFilter]);

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/maintenance', form);
      if (res.success) {
        toastSuccess(t('Maintenance Scheduled', 'Maintenance Scheduled'), `Record ${res.record.maintenanceId} created.`);
        setShowAddModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError(t('Scheduling Failed', 'Scheduling Failed'), err.message);
    }
  };

  const handleCompleteMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      const res = await api.post(`/maintenance/${selectedRecord.id}/complete`, {
        actualCost
      });
      if (res.success) {
        toastSuccess(t('Maintenance Completed', 'Maintenance Completed'), `Record ${selectedRecord.maintenanceId} finalized.`);
        setShowCompleteModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError(t('Completion Failed', 'Completion Failed'), err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <span>{t('Scheduled & Preventive Maintenance')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Work orders, technician tasks, spare parts allocations, and equipment servicing.')}
          </p>
        </div>

        {hasRole('Admin', 'Manager', 'Supervisor') && (
          <button
            id="btn-schedule-maintenance"
            onClick={() => {
              setForm({
                machineId: machines[0]?.id || '',
                maintenanceType: 'Preventive',
                description: '',
                scheduledDate: new Date().toISOString().split('T')[0],
                technician: 'Frank Kowalski',
                cost: 450
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Create Maintenance Order')}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by maintenance ID, machine, or technician...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Maintenance Types')}</option>
            <option value="Preventive">{t('Preventive')}</option>
            <option value="Corrective">{t('Corrective')}</option>
            <option value="Emergency">{t('Emergency')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Statuses')}</option>
            <option value="Scheduled">{t('Scheduled')}</option>
            <option value="In Progress">{t('In Progress')}</option>
            <option value="Completed">{t('Completed')}</option>
            <option value="Cancelled">{t('Cancelled')}</option>
          </select>
        </div>
      </div>

      {/* Maintenance Records Table Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200/80 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">{t('Task ID', 'Task ID')}</th>
                <th className="px-5 py-3.5">{t('Target Machine')}</th>
                <th className="px-5 py-3.5">{t('Maintenance Type')}</th>
                <th className="px-5 py-3.5">{t('Task Description & Checklist')}</th>
                <th className="px-5 py-3.5">{t('Scheduled Date')}</th>
                <th className="px-5 py-3.5">{t('Assigned Technician')}</th>
                <th className="px-5 py-3.5">{t('Cost ($ USD)')}</th>
                <th className="px-5 py-3.5">{t('status')}</th>
                <th className="px-5 py-3.5 text-right rtl:text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-sans">{t('loading')}</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-slate-400 font-sans">{t('Zero maintenance records match query')}</td>
                </tr>
              ) : (
                records.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {m.maintenanceId}
                    </td>
                    <td className="px-5 py-3.5 font-sans font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {m.machineName}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-800 dark:text-slate-200">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        m.maintenanceType === 'Emergency'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : m.maintenanceType === 'Corrective'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {t(m.maintenanceType)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                      {m.description}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {m.scheduledDate}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                      {m.technician}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      ${(m.cost || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                      {m.status !== 'Completed' && hasRole('Admin', 'Manager', 'Supervisor') ? (
                        <button
                          onClick={() => {
                            setSelectedRecord(m);
                            setActualCost(m.cost);
                            setShowCompleteModal(true);
                          }}
                          className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          {t('Mark Completed')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-sans">{t('Completed')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-xl p-6 relative text-xs">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span>{t('Create Maintenance Order')}</span>
            </h2>

            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Target Machine')}</label>
                <select
                  required
                  value={form.machineId}
                  onChange={e => setForm({ ...form, machineId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.machineId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Maintenance Type')}</label>
                  <select
                    value={form.maintenanceType}
                    onChange={e => setForm({ ...form, maintenanceType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Preventive">{t('Preventive')}</option>
                    <option value="Corrective">{t('Corrective')}</option>
                    <option value="Emergency">{t('Emergency')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Scheduled Date')}</label>
                  <input
                    type="date"
                    required
                    value={form.scheduledDate}
                    onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Assigned Technician')}</label>
                  <input
                    type="text"
                    required
                    value={form.technician}
                    onChange={e => setForm({ ...form, technician: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Cost ($ USD)')}</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.cost}
                    onChange={e => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Task Description & Checklist')}</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Lubrication of bearings, hydraulic oil flush, optical sensor calibration..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {t('Save Work Order')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Maintenance Modal */}
      {showCompleteModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-xl p-6 relative text-xs">
            <button
              onClick={() => setShowCompleteModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{t('Mark Completed')}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-mono mb-4 text-[11px]">{selectedRecord.maintenanceId} • {selectedRecord.machineName}</p>

            <form onSubmit={handleCompleteMaintenance} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Actual Cost')}</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={actualCost}
                  onChange={e => setActualCost(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {t('Mark Completed')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

