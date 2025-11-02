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

const MainLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth, isLoading, setIsLoading } = useAuthStore();

  useEffect(() => {
    const handleRehydration = () => {
      setIsLoading(false);
    };

    const unsubscribe = useAuthStore.persist.onFinishHydration(handleRehydration);

    return () => {
      unsubscribe();
    };
  }, [setIsLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">กำลังโหลดแอปพลิเคชัน...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const handleLogout = async () => {
    try {
      await getLogout();
    } catch (error) {
      console.error("Logout API failed, but clearing client-side auth anyway.", error);
    } finally {
      clearAuth();
      navigate("/login");
    }
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
    <div className="relative w-screen h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <SidebarProvider
        style={{
          height: "100%",
          width: "100%",
          paddingTop: "70px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(251, 146, 60, 0.1)",
        }}
      >
        <NavbarMain />
        <SidebarComponent data={dataSidebar} />
        <SidebarInset className="m-0 p-0 bg-gradient-to-br from-orange-50/30 to-yellow-50/30 w-full max-w-full">
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