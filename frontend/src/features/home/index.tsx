// @/features/home/index.tsx

import { useAuthStore } from "@/zustand/useAuthStore";
import { AdminDashboard } from "./components/AdminDashboard";
import { SellerDashboard } from "./components/SellerDashboard";
import { BuyerDashboard } from "./components/BuyerDashboard";

export default function HomeFeature() {
  const { user, isLoading } = useAuthStore();

  // แสดง Loading ขณะรอข้อมูล user
  if (isLoading) {
    return <div>กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  // ถ้าไม่มี user (อาจจะเข้าถึงหน้านี้โดยตรง)
  if (!user) {
      return <div>เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้ กรุณาลองเข้าสู่ระบบอีกครั้ง</div>;
  }

  // แสดงผล Component ตาม Role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'SELLER':
      return <SellerDashboard />;
    case 'BUYER':
      return <BuyerDashboard />;
    default:
      return <div>ไม่ทราบบทบาท กรุณาติดต่อฝ่ายสนับสนุน</div>;
  }
}