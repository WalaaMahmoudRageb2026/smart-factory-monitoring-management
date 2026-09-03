import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AuditLog } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  Search,
  Lock,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/audit-logs', { search, result: resultFilter });
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, resultFilter]);

  const exportLogs = () => {
    const headers = ['Log ID', 'Timestamp', 'User Name', 'Action', 'Resource', 'IP Address', 'Result', 'Details'].join(',');
    const rows = logs.map(l =>
      [
        l.id,
        l.timestamp,
        `"${l.userName}"`,
        `"${l.action}"`,
        `"${l.resource}"`,
        l.ipAddress,
        l.result,
        `"${l.details}"`
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span>{t('Audit Logs')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Tamper-evident system activity ledger, privileged access events, and IP ingress tracking.')}
          </p>
        </div>

        <button
          id="btn-export-audit-trail"
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>{t('Export Audit Trail (CSV)')}</span>
        </button>
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search by User, Action, Resource, or IP...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Execution Results')}</option>
            <option value="SUCCESS">{t('SUCCESS (Authorized)')}</option>
            <option value="FAILURE">{t('FAILURE / BLOCKED')}</option>
          </select>
        </div>
      </div>

      {/* Audit Table Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-5 py-3.5">{t('Audit ID')}</th>
                <th className="px-5 py-3.5">{t('Timestamp')}</th>
                <th className="px-5 py-3.5">{t('Operator / Identity')}</th>
                <th className="px-5 py-3.5">{t('Action Type')}</th>
                <th className="px-5 py-3.5">{t('Target Resource')}</th>
                <th className="px-5 py-3.5">{t('Source IP')}</th>
                <th className="px-5 py-3.5">{t('Result')}</th>
                <th className="px-5 py-3.5">{t('Event Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-sans">{t('loading')}</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-sans">{t('No audit records match the current filters.')}</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {log.id}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {t(log.action, log.action)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                      {t(log.resource, log.resource)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}>
                        {log.result === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                        <span>{t(log.result, log.result)}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-slate-600 dark:text-slate-300 text-[11px] max-w-[240px] truncate">
                      {t(log.details, log.details)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

