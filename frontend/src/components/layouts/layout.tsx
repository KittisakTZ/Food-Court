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
import { FaUserShield, FaStore, FaShoppingBag } from "react-icons/fa";
import { MdDashboard, MdListAlt, MdStorefront } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";

const MainLayout = () => {
  const navigate = useNavigate();

  // 1. ดึง state และ action ที่จำเป็นทั้งหมดจาก useAuthStore
  const { isAuthenticated, user, clearAuth, isLoading, setIsLoading } = useAuthStore();

  // 2. จัดการ Initial Load เมื่อผู้ใช้เปิดแอปหรือ Refresh หน้า
  // useEffect นี้จะทำงานแค่ครั้งเดียวหลังจากที่ Zustand rehydrate state จาก localStorage เสร็จ
  useEffect(() => {
    // ฟังก์ชันนี้จะถูกเรียกเมื่อ state ของ persist rehydrate เสร็จ
    const handleRehydration = () => {
      // ไม่ว่าจะมี user หรือไม่ก็ตาม การ rehydrate ถือว่าเสร็จสิ้น
      // เราจึงสามารถปิดสถานะ isLoading ได้
      setIsLoading(false);
    };

    // สมัครใช้งาน event 'rehydrated' ของ store
    const unsubscribe = useAuthStore.persist.onFinishHydration(handleRehydration);

    // ทำความสะอาด (cleanup) เมื่อ component unmount
    return () => {
      unsubscribe();
    };
  }, [setIsLoading]);


  // 3. แสดงหน้า Loading ขณะที่ Zustand กำลังดึงข้อมูลจาก localStorage
  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              Loading Application...
          </div>
      );
  }

  // 4. Logic ป้องกัน Route: ถ้าโหลดเสร็จแล้วแต่ยังไม่ Login ให้ Redirect
  if (!isAuthenticated) {
    // ใช้ component <Navigate> จาก react-router-dom เพื่อเปลี่ยนหน้า
    // `replace` จะทำให้ผู้ใช้กด back กลับมาหน้านี้ไม่ได้
    return <Navigate to="/login" replace />;
  }
  
  // 5. Logic การออกจากระบบ
  const handleLogout = async () => {
    try {
        await getLogout(); // เรียก API Logout
    } catch (error) {
        console.error("Logout API failed, but clearing client-side auth anyway.", error);
    } finally {
        clearAuth(); // เคลียร์ข้อมูลใน store และ localStorage
        navigate("/login"); // ส่งไปหน้า Login (เป็น fallback ที่ดี)
    }
  };

  // 6. สร้างข้อมูล Sidebar แบบ Dynamic ตาม Role ของผู้ใช้
  const generateSidebarItems = () => {
    if (!user) return []; // กรณีฉุกเฉิน

    switch (user.role) {
      case 'ADMIN':
        return [
            { title: "Dashboard", url: "/", icon: MdDashboard },
            { title: "Approve Stores", url: "/admin/stores-approval", icon: MdStorefront },
            { title: "User Management", url: "/admin/users", icon: FaUserShield },
        ];
      case 'SELLER':
        return [
            { title: "Order Queue", url: "/", icon: FaShoppingBag },
            { title: "Menu Management", url: "/my-store/menus", icon: FaUtensils },
            { title: "Store Settings", url: "/my-store/settings", icon: IoIosSettings }, // <-- เพิ่ม Link ใหม่
        ];
      case 'BUYER':
        return [
            { title: "Home", url: "/", icon: MdDashboard },
            { title: "Find Stores", url: "/stores", icon: MdStorefront },
            { title: "My Orders", url: "/my-orders", icon: FaShoppingBag },
        ];
      default:
        return [];
    }
  };

  // 7. เตรียมข้อมูลทั้งหมดสำหรับ SidebarComponent
  const dataSidebar: DataSideBar = {
    sidebarItems: [
      {
        name: "MENU",
        items: generateSidebarItems(),
      },
    ],
    sidebarFooter: {
      profile: {
        name: user?.username ?? "Guest",
        avatar: "/images/avatar2.png", // อาจจะใช้ user.profilePicture ในอนาคต
      },
      items: [
        {
          icon: <IoIosLogOut className="text-theme-yellow" />,
          name: "ออกจากระบบ",
          onClick: handleLogout,
        },
      ],
    },
  };

  // 8. แสดงผล Layout หลักสำหรับผู้ใช้ที่ Login แล้ว
  return (
    <div className=" relative w-screen h-screen">
      <SidebarProvider
        style={{
          height: "100%",
          width: "100%",
          paddingTop: "70px",
          overflow: "hidden",
          boxShadow: "4px 2px 12px 0px #0A0A100F",
        }}
      >
        <NavbarMain />
        <SidebarComponent data={dataSidebar} />
        <SidebarInset className="m-0 p-0 bg-[#F6F7F9] w-full max-w-full">
          <div className=" px-4 py-4 overflow-auto max-h-[calc(100%-70px)]">
            {/* <Outlet> คือจุดที่เนื้อหาของแต่ละหน้า (เช่น HomePage) จะถูกแสดงผล */}
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      
      <Cart />
    </div>
  );
};

export default MainLayout;