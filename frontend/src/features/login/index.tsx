// @/pages/login/index.tsx
import { useEffect, useState } from "react";
import { postLogin, getMe } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/useAuthStore";
import { toastService } from "@/services/toast.service";
import { MdRestaurant, MdLogin } from "react-icons/md";
import { FiUser, FiLock } from "react-icons/fi";

export default function LoginFeature() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) {
      return toastService.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    }

    setIsSubmitting(true);
    try {
      const loginResponse = await postLogin({ username, password });
      if (loginResponse.statusCode === 200) {
        const userResponse = await getMe();
        if (userResponse.responseObject) {
          setUser(userResponse.responseObject);
          toastService.success("เข้าสู่ระบบสำเร็จ!");
          navigate("/");
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
      } else {
        toastService.error(loginResponse.message || "เกิดข้อผิดพลาด");
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        console.error("Error logging in:", error);
        toastService.error(
          (error as { response?: { data?: { message: string } } }).response
            ?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
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

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-center">
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <MdLogin className="w-8 h-8" />
              เข้าสู่ระบบ
            </h2>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <MdLogin className="w-6 h-6" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                ยังไม่มีบัญชี?{" "}
                <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white text-sm">
            🍔 สั่งอาหารง่ายๆ ได้ทุกที่ทุกเวลา 🍕
          </p>
        </div>
      </div>
    </div>
  );
}