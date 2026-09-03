import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const actualConfirmLabel = confirmLabel || t('confirmAction', 'Confirm Action');
  const actualCancelLabel = cancelLabel || t('cancel', 'Cancel');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="confirm-modal-box"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-200"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            id="btn-confirm-cancel"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            {actualCancelLabel}
          </button>
          <button
            id="btn-confirm-action"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 dark:shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
            }`}
          >
            {actualConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

