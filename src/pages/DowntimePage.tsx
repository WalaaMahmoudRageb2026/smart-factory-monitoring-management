import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  Cpu,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const DowntimePage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [downtimeData, setDowntimeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchDowntime = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/downtime');
      if (res.success) setDowntimeData(res);
    } catch (err) {
      console.error('Failed to fetch downtime analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDowntime();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <span>{t('Downtime & Loss Analytics')}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('Root-cause Pareto analysis, stoppage duration patterns, and financial impact metrics.')}
        </p>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px] text-slate-400 dark:text-slate-500">{t('Total Downtime')}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {downtimeData?.totalDowntimeHours || '24.5'} <span className="text-xs font-semibold text-slate-400">{t('hours', 'hours')}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">{t('Accumulated plant stoppage')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px] text-slate-400 dark:text-slate-500">{t('Avg Incident MTTR')}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2 tracking-tight">
            {downtimeData?.avgDowntimeMinutes || '42'} <span className="text-xs font-semibold text-slate-400">{t('mins', 'mins')}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">{t('Mean Time To Repair')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px] text-slate-400 dark:text-slate-500">{t('Total Incidents')}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 tracking-tight">
            {downtimeData?.totalIncidents || '14'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">{t('Past 30 days recorded')}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
            <span className="uppercase font-bold tracking-wider text-[10px] text-slate-400 dark:text-slate-500">{t('Financial Impact')}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
            ${((downtimeData?.totalDowntimeHours || 24.5) * 850).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">{t('Based on $850/hr downtime loss')}</div>
        </div>
      </div>

      {/* Analytics Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pareto Stoppage by Machine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
            <span>{t('Machine Downtime Pareto (Hours)')}</span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-sans">{t('Highest loss-generating machinery')}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData?.byMachine || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="downtimeHours" name={t('Downtime (Hrs)')} fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime by Line */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
            <span>{t('Downtime by Assembly Line (Hours)')}</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-sans">{t('Line stoppage aggregation')}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData?.byLine || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="downtimeHours" name={t('Line Downtime (Hrs)')} fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

