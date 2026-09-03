import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ProductionLine, Machine, ProductionRecord, MachineFault } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useLanguage } from '../context/LanguageContext';
import {
  Layers,
  Cpu,
  User,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertTriangle,
  Factory,
  ChevronLeft
} from 'lucide-react';

export const ProductionLinesPage: React.FC<{ onNavigateMachine?: (machineId: string) => void }> = ({ onNavigateMachine }) => {
  const { t, isRTL } = useLanguage();
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
  const [lineDetail, setLineDetail] = useState<{
    machines: Machine[];
    activeBatches: ProductionRecord[];
    recentFaults: MachineFault[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchLines = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/production-lines');
      if (res.success) setLines(res.lines);
    } catch (err) {
      console.error('Failed to fetch lines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const openLineDetail = async (line: ProductionLine) => {
    setSelectedLine(line);
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/production-lines/${line.id}`);
      if (res.success) {
        setLineDetail({
          machines: res.machines || [],
          activeBatches: res.activeBatches || [],
          recentFaults: res.recentFaults || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch line details:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (selectedLine) {
    return (
      <div className="space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => {
            setSelectedLine(null);
            setLineDetail(null);
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t('Back to All Production Lines')}</span>
        </button>

        {/* Line Detail Bento Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
                  {selectedLine.lineId}
                </span>
                <StatusBadge status={selectedLine.status} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t(selectedLine.name, selectedLine.name)}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{t(selectedLine.description, selectedLine.description)}</p>
            </div>

            {/* Quick Metrics Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Assigned Supervisor')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{t(selectedLine.assignedSupervisor, selectedLine.assignedSupervisor)}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('location')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{t(selectedLine.location, selectedLine.location)}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Target Output')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedLine.targetProduction} {t('units')}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Efficiency')}</div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedLine.efficiency}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Machines on this Line */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span>{t('Assigned Industrial Machines')} ({lineDetail?.machines.length || 0})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineDetail?.machines.map(m => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">{m.machineId}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t(m.name, m.name)}</h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t(m.type, m.type)} • {m.manufacturer}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-slate-400 block">{t('Health Score')}:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{m.healthScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('Temperature')}:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{m.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{t('Vibration')}:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{m.vibration} mm/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Work Orders & Recent Faults Bento Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Active Work Orders */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Factory className="w-3.5 h-3.5" />
              </div>
              <span>{t('Current Line Work Orders')}</span>
            </h2>

            {lineDetail?.activeBatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-sans">{t('No active work orders running on this line.')}</div>
            ) : (
              <div className="space-y-2.5">
                {lineDetail?.activeBatches.map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{b.productionId}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">{b.productName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                      <span>{t('Progress')}: {b.quantity} / {b.targetQuantity} {t('units')}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{b.efficiency}% {t('Efficiency')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Line Faults */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span>{t('Line Fault History & Alerts')}</span>
            </h2>

            {lineDetail?.recentFaults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-sans">{t('No faults logged for this production line.')}</div>
            ) : (
              <div className="space-y-2.5">
                {lineDetail?.recentFaults.map(f => (
                  <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{f.faultId}</span>
                      <StatusBadge status={f.severity} />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">{f.faultType}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <span>{t('Production Lines Monitoring')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('Real-time status, line throughput rates, supervisors, and assigned industrial robotics.')}
        </p>
      </div>

      {/* Production Lines Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 p-12 text-center text-slate-400 text-xs font-sans">
            {t('Loading production lines...')}
          </div>
        ) : (
          lines.map(line => {
            const progress = Math.min(100, Math.round((line.actualProduction / (line.targetProduction || 1)) * 100));
            return (
              <div
                key={line.id}
                id={`line-card-${line.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
                      {line.lineId}
                    </span>
                    <StatusBadge status={line.status} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">{t(line.name, line.name)}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{t(line.description, line.description)}</p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('location')}:</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t(line.location, line.location)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('Assigned Supervisor')}:</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t(line.assignedSupervisor, line.assignedSupervisor)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('Machines')}:</span>
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{line.machineCount} {t('connected', 'Connected')}</span>
                    </div>
                  </div>

                  {/* Production Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-400">{t('Target Output')}:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{line.actualProduction} / {line.targetProduction}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          line.efficiency >= 90 ? 'bg-emerald-500' : line.efficiency >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">{t('Efficiency')}: </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{line.efficiency}%</span>
                  </div>

                  <button
                    onClick={() => openLineDetail(line)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>{t('Inspect Line')}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
