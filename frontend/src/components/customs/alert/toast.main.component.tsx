// @/components/customs/alert/toast.main.component.tsx (ฉบับแก้ไข)

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Toast from "@radix-ui/react-toast";

type ToastContextType = {
  // เปลี่ยนชื่อฟังก์ชันให้สื่อความหมายมากขึ้น
  showToast: (message: string, type: 'success' | 'error') => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// (1) รวม State ทั้งหมดไว้ใน Object เดียว
interface ToastState {
  open: boolean;
  message: string;
  type: 'success' | 'error';
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    type: 'success',
  });

  // (2) แก้ไขฟังก์ชัน showToast
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ open: true, message, type });
  };
  
  // (Optional but Recommended) ใช้ useEffect จัดการการปิด Toast
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        setToast((currentToast) => ({ ...currentToast, open: false }));
      }, 3000); // 3 วินาที

      return () => clearTimeout(timer); // Cleanup function
    }
  }, [toast.open]);


  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          open={toast.open}
          onOpenChange={(open) => setToast({ ...toast, open })}
          // (3) แก้ไข className ให้ใช้ toast.type
          className={`fixed top-[70px] right-4 max-w-lg w-auto px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:fade-in-80 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] ${
            toast.type === 'success' ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {/* (4) แก้ไขข้อความให้ใช้ toast.type */}
            <strong className="font-bold text-lg">{toast.type === 'success' ? "Success!" : "Error!"}</strong>
            <span className="ml-2 text-sm">{toast.message}</span>
          </div>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 p-4" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};