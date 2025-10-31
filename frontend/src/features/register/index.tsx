// @/pages/register/index.tsx
import { useState } from "react";
import { postRegister } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";
import { MdRestaurant } from "react-icons/md";
import { FiUser, FiLock, FiMail, FiUserPlus } from "react-icons/fi";
import { FaStore, FaShoppingBag } from "react-icons/fa";

export default function RegisterFeature() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      return toastService.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    }

    setIsSubmitting(true);
    try {
      const response = await postRegister({ username, password, email, role });
      if (response.statusCode === 201) {
        toastService.success("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        navigate("/login");
      } else {
        toastService.error(response.message || "การสมัครสมาชิกล้มเหลว");
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        console.error("Error registering:", error);
        toastService.error(
          (error as { response?: { data?: { message: string } } }).response
            ?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <MdRestaurant className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ระบบจองอาหาร</h1>
          <p className="text-orange-100 text-lg">มหาวิทยาลัย</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-center">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <FiUserPlus className="w-8 h-8" />
              สมัครสมาชิก
            </h2>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-5">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                อีเมล <span className="text-gray-400 text-xs">(ไม่บังคับ)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="กรอกอีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ประเภทผู้ใช้ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Buyer Option */}
                <label className={`relative flex flex-col items-center cursor-pointer p-4 border-2 rounded-xl transition-all ${
                  role === "BUYER" 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-gray-200 hover:border-orange-300 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="BUYER"
                    checked={role === "BUYER"}
                    onChange={() => setRole("BUYER")}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <FaShoppingBag className={`w-8 h-8 mb-2 ${
                    role === "BUYER" ? "text-orange-500" : "text-gray-400"
                  }`} />
                  <span className={`font-semibold ${
                    role === "BUYER" ? "text-orange-600" : "text-gray-700"
                  }`}>
                    ผู้ซื้อ
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    สั่งอาหาร
                  </span>
                  {role === "BUYER" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>

                {/* Seller Option */}
                <label className={`relative flex flex-col items-center cursor-pointer p-4 border-2 rounded-xl transition-all ${
                  role === "SELLER" 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-gray-200 hover:border-orange-300 bg-white"
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="SELLER"
                    checked={role === "SELLER"}
                    onChange={() => setRole("SELLER")}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <FaStore className={`w-8 h-8 mb-2 ${
                    role === "SELLER" ? "text-orange-500" : "text-gray-400"
                  }`} />
                  <span className={`font-semibold ${
                    role === "SELLER" ? "text-orange-600" : "text-gray-700"
                  }`}>
                    ผู้ขาย
                  </span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    เปิดร้านค้า
                  </span>
                  {role === "SELLER" && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                <>
                  <FiUserPlus className="w-6 h-6" />
                  สมัครสมาชิก
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                มีบัญชีอยู่แล้ว?{" "}
                <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white text-sm">
            🎓 สำหรับนักศึกษาและร้านค้าในมหาวิทยาลัย 🍽️
          </p>
        </div>
      </div>
    </div>
  );
}
