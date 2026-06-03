import { createContext, useContext, useState, ReactNode } from 'react';
import * as Toast from "@radix-ui/react-toast";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";

type ToastType = 'success' | 'error' | 'warning';

type ToastContextType = {
  showToast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const STYLES: Record<ToastType, { border: string; iconBg: string; icon: JSX.Element; title: string }> = {
  success: { border: 'border-l-green-500',  iconBg: 'bg-green-500',  icon: <FiCheck className="w-4 h-4 text-white" />,         title: 'Success' },
  error:   { border: 'border-l-red-500',    iconBg: 'bg-red-500',    icon: <FiX className="w-4 h-4 text-white" />,             title: 'Error'   },
  warning: { border: 'border-l-yellow-500', iconBg: 'bg-yellow-500', icon: <FiAlertTriangle className="w-4 h-4 text-white" />, title: 'Notice'  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider swipeDirection="right" duration={10000}>
        {toasts.map(toast => {
          const s = STYLES[toast.type];
          return (
            <Toast.Root
              key={toast.id}
              open={true}
              onOpenChange={(open) => { if (!open) removeToast(toast.id); }}
              duration={10000}
              className={`
                bg-white border border-slate-200 border-l-4 ${s.border}
                rounded-xl shadow-xl p-4 flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-8
                data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
                data-[swipe=cancel]:translate-x-0
                data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]
              `}
            >
              <div className={`${s.iconBg} rounded-lg p-1.5 flex-shrink-0 mt-0.5`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <Toast.Title className="font-bold text-sm text-slate-900">{s.title}</Toast.Title>
                <Toast.Description className="text-sm text-slate-600 mt-0.5 leading-relaxed">{toast.message}</Toast.Description>
              </div>
              <Toast.Close asChild>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-700 transition-colors mt-0.5 p-0.5 rounded hover:bg-slate-100"
                  aria-label="Close"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </Toast.Close>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="fixed top-16 right-4 flex flex-col gap-2 z-50 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
