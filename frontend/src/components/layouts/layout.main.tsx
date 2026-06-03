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
          <p className="text-lg font-medium text-gray-700">Loading application...</p>
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
          { title: "Dashboard", url: "/", icon: MdDashboard },
          { title: "Store Approvals", url: "/admin/stores-approval", icon: MdStorefront },
          { title: "Manage Users", url: "/admin/users", icon: FaUserShield },
        ];
      case 'SELLER':
        return [
          { title: "Dashboard", url: "/", icon: MdDashboard },
          { title: "Order Queue", url: "/orders", icon: FaShoppingBag },
          { title: "Manage Menu", url: "/my-store/menus", icon: FaUtensils },
          { title: "Store Settings", url: "/my-store/settings", icon: IoIosSettings },
        ];
      case 'BUYER':
        return [
          { title: "Home", url: "/", icon: MdDashboard },
          //{ title: "Search Stores", url: "/stores", icon: MdStorefront },
          { title: "My Orders", url: "/my-orders", icon: FaShoppingBag },
        ];
      default:
        return [];
    }
  };

  const dataSidebar: DataSideBar = {
    sidebarItems: [
      {
        name: "Menu",
        items: generateSidebarItems(),
      },
    ],
    sidebarFooter: {
      profile: {
        name: user?.username ?? "User",
        avatar: "/images/avatar2.png",
      },
      items: [
        {
          icon: <IoIosLogOut className="text-orange-500" />,
          name: "Logout",
          onClick: handleLogout,
        },
      ],
    },
  };

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
      {/* Navbar - Fixed อยู่นอก SidebarProvider */}
      <NavbarMain />

      {/* Sidebar & Content */}
      <SidebarProvider
        style={{
          height: "100%",
          width: "100%",
          paddingTop: "70px",
          overflow: "hidden",
        }}
      >
        <SidebarComponent data={dataSidebar} />
        <SidebarInset className="m-0 p-0 bg-gradient-to-br from-orange-50/30 to-yellow-50/30 w-full max-w-full">
          <div className="px-2 sm:px-4 py-2 sm:py-4 overflow-auto max-h-[calc(100%-70px)]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Cart - Fixed */}
      <Cart />
    </div>
  );
};

export default MainLayout;