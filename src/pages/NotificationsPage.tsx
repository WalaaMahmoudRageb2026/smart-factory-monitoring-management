import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Notification } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  Search,
  Filter
} from 'lucide-react';

export const NotificationsPage: React.FC<{ onRefreshNotifs?: () => void }> = ({ onRefreshNotifs }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const { t, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      if (res && res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err: any) {
      console.warn('Unable to load latest alerts:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.patch('/notifications/mark-all-read');
      if (res.success) {
        toastSuccess(t('All Notifications Read', 'All Notifications Read'), t('Alert center updated.', 'Alert center updated.'));
        fetchNotifs();
        if (onRefreshNotifs) onRefreshNotifs();
      }
    } catch (err: any) {
      toastError(t('Failed to mark read', 'Failed to mark read'), err.message);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifs();
      if (onRefreshNotifs) onRefreshNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    const matchesSeverity = !severityFilter || n.severity === severityFilter;
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <span>{t('Alerts & Notifications')}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('Real-time threshold telemetry breaches, maintenance deadlines, and inventory alerts.')}
          </p>
        </div>

        <button
          id="btn-mark-all-notifications-read"
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 shadow-xs hover:shadow-md self-start sm:self-auto cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('Mark All as Acknowledged')}</span>
        </button>
      </div>

      {/* Filter and Search Bar Bento Tile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
          <input
            type="text"
            placeholder={t('Search notification messages or titles...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans`}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">{t('All Severities')}</option>
            <option value="error">{t('Critical Errors')}</option>
            <option value="warning">{t('Warnings')}</option>
            <option value="info">{t('System Info')}</option>
          </select>
        </div>
      </div>

      {/* Notifications List Bento Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[2rem] divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-sans">{t('loading')}</div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-sans">{t('No notifications recorded in system memory.')}</div>
        ) : (
          filteredNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkOne(n.id)}
              className={`p-5 transition-colors flex items-start gap-4 cursor-pointer ${
                !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  n.severity === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50'
                    : n.severity === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50'
                }`}
              >
                {n.severity === 'error' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : n.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {t(n.title, n.title)}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {n.timestamp ? new Date(n.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('Just now')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t(n.message, n.message)}</p>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-1.5 shadow-xs" title="Unread" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

