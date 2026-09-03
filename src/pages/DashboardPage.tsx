import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { DashboardKPIs } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Factory,
  Cpu,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Gauge,
  HelpCircle,
  Play,
  Square,
  Wrench,
  RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC<{ onNavigate: (tab: any) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [showOeeTooltip, setShowOeeTooltip] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts', { timeframe })
      ]);

      if (statsRes.success) setKpis(statsRes.kpis);
      if (chartsRes.success) setCharts(chartsRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '16px',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
  };

  const gridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';

  if (isLoading && !kpis) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[450px] text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-medium">{t('loadingTelemetry')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <span>{t('plantOperationsCenter')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold">
              {t('liveFeed')}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('dashboardSub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('refreshTelemetry')}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Total Output */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {t('totalOutput')}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {(kpis?.totalProduction ?? 0).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">{t('units')}</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-2 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('vsTarget')}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('today')}</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {(kpis?.productionToday ?? 0).toLocaleString()} u
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('thisWeek')}</div>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {(kpis?.productionThisWeek ?? 0).toLocaleString()} u
              </div>
            </div>
          </div>
        </div>

        {/* Bento Tile 2: OEE Metric Card (Indigo Bento) */}
        <div className="bg-indigo-600 text-white rounded-[2rem] p-6 shadow-lg shadow-indigo-100 dark:shadow-none flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('overallOEE')}</span>
              <button
                onClick={() => setShowOeeTooltip(!showOeeTooltip)}
                className="text-indigo-200 hover:text-white"
                title="Explain OEE Formula"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-4xl font-black text-white font-mono tracking-tight">
              {kpis?.oee?.overall ?? 83.5}%
            </div>
            <div className="text-xs text-indigo-100 mt-1 font-medium">{t('targetBenchmark')}</div>
          </div>

          {/* OEE 3 Component Sub-bars */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 p-2 bg-indigo-700/60 rounded-2xl text-[10px] font-mono text-center">
            <div>
              <div className="text-indigo-200 text-[9px] uppercase">{t('availability')}</div>
              <div className="text-white font-bold">{kpis?.oee?.availability ?? 92.4}%</div>
            </div>
            <div>
              <div className="text-indigo-200 text-[9px] uppercase">{t('performance')}</div>
              <div className="text-white font-bold">{kpis?.oee?.performance ?? 91.8}%</div>
            </div>
            <div>
              <div className="text-indigo-200 text-[9px] uppercase">{t('quality')}</div>
              <div className="text-white font-bold">{kpis?.oee?.quality ?? 98.5}%</div>
            </div>
          </div>

          {/* OEE Explainer Tooltip */}
          {showOeeTooltip && (
            <div className="absolute inset-4 p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl shadow-2xl z-20 text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-indigo-300">{t('Overall Equipment Effectiveness')}</div>
              <div className="font-mono text-[10px] text-slate-400">{t('Availability × Performance × Quality')}</div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                • <strong>{t('availability')}:</strong> {kpis?.oee?.availability ?? 92.4}%<br/>
                • <strong>{t('performance')}:</strong> {kpis?.oee?.performance ?? 91.8}%<br/>
                • <strong>{t('quality')}:</strong> {kpis?.oee?.quality ?? 98.5}%
              </p>
              <button
                onClick={() => setShowOeeTooltip(false)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold block pt-1 cursor-pointer"
              >
                {t('Close Explainer')}
              </button>
            </div>
          )}
        </div>

        {/* Bento Tile 3: Active Machine Health */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-md shadow-slate-900/10 flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t('machineStatus')}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {kpis?.activeMachines}{' '}
              <span className="text-xs font-normal text-slate-400">/ {kpis?.totalMachines} {t('activeMachines')}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">91.6% {t('floor operational rate')}</div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-rose-400">
              <Square className="w-3.5 h-3.5" />
              <span>{kpis?.stoppedMachines} {t('stopped')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Wrench className="w-3.5 h-3.5" />
              <span>{kpis?.maintenanceMachines} {t('maint')}</span>
            </div>
          </div>
        </div>

        {/* Bento Tile 4: Plant Incidents & Low Stock */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {t('incidentsAndStock')}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black text-amber-900 dark:text-amber-100 font-mono tracking-tight">
              {kpis?.activeFaults}{' '}
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{t('activeFaults')}</span>
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-300 mt-1 font-semibold">
              {kpis?.lowStockItems} {t('lowStock')} • {kpis?.totalDowntimeHours}h {t('downtime')}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/70 dark:border-amber-800/70 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('faults')}
              className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 underline cursor-pointer"
            >
              {t('Fault Ledger →')}
            </button>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 underline cursor-pointer"
            >
              {t('Stock Check →')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('productionOutputVsTarget')}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {timeframe.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('Real-time throughput aggregated across all active assembly cells')}</p>
            </div>

            {/* Timeframe buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
              {(['daily', 'weekly', 'monthly'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(tf)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.productionTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="time" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="actual" name={t('Actual Units')} stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#actualGrad)" />
                <Area type="monotone" dataKey="target" name={t('Target Plan')} stroke="#10B981" strokeDasharray="4 4" strokeWidth={2} fillOpacity={1} fill="url(#targetGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Status Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{t('machineStatusRatio')}</span>
              <Cpu className="w-4 h-4 text-slate-400" />
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('Real-time status of 12 factory floor machines')}</p>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.machineStatus || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {charts?.machineStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            {charts?.machineStatus?.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-semibold">{t(item.name)}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Analytics Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production By Line Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('productionByLine')}</h2>
            <span className="text-[11px] font-mono text-slate-400">{t('Actual vs Target')}</span>
          </div>

          <div className="h-60 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.productionByLine || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="actual" name={t('actual', 'Actual')} fill="#4F46E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name={t('target', 'Target')} fill={isDark ? '#334155' : '#CBD5E1'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downtime by Machine */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('downtimeByMachine')}</h2>
            <button
              onClick={() => onNavigate('downtime')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold cursor-pointer"
            >
              {t('Deep Dive →')}
            </button>
          </div>

          <div className="h-60 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts?.downtimeByMachine || []} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis type="number" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke={axisStroke} fontSize={11} tickLine={false} width={65} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="downtimeHours" name={t('Downtime (Hrs)')} fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('efficiencyTrends')}</h2>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{t('Target: 85%+')}</span>
          </div>

          <div className="h-60 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.efficiencyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="day" stroke={axisStroke} fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke={axisStroke} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="plantAvg" name={t('Plant Avg %')} stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lineA" name="Line A" stroke="#4F46E5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lineC" name="Line C (CNC)" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

