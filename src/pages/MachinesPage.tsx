import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Machine, MachineFault, MaintenanceRecord, ProductionRecord, ProductionLine } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Cpu,
  Search,
  Activity,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Power,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const MachinesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();

  const gridStroke = isDark ? '#334155' : '#f1f5f9';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '16px',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  };

  const [machines, setMachines] = useState<Machine[]>([]);
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineDetails, setMachineDetails] = useState<{
    faults: MachineFault[];
    maintenance: MaintenanceRecord[];
    production: ProductionRecord[];
    telemetryHistory: any[];
  } | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status Change Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('Running');
  const [statusNote, setStatusNote] = useState('');

  // Register Machine Modal
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [newMachineForm, setNewMachineForm] = useState({
    name: '',
    machineId: '',
    type: 'Automated Industrial System',
    productionLineId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    assignedTechnician: 'Frank Kowalski'
  });

  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const [mchRes, lineRes] = await Promise.all([
        api.get('/machines', { search, status: statusFilter, lineId: lineFilter }),
        api.get('/production-lines')
      ]);

      if (mchRes.success) setMachines(mchRes.machines);
      if (lineRes.success) setLines(lineRes.lines);
    } catch (err) {
      console.error('Failed to fetch machines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, [search, statusFilter, lineFilter]);

  const openMachineDetail = async (machine: Machine) => {
    setSelectedMachine(machine);
    try {
      const res = await api.get(`/machines/${machine.id}`);
      if (res.success) {
        setMachineDetails({
          faults: res.faults || [],
          maintenance: res.maintenance || [],
          production: res.production || [],
          telemetryHistory: res.telemetryHistory || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch machine detail:', err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    try {
      const res = await api.put(`/machines/${selectedMachine.id}/status`, {
        status: newStatus,
        reason: statusNote
      });
      if (res.success) {
        toastSuccess(t('Machine Status Updated', 'Machine Status Updated'), `${selectedMachine.name} is now ${t(newStatus)}`);
        setSelectedMachine(res.machine);
        setShowStatusModal(false);
        fetchMachines();
      }
    } catch (err: any) {
      toastError(t('Status Change Failed', 'Status Change Failed'), err.message);
    }
  };

  const handleCreateMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/machines', newMachineForm);
      if (res.success) {
        toastSuccess(t('Machine Registered', 'Machine Registered'), `Machine ${res.machine.machineId} registered successfully.`);
        setShowAddMachineModal(false);
        fetchMachines();
      }
    } catch (err: any) {
      toastError(t('Registration Failed', 'Registration Failed'), err.message);
    }
  };

  // Dedicated Machine Detail View
  if (selectedMachine) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedMachine(null);
            setMachineDetails(null);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <span>{t('Back to Machines Fleet')}</span>
        </button>

        {/* Machine Header Banner Bento Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800">
                  {selectedMachine.machineId}
                </span>
                <StatusBadge status={selectedMachine.status} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t(selectedMachine.name, selectedMachine.name)}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t(selectedMachine.type, selectedMachine.type)} • {selectedMachine.manufacturer} ({selectedMachine.model}) • SN: {selectedMachine.serialNumber}
              </p>
            </div>

            {hasRole('Admin', 'Manager', 'Supervisor') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewStatus(selectedMachine.status);
                    setShowStatusModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Power className="w-4 h-4" />
                  <span>{t('Change Operational Status')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Machine Health & Telemetry Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 font-mono text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Health Score')}</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">{selectedMachine.healthScore}%</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Temperature')}</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedMachine.temperature}°C</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Vibration')}</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedMachine.vibration} mm/s</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Power Draw')}</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedMachine.powerKw} kW</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Total Runtime')}</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{selectedMachine.totalRuntimeHours} {t('hrs', 'hrs')}</div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t('Total Downtime')}</div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 mt-1">{selectedMachine.totalDowntimeHours} {t('hrs', 'hrs')}</div>
            </div>
          </div>
        </div>

        {/* Telemetry Sensor Live Trend Chart Bento Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('IoT Sensor Telemetry History')}</span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('Real-time thermal and vibration oscillation tracking')}</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> {t('Temp (°C)')}</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" /> {t('Vibration (mm/s)')}</span>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={machineDetails?.telemetryHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="temp" name={t('Temperature (°C)')} stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vibration" name={t('Vibration (mm/s)')} stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Logs & Maintenance History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Faults History Bento Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>{t('Fault Incidents Ledger')}</span>
            </h2>

            {machineDetails?.faults.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-sans">{t('Zero active or past faults recorded.')}</div>
            ) : (
              <div className="space-y-2.5">
                {machineDetails?.faults.map(f => (
                  <div key={f.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-rose-600 dark:text-rose-400">{f.faultId}</span>
                      <StatusBadge status={f.severity} />
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">{f.faultType}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.description}</p>
                    {f.resolution && (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1.5 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800 font-medium">
                        <strong>{t('Resolution:')}</strong> {f.resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance History Bento Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('Maintenance & Servicing Records')}</span>
            </h2>

            {machineDetails?.maintenance.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-sans">{t('No scheduled or historical maintenance records.')}</div>
            ) : (
              <div className="space-y-2.5">
                {machineDetails?.maintenance.map(m => (
                  <div key={m.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{m.maintenanceId}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">{m.maintenanceType} {t('Maintenance')}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>{t('Tech:')} {m.technician}</span>
                      <span>{t('Cost:')} ${(m.cost || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Change Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl relative text-xs">
              <button
                onClick={() => setShowStatusModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('Update Operational State')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{selectedMachine.name} ({selectedMachine.machineId})</p>

              <form onSubmit={handleUpdateStatus} className="space-y-3.5">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Target Operational Status')}</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Running">{t('Running (Online & Producing)')}</option>
                    <option value="Stopped">{t('Stopped (Safety Halt)')}</option>
                    <option value="Maintenance">{t('Maintenance (Technician Locked)')}</option>
                    <option value="Idle">{t('Idle (Standby Mode)')}</option>
                    <option value="Offline">{t('Offline (Decommissioned / Powered Down)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Reason / Shift Note')}</label>
                  <textarea
                    rows={2}
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder={t('Enter reason for status transition...')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    {t('Apply Status Change')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Machine Fleet Overview View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <span>{t('Industrial Machine Telemetry Fleet')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Real-time diagnostics, health scoring, thermal metrics, and preventive maintenance tracking.')}
          </p>
        </div>

        {hasRole('Admin') && (
          <button
            id="btn-register-machine"
            onClick={() => {
              setNewMachineForm({
                name: '',
                machineId: `MCH-${Math.floor(100 + Math.random() * 900)}`,
                type: 'Automated Industrial Cell',
                productionLineId: lines[0]?.id || '',
                manufacturer: 'KUKA Robotics Inc.',
                model: 'Gen-5 Heavy Precision',
                serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
                assignedTechnician: 'Frank Kowalski'
              });
              setShowAddMachineModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Register New Machine')}</span>
          </button>
        )}
      </div>

      {/* Filter and View Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by Machine Name, Model, or ID...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={lineFilter}
            onChange={e => setLineFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Production Lines')}</option>
            {lines.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Statuses')}</option>
            <option value="Running">{t('Running')}</option>
            <option value="Stopped">{t('Stopped')}</option>
            <option value="Maintenance">{t('Maintenance')}</option>
            <option value="Idle">{t('Idle')}</option>
            <option value="Offline">{t('Offline')}</option>
          </select>
        </div>
      </div>

      {/* Machines Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">
            {t('Loading machines telemetry...')}
          </div>
        ) : (
          machines.map(m => (
            <div
              key={m.id}
              id={`machine-card-${m.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-700/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800">
                    {m.machineId}
                  </span>
                  <StatusBadge status={m.status} />
                </div>

                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{t(m.name, m.name)}</h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t(m.productionLineName, m.productionLineName)}</div>

                {/* Telemetry Sensor Badges */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('Health:')}</span>
                    <span className={`font-bold ${m.healthScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : m.healthScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {m.healthScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('Temp:')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{m.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans font-medium">{t('vibration')}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{m.vibration} mm/s</span>
                  </div>
                </div>

                {/* Current Fault alert banner */}
                {m.currentFault && (
                  <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/80 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span className="truncate font-medium">{t(m.currentFault, m.currentFault)}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                  {t('Tech:')} <span className="text-slate-800 dark:text-slate-200 font-semibold">{m.assignedTechnician}</span>
                </div>

                <button
                  onClick={() => openMachineDetail(m)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {t('View Telemetry →')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Machine Modal (Admin Only) */}
      {showAddMachineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] shadow-xl p-6 relative text-xs">
            <button
              onClick={() => setShowAddMachineModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span>{t('Register New Industrial Machine')}</span>
            </h2>

            <form onSubmit={handleCreateMachine} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Machine Name')}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Axis Laser Welder Beta"
                    value={newMachineForm.name}
                    onChange={e => setNewMachineForm({ ...newMachineForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Machine ID')}</label>
                  <input
                    type="text"
                    required
                    value={newMachineForm.machineId}
                    onChange={e => setNewMachineForm({ ...newMachineForm, machineId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Assigned Production Line')}</label>
                <select
                  required
                  value={newMachineForm.productionLineId}
                  onChange={e => setNewMachineForm({ ...newMachineForm, productionLineId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  {lines.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Manufacturer')}</label>
                  <input
                    type="text"
                    value={newMachineForm.manufacturer}
                    onChange={e => setNewMachineForm({ ...newMachineForm, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">{t('Model')}</label>
                  <input
                    type="text"
                    value={newMachineForm.model}
                    onChange={e => setNewMachineForm({ ...newMachineForm, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMachineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  {t('Save & Register')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

