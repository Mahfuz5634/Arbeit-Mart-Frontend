import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts, removeToast }) => {
  useEffect(() => {
    if (toasts.length > 0) {
      const latest = toasts[toasts.length - 1];
      const timer = setTimeout(() => {
        removeToast(latest.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3.5 rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-xl backdrop-blur-md animate-fade-in-up transition-all duration-300"
            style={{
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-center gap-3">
              {isSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              ) : isError ? (
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              ) : (
                <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              )}
              <p className="text-xs font-semibold text-slate-200">{toast.message}</p>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(1rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
