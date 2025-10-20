// @/App.tsx (ฉบับแก้ไข)

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Router from "./routes/router";
import { ToastProvider, useToast } from "@/components/customs/alert/toast.main.component";
import { registerToast } from "@/services/toast.service";
import { useEffect } from "react";

const queryClient = new QueryClient();

// (แก้ไข) Component Helper
const ToastRegistrar = () => {
  // **แก้ไขตรงนี้: ดึง 'showToast' แทน 'addToast'**
  const { showToast } = useToast();
  
  useEffect(() => {
    // **แก้ไขตรงนี้: ลงทะเบียนฟังก์ชัน 'showToast'**
    registerToast(showToast);
  }, [showToast]);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ToastRegistrar />
        <Router />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App