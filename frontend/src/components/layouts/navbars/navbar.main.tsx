// @/components/layouts/navbars/navbar.main.tsx

import { useAuthStore } from "@/zustand/useAuthStore";
import { Avatar, Box, Flex, Text } from "@radix-ui/themes";
import SidebarTriggerCustom from "@/components/customs/button/sidebarTriggerCustom";
import { MdRestaurant, MdShoppingCart } from "react-icons/md";
import { FiBell } from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { getLogout } from "@/services/auth.service";
import { toastService } from "@/services/toast.service";
import { useState } from "react";

const NavbarMain = () => {
  const { user, clearAuth } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await getLogout();
      if (res.statusCode === 200) {
        clearAuth();
        toastService.success("ออกจากระบบสำเร็จ");
        navigate("/login");
      } else {
        toastService.error("ออกจากระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toastService.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  return (
    <Flex
      className="fixed w-full top-0 h-[70px] bg-white z-30 border-b border-gray-100"
      justify="center"
      align="center"
      style={{ boxShadow: "0 2px 8px rgba(251, 146, 60, 0.1)" }}
    >
      <Flex
        className="w-full max-w-screen-2xl px-6"
        justify="between"
        align="center"
      >
        {/* === Left Section === */}
        <Flex align="center" gap="4">
          <SidebarTriggerCustom />
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <MdRestaurant className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                ระบบจองอาหาร
              </h1>
              <p className="text-xs text-gray-500">มหาวิทยาลัย</p>
            </div>
          </Link>
        </Flex>

        {/* === Center Section: Quick Links === */}
        <nav className="hidden lg:flex items-center gap-2">
          {user?.role === "BUYER" && (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <IoFastFoodOutline className="w-5 h-5" />
                <span>หน้าหลัก</span>
              </Link>
              <Link
                to="/stores"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <MdRestaurant className="w-5 h-5" />
                <span>ร้านค้า</span>
              </Link>
              <Link
                to="/my-orders"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <MdShoppingCart className="w-5 h-5" />
                <span>ออเดอร์</span>
              </Link>
            </>
          )}

          {user?.role === "SELLER" && (
            <>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <MdShoppingCart className="w-5 h-5" />
                <span>คิวออเดอร์</span>
              </Link>
              <Link
                to="/my-store/menus"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                <IoFastFoodOutline className="w-5 h-5" />
                <span>จัดการเมนู</span>
              </Link>
            </>
          )}
        </nav>

        <Flex className="text-gray-700 mr-4" align="center" gap="4">

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-orange-50 px-3 py-2 rounded-xl transition-all duration-200"
            >
              <Box className="relative">
                <Box className="w-3 h-3 rounded-full bg-green-500 absolute border-white border-2 bottom-0 right-0 animate-pulse"></Box>
                <Avatar
                  src="/images/avatar2.png"
                  fallback={user?.username?.charAt(0).toUpperCase() || "U"}
                  size="3"
                  className="ring-2 ring-orange-200"
                />
              </Box>
              <div className="hidden md:block text-left">
                <Text className="text-sm font-semibold text-gray-800">
                  {user?.username ?? "ผู้ใช้"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {user?.role === "BUYER" && "ผู้ซื้อ"}
                  {user?.role === "SELLER" && "ผู้ขาย"}
                  {user?.role === "ADMIN" && "ผู้ดูแลระบบ"}
                </Text>
              </div>
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-visible">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email || "ไม่มีอีเมล"}</p>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 hover:bg-red-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <IoIosLogOut className="text-red-600 w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-700">ออกจากระบบ</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default NavbarMain;