import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { MachineFault, Machine } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertOctagon,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';

export const FaultsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();

  const [faults, setFaults] = useState<MachineFault[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedFault, setSelectedFault] = useState<MachineFault | null>(null);

  const [reportForm, setReportForm] = useState({
    machineId: '',
    faultType: 'Mechanical Jam',
    description: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    assignedTechnician: 'Frank Kowalski'
  });

  const [resolutionText, setResolutionText] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [faultRes, mchRes] = await Promise.all([
        api.get('/faults', { search, severity: severityFilter, status: statusFilter }),
        api.get('/machines')
      ]);

      if (faultRes.success) setFaults(faultRes.faults);
      if (mchRes.success) setMachines(mchRes.machines);
    } catch (err) {
      console.error('Failed to fetch faults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, severityFilter, statusFilter]);

  const handleReportFault = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/faults', reportForm);
      if (res.success) {
        toastSuccess('Fault Incident Reported', `Incident ${res.fault.faultId} logged.`);
        setShowReportModal(false);
        fetchData();
      }
    } catch (err: any) {
      toastError('Failed to report fault', err.message);
    }
  };

  const handleResolveFault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFault) return;

    try {
      const res = await api.post(`/faults/${selectedFault.id}/resolve`, {
        resolution: resolutionText
      });
      if (res.success) {
        toastSuccess('Fault Resolved', `Fault ${selectedFault.faultId} resolved.`);
        setShowResolveModal(false);
        setResolutionText('');
        fetchData();
      }
    } catch (err: any) {
      toastError('Resolution Failed', err.message);
    }
  };

  const openResolveModal = (f: MachineFault) => {
    setSelectedFault(f);
    setResolutionText('');
    setShowResolveModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <span>{t('Machine Fault & Incident Management')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Log machine stoppages, assign mechatronics technicians, and record corrective root causes.')}
          </p>
        </div>

        <button
          id="btn-report-fault"
          onClick={() => {
            setReportForm({
              machineId: machines[0]?.id || '',
              faultType: 'Mechanical Jam',
              description: '',
              severity: 'High',
              assignedTechnician: 'Frank Kowalski'
            });
            setShowReportModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('Report Machine Incident')}</span>
        </button>
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('Search by Fault ID, Description, or Machine...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 rtl:pl-3.5 rtl:pr-10 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 font-sans"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Severities')}</option>
            <option value="Critical">{t('Critical')}</option>
            <option value="High">{t('High')}</option>
            <option value="Medium">{t('Medium')}</option>
            <option value="Low">{t('Low')}</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Statuses')}</option>
            <option value="Open">{t('Open')}</option>
            <option value="In Progress">{t('In Progress')}</option>
            <option value="Resolved">{t('Resolved')}</option>
            <option value="Closed">{t('Closed')}</option>
          </select>
        </div>
      </div>

      {/* Faults Table Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">{t('Fault ID')}</th>
                <th className="px-5 py-3.5">{t('Machine')}</th>
                <th className="px-5 py-3.5">{t('Line')}</th>
                <th className="px-5 py-3.5">{t('Fault Type')}</th>
                <th className="px-5 py-3.5">{t('Severity')}</th>
                <th className="px-5 py-3.5">{t('Start Time')}</th>
                <th className="px-5 py-3.5">{t('Downtime')}</th>
                <th className="px-5 py-3.5">{t('Technician')}</th>
                <th className="px-5 py-3.5">{t('Status')}</th>
                <th className="px-5 py-3.5 text-right rtl:text-left">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-400 font-sans">{t('Loading faults...')}</td>
                </tr>
              ) : faults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-400 font-sans">{t('No fault incidents recorded.')}</td>
                </tr>
              ) : (
                faults.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {f.faultId}
                    </td>
                    <td className="px-5 py-3.5 font-sans font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {t(f.machineName, f.machineName)}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {t(f.productionLineName ? f.productionLineName.split(' - ')[0] : 'Line', f.productionLineName ? f.productionLineName.split(' - ')[0] : 'Line')}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      {t(f.faultType, f.faultType)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={f.severity} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {f.startTime ? new Date(f.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-amber-600 dark:text-amber-400">
                      {f.downtimeDurationMinutes > 0 ? `${f.downtimeDurationMinutes} ${t('min')}` : t('Active', 'Active')}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {t(f.assignedTechnician, f.assignedTechnician)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                      {(f.status === 'Open' || f.status === 'In Progress') && hasRole('Admin', 'Manager', 'Supervisor') ? (
                        <button
                          onClick={() => openResolveModal(f)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          {t('Resolve Fault')}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-sans font-medium">{t('Resolved')}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Fault Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4 tracking-tight">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{t('Log Machine Incident / Fault')}</span>
            </h2>

            <form onSubmit={handleReportFault} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Affected Machine')}</label>
                <select
                  required
                  value={reportForm.machineId}
                  onChange={e => setReportForm({ ...reportForm, machineId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.machineId}) - {m.productionLineName ? m.productionLineName.split(' - ')[0] : 'Line'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Fault Type')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spindle Vibration / Thermal Overload"
                    value={reportForm.faultType}
                    onChange={e => setReportForm({ ...reportForm, faultType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Severity')}</label>
                  <select
                    value={reportForm.severity}
                    onChange={e => setReportForm({ ...reportForm, severity: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="Critical">{t('Critical')} ({t('Immediate Line Stop')})</option>
                    <option value="High">{t('High')} ({t('Subsystem Halted')})</option>
                    <option value="Medium">{t('Medium')} ({t('Degraded Performance')})</option>
                    <option value="Low">{t('Low')} ({t('Minor Sensor Warning')})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Incident Description & Root Symptoms')}</label>
                <textarea
                  rows={3}
                  required
                  placeholder={t('Detail visible symptoms, error codes on HMI, sensor spikes...')}
                  value={reportForm.description}
                  onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t('Dispatch Incident')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Fault Modal */}
      {showResolveModal && selectedFault && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-2xl p-6 relative text-xs">
            <button
              onClick={() => setShowResolveModal(false)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1 tracking-tight">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('Resolve Machine Incident')}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-mono mb-4 text-xs">{selectedFault.faultId} • {selectedFault.machineName}</p>

            <form onSubmit={handleResolveFault} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Corrective Action / Resolution Description')}</label>
                <textarea
                  rows={3}
                  required
                  placeholder={t('Replaced worn tooling, recalibrated sensors, purged filters, reset safeties...')}
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('Resolving this fault will automatically calculate the exact downtime duration and clear machine locks.')}
              </p>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                >
                  {t('Mark Resolved')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
