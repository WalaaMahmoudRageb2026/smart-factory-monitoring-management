import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: string;
  type?: 'machine' | 'line' | 'production' | 'inventory' | 'fault' | 'severity' | 'maintenance' | 'user';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'unknown', className = '' }) => {
  const { t } = useLanguage();
  const safeStatus = String(status || 'Unknown');
  const normalized = safeStatus.toLowerCase();

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotClass = 'bg-slate-400';

  if (['running', 'active', 'completed', 'normal', 'enforced', 'resolved', 'closed', 'passing', 'stock in'].includes(normalized)) {
    bgClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    dotClass = 'bg-emerald-500';
  } else if (['low stock', 'in progress', 'scheduled', 'warning', 'medium', 'idle', 'draft', 'adjustment'].includes(normalized)) {
    bgClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    dotClass = 'bg-amber-500';
  } else if (['stopped', 'critical', 'out of stock', 'cancelled', 'failure', 'inactive', 'high', 'emergency', 'stock out'].includes(normalized)) {
    bgClass = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    dotClass = 'bg-rose-500';
  } else if (['maintenance', 'offline', 'low', 'on leave', 'transfer', 'planned'].includes(normalized)) {
    bgClass = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    dotClass = 'bg-indigo-500';
  }

  // Look up translated status
  const translatedStatus = t(safeStatus, t(normalized, safeStatus));

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-mono tracking-tight ${bgClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span className="capitalize">{translatedStatus}</span>
    </span>
  );
};
