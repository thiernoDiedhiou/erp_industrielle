'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const STYLES: Record<ToastType, { bg: string; icon: ReactNode }> = {
  success: { bg: 'bg-green-600', icon: <CheckCircle size={18} /> },
  error:   { bg: 'bg-red-600',   icon: <XCircle size={18} /> },
  warning: { bg: 'bg-amber-500', icon: <AlertTriangle size={18} /> },
  info:    { bg: 'bg-blue-600',  icon: <Info size={18} /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const ctx: ToastContextValue = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg),
    warning: (msg) => add('warning', msg),
    info:    (msg) => add('info', msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const { bg, icon } = STYLES[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-slide-in min-w-[260px] max-w-sm`}
            >
              {icon}
              <span className="flex-1 text-sm font-medium">{t.message}</span>
              <button aria-label="Fermer" onClick={() => remove(t.id)} className="ml-1 opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
