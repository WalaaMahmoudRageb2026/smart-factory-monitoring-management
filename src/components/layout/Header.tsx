import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Clock,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CountryLanguageSelector } from '../common/CountryLanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { BrandLogo } from '../common/BrandLogo';
import { Notification } from '../../types';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  onToggleSidebar: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  notifications,
  unreadCount,
  onMarkAllRead,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const { t, isRTL, currentCountryLang } = useLanguage();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(d.toLocaleDateString(currentCountryLang.langCode === 'ar' ? 'ar-EG' : undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentCountryLang]);

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <BrandLogo size="sm" withGlow={false} />
          <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 tracking-tight">SMART FACTORY</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('allSystemsOperational')}</span>
          </div>
          <div className="text-slate-300 dark:text-slate-600">•</div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-xs">
            <Radio className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{t('shift1')}</span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Country & Language Switcher */}
        <CountryLanguageSelector variant="header" />

        {/* Dark Mode / Light Mode Toggle */}
        <ThemeToggle variant="simple" />

        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{dateStr || '2026-08-25'}</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{time}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="btn-header-notifs"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700/60"
            title={t('factoryAlerts')}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div
              id="header-notifs-dropdown"
              className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
            >
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {t('factoryAlerts')} ({unreadCount} {t('newAlerts')})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                    >
                      {t('markAllRead')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                {(!notifications || notifications.length === 0) ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                    {t('noAlerts')}
                  </div>
                ) : (
                  notifications.slice(0, 5).map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 text-xs transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60 ${
                        !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          {n.severity === 'error' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : n.severity === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                          <span className="truncate">{t(n.title, n.title)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{t(n.message, n.message)}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    onNavigateTab('notifications');
                    setShowNotifs(false);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center justify-center gap-1.5 w-full py-1"
                >
                  <span>{t('openNotificationCenter')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Identity Display */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l rtl:border-l-0 rtl:border-r rtl:pr-2 sm:rtl:pr-3 rtl:pl-0 border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden xl:block text-start">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[120px]">
                {t(user.name, user.name)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[120px]">
                {t(user.department, user.department)}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
