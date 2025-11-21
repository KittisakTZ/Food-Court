// @/components/layouts/layout.tsx

import { Outlet, Navigate, useNavigate } from "react-router-dom";
import NavbarMain from "./navbars/navbar.main";
import { SidebarComponent, DataSideBar } from "./sidebars/sidebar";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useEffect } from "react";
import { getMe, getLogout } from "@/services/auth.service";
import { Cart } from "./cart/Cart";
import { FaUtensils } from "react-icons/fa";
import { SidebarProvider, SidebarInset } from "../ui/sidebar";
import { IoIosLogOut } from "react-icons/io";
import { FaUserShield, FaShoppingBag } from "react-icons/fa";
import { MdDashboard, MdStorefront } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { IoFastFoodOutline } from "react-icons/io5";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FiStar } from "react-icons/fi";

const MainLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, clearAuth, setUser, _hasHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  // --- 🛡️ ส่วน Gatekeeper ที่เพิ่มเข้ามา 🛡️ ---
  // 1. ใช้ useQuery เพื่อ "ทวนสอบ" session กับ backend ทันทีที่ component โหลด
  const {
    data: userData,
    isError,
    isLoading: isVerifyingSession, // เปลี่ยนชื่อเป็น isVerifyingSession เพื่อให้สื่อความหมาย
    isSuccess,
  } = useQuery({
    queryKey: ['me'], // queryKey สำหรับการดึงข้อมูลผู้ใช้
    queryFn: getMe,   // ฟังก์ชัน API ที่จะเรียก
    enabled: _hasHydrated, // จะเริ่มเรียก API ก็ต่อเมื่อ zustand โหลดข้อมูลจาก localStorage เสร็จแล้ว
    retry: false, // สำคัญมาก: ถ้า session ไม่ถูกต้อง (ได้ 401) ไม่ต้องพยายามเรียกซ้ำ
    refetchOnWindowFocus: false, // ป้องกันการเรียกซ้ำเมื่อผู้ใช้สลับหน้าจอ
  });

  // 2. ใช้ useEffect เพื่อจัดการผลลัพธ์จากการทวนสอบ
  useEffect(() => {
    if (!_hasHydrated) return; // รอให้ rehydration เสร็จก่อน

    if (isError) {
      // ถ้า Backend ตอบกลับมาว่า Error (เช่น 401 Unauthorized)
      // หมายความว่า session ปลอม หรือหมดอายุ
      console.log("Session verification failed. Logging out.");
      clearAuth(); // ล้าง state ปลอมใน zustand
      queryClient.clear(); // ล้าง cache ทั้งหมดของ react-query
      navigate('/login', { replace: true }); // ส่งกลับไปหน้า login
    } else if (isSuccess && userData?.responseObject) {
      // ถ้า Backend ยืนยันว่า session ถูกต้อง
      // อัปเดตข้อมูล user ใน zustand ให้เป็นข้อมูลล่าสุดจาก server เสมอ
      // ป้องกันกรณีข้อมูลใน localStorage เก่าหรือไม่ตรง
      setUser(userData.responseObject);
    }
  }, [isError, isSuccess, userData, _hasHydrated, navigate, clearAuth, queryClient, setUser]);


  // 3. แสดงหน้า Loading แบบเต็มจอขณะกำลัง "ทวนสอบ" session
  // นี่คือส่วนที่ "Block" ไม่ให้ผู้ใช้เห็น UI หลักจนกว่าจะตรวจสอบเสร็จ
  if (!_hasHydrated || isVerifyingSession) {
    return (
      // ... แสดง Component Loading แบบเต็มหน้าจอ ...
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">กำลังตรวจสอบสิทธิ์การเข้าใช้...</h2>
        </div>
      </div>
    );
  }

  // 4. ถ้าตรวจสอบแล้วไม่ผ่าน หรือ state ไม่ถูกต้อง ก็ให้ redirect
  if (!isAuthenticated || !user) {
    // หลังจาก logic ข้างบนทำงาน ถ้า isAuthenticated ยังเป็น false ก็คือไม่ผ่านจริงๆ
    return <Navigate to="/login" replace />;
  }

  // --- ✅ ถ้าผ่านทุกด่านมาได้ ถึงจะแสดงผลหน้าหลัก ✅ ---

  const handleLogout = async () => {
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