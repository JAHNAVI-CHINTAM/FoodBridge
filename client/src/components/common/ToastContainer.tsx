import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 backdrop-blur-xl ${
            toast.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-slate-900/95 border-red-500/50 text-white shadow-red-950/40'
              : toast.type === 'warning'
              ? 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-950/40'
              : 'bg-slate-900/95 border-blue-500/50 text-white shadow-blue-950/40'
          }`}
        >
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
            <p className="text-xs mt-0.5 text-slate-300 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
