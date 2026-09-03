import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  BarChart2,
  Boxes,
  Cpu,
  Users,
  Factory
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { success: toastSuccess } = useToast();
  const { t, isRTL } = useLanguage();
  const [reportType, setReportType] = useState<'production' | 'machines' | 'inventory' | 'workforce'>('production');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reports/generate', { type: reportType, range: dateRange });
      if (res.success) setReportData(res.report);
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, dateRange]);

  const exportCSV = () => {
    if (!reportData || !reportData.rows) return;

    const headers = Object.keys(reportData.rows[0] || {}).join(',');
    const rows = reportData.rows.map((row: any) =>
      Object.values(row)
        .map(val => (typeof val === 'string' && val.includes(',') ? `"${val}"` : val))
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_factory_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toastSuccess(t('Report Exported', 'Report Exported'), t('CSV file downloaded to your device.', 'CSV file downloaded to your device.'));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span>{t('Reports & Analytics')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Generate executive compliance summaries, export telemetry CSV logs, and print shift audits.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-csv"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('Export CSV Dataset')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{t('Print Report')}</span>
          </button>
        </div>
      </div>

      {/* Report Configuration Strip Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Report Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <button
            onClick={() => setReportType('production')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportType === 'production'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>{t('Production & OEE')}</span>
          </button>

          <button
            onClick={() => setReportType('machines')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportType === 'machines'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{t('Machine Uptime')}</span>
          </button>

          <button
            onClick={() => setReportType('inventory')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportType === 'inventory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{t('Inventory Flow')}</span>
          </button>

          <button
            onClick={() => setReportType('workforce')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportType === 'workforce'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('Workforce Shift')}</span>
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="7d">{t('Last 7 Operating Days')}</option>
            <option value="30d">{t('Last 30 Operating Days')}</option>
            <option value="90d">{t('Current Financial Quarter (Q3)')}</option>
            <option value="1y">{t('Year-to-Date (YTD 2026)')}</option>
          </select>
        </div>
      </div>

      {/* Generated Report Content Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-6 shadow-xs space-y-6">
        {/* Report Meta Heading */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold tracking-wider">{t('Executive Report Summary')}</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{reportData?.title ? t(reportData.title, reportData.title) : t('loading')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{reportData?.description ? t(reportData.description, reportData.description) : ''}</p>
          </div>
          <div className="text-right rtl:text-left text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div>{t('Generated')}: {new Date().toLocaleDateString()}</div>
            <div>{t('Timeframe')}: {dateRange.toUpperCase()}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        {reportData?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {reportData.summary.map((s: any) => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-bold tracking-wider">{t(s.label, s.label)}</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  {reportData?.columns?.map((col: string) => (
                    <th key={col} className="px-5 py-3.5">{t(col, col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={reportData?.columns?.length || 5} className="p-8 text-center text-slate-400 font-sans">
                      {t('Compiling report records...')}
                    </td>
                  </tr>
                ) : reportData?.rows?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    {Object.values(row).map((val: any, j: number) => (
                      <td key={j} className="px-5 py-3.5 whitespace-nowrap">
                        {typeof val === 'number' ? Number(val).toLocaleString() : String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

