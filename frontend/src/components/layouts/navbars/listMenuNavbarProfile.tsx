// @/components/layouts/navbars/listMenuNavbarProfile.tsx

import { Flex, Text } from "@radix-ui/themes";
import { IoIosLogOut } from "react-icons/io";
import { getLogout } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useState } from "react";

const ListMenuNavbarProfile = ({ title }: { title: string }) => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await getLogout();
      if (response.statusCode === 200) {
        clearAuth(); // เคลียร์ข้อมูล auth ใน store
        toastService.success("ออกจากระบบสำเร็จ");
        navigate("/login");
      } else {
        toastService.error(`เกิดข้อผิดพลาด: ${response.message}`);
      }
    } catch (error: unknown) {
      console.error("Logout error:", error);
      // แม้ API ล้มเหลว ก็ยังให้ logout ที่ฝั่ง client
      clearAuth();
      toastService.warning("ออกจากระบบแล้ว (บางข้อมูลอาจไม่ถูกล้างจากเซิร์ฟเวอร์)");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      className="group hover:bg-red-50 cursor-pointer rounded-xl px-4 py-3 transition-all duration-200"
      gap="3"
      align="center"
      onClick={handleLogout}
    >
      <div className="w-10 h-10 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
        <IoIosLogOut size="20px" className="text-red-600" />
      </div>
      <div className="flex-1">
        <Text className="text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors">
          {title}
        </Text>
        {isLoading && (
          <Text className="text-xs text-gray-500">กำลังออกจากระบบ...</Text>
        )}
      </div>
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
      )}
    </Flex>
  );
};

export default ListMenuNavbarProfile;