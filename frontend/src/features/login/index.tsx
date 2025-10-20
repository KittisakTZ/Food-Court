// @/pages/login/index.tsx
import { useEffect, useState } from "react";
import { postLogin, getAuthStatus, getMe } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/useAuthStore";
import { toastService } from "@/services/toast.service";

export default function LoginFeature() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore(); // ดึง action และ state จาก store


  // Redirect ถ้า login อยู่แล้ว
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);


  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username || !password) return toastService.error("Please enter username and password.");

    try {
      const loginResponse = await postLogin({ username, password });
      if (loginResponse.statusCode === 200) {
        // Login สำเร็จ, ดึงข้อมูล user ต่อ
        const userResponse = await getMe();
        if (userResponse.responseObject) {
          setUser(userResponse.responseObject); // บันทึกข้อมูล user ลง store
          navigate("/"); // ไปยังหน้า Home
        } else {
          throw new Error("Failed to fetch user profile after login.");
        }
      } else {
        toastService.error(loginResponse.message || "An unexpected error occurred");
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      toastService.error(error.response?.data?.message || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/images/bg-login.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo.png"
            alt="logo-main-website"
            className="h-12"
          />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </button>
        </form>

        {/* เพิ่ม Link ไปหน้า Register */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Sign up now
          </Link>
        </p>

      </div>
    </div>
  );
}