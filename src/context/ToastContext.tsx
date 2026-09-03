import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev.slice(-4), newToast]); // keep max 5

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(toast => {
          const bgColors = {
            success: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-100/50',
            error: 'bg-white border-rose-200 text-slate-800 shadow-rose-100/50',
            warning: 'bg-white border-amber-200 text-slate-800 shadow-amber-100/50',
            info: 'bg-white border-indigo-200 text-slate-800 shadow-indigo-100/50'
          };
          const icons = {
            success: <div className="p-1 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4 shrink-0" /></div>,
            error: <div className="p-1 rounded-xl bg-rose-50 text-rose-600"><AlertCircle className="w-4 h-4 shrink-0" /></div>,
            warning: <div className="p-1 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle className="w-4 h-4 shrink-0" /></div>,
            info: <div className="p-1 rounded-xl bg-indigo-50 text-indigo-600"><Info className="w-4 h-4 shrink-0" /></div>
          };

          return (
            <div
              key={toast.id}
              id={`toast-${toast.id}`}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-200 animate-in slide-in-from-right-4 ${bgColors[toast.type]}`}
            >
              {icons[toast.type]}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900 leading-tight">{toast.title}</div>
                {toast.message && <div className="text-slate-500 mt-1">{toast.message}</div>}
              </div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
