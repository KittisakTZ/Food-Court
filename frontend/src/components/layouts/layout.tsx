// @/components/layouts/layout.tsx

import { Outlet, Navigate, useNavigate } from "react-router-dom";
import NavbarMain from "./navbars/navbar.main";
import { SidebarComponent, DataSideBar } from "./sidebars/sidebar";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useEffect } from "react";
import { getLogout } from "@/services/auth.service";
import { Cart } from "./cart/Cart";
import { FaUtensils } from "react-icons/fa";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";
import { IoIosLogOut } from "react-icons/io";
import { FaUserShield, FaShoppingBag } from "react-icons/fa";
import { MdDashboard, MdStorefront } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { IoFastFoodOutline } from "react-icons/io5";
import { useQueryClient } from "@tanstack/react-query";
import { FiStar } from "react-icons/fi";

const MainLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth, _hasHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth-storage') {
        useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
        <div className="text-center">
          <div className="relative mb-8">
            {/* Outer Ring */}
            <div className="animate-spin rounded-full h-28 w-28 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            {/* Inner Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <IoFastFoodOutline className="w-12 h-12 text-orange-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">กำลังโหลด...</h2>
          <p className="text-gray-600">กรุณารอสักครู่</p>

          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
        clearAuth();
        queryClient.clear();
    };

  const generateSidebarItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { title: "แดชบอร์ด", url: "/", icon: MdDashboard },
          { title: "อนุมัติร้านค้า", url: "/admin/stores-approval", icon: MdStorefront },
          { title: "จัดการผู้ใช้", url: "/admin/users", icon: FaUserShield },
        ];
      case 'SELLER':
        return [
          { title: "คิวออเดอร์", url: "/", icon: FaShoppingBag },
          { title: "จัดการเมนู", url: "/my-store/menus", icon: FaUtensils },
          { title: "รีวิว", url: "/my-store/reviews", icon: FiStar },
          { title: "ตั้งค่าร้าน", url: "/my-store/settings", icon: IoIosSettings },
        ];
      case 'BUYER':
        return [
          { title: "หน้าหลัก", url: "/", icon: MdDashboard },
          //{ title: "ค้นหาร้านค้า", url: "/stores", icon: MdStorefront },
          { title: "ออเดอร์ของฉัน", url: "/my-orders", icon: FaShoppingBag },
        ];
      default:
        return [];
    }
  };

  const dataSidebar: DataSideBar = {
    sidebarItems: [
      {
        name: "เมนู",
        items: generateSidebarItems(),
      },
    ],
    sidebarFooter: {
      profile: {
        name: user?.username ?? "ผู้ใช้",
        avatar: "/images/avatar2.png",
      },
      items: [
        {
          icon: <IoIosLogOut className="text-orange-500" />,
          name: "ออกจากระบบ",
          onClick: handleLogout,
        },
      ],
    },
  };

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-orange-50/50 via-yellow-50/30 to-orange-50/50">
      <SidebarProvider
        style={{
          height: "100%",
          width: "100%",
          paddingTop: "70px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(251, 146, 60, 0.08)",
        }}
      >
        <NavbarMain />
        <SidebarComponent data={dataSidebar} />
        <SidebarInset className="m-0 p-0 bg-transparent w-full max-w-full">
          <div className="px-4 py-4 overflow-auto max-h-[calc(100%-70px)]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      <Cart />
    </div>
  );
};

export default MainLayout;