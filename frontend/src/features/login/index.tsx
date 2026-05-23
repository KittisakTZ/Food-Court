// @/features/login/index.tsx
import { useEffect, useState } from "react";
import { postLogin, getMe } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/useAuthStore";
import { toastService } from "@/services/toast.service";
import { MdRestaurant } from "react-icons/md";
import { FiAtSign, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

// Role hint badge ด้านล่างสำหรับแสดงว่า login ได้ทุก role
const RoleBadge = ({ icon, label, color }: { icon: string; label: string; color: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
    {icon} {label}
  </span>
);

export default function LoginFeature() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return toastService.error("กรุณากรอกข้อมูลให้ครบ");

    setIsSubmitting(true);
    try {
      const res = await postLogin({ identifier: identifier.trim(), password });
      if (res.statusCode === 200) {
        const me = await getMe();
        if (me.responseObject) {
          setUser(me.responseObject);
          toastService.success("เข้าสู่ระบบสำเร็จ!");
          navigate("/");
        } else throw new Error();
      } else {
        toastService.error(res.message || "เกิดข้อผิดพลาด");
      }
    } catch (err: unknown) {
      toastService.error(
        (err as { response?: { data?: { message: string } } })?.response?.data?.message
          || "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-gradient-to-b from-orange-500 to-amber-500 p-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <MdRestaurant className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Food Court</span>
        </div>

        <div>
          <h2 className="text-4xl font-black text-white leading-snug mb-4">
            สั่งอาหาร<br />ง่าย · เร็ว · ทั่วถึง
          </h2>
          <p className="text-orange-100 text-sm leading-relaxed mb-8">
            ระบบจองอาหารออนไลน์สำหรับมหาวิทยาลัย<br />
            รองรับลูกค้าและร้านค้าทุกประเภท
          </p>
          <div className="flex flex-wrap gap-2">
            <RoleBadge icon="🛍️" label="ลูกค้า" color="bg-white/20 text-white" />
            <RoleBadge icon="🏪" label="ร้านค้า" color="bg-white/20 text-white" />
          </div>
        </div>

        <p className="text-orange-200/60 text-xs">© 2025 Food Court University</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
              <MdRestaurant className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 font-black text-xl">Food Court</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-800">เข้าสู่ระบบ</h1>
            <p className="text-sm text-slate-400 mt-1">เข้าสู่ระบบด้วยชื่อผู้ใช้หรืออีเมล</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Identifier */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                ชื่อผู้ใช้หรืออีเมล
              </label>
              <div className="relative">
                <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="username หรือ email@example.com"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                รหัสผ่าน
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังเข้าสู่ระบบ...</>
              ) : (
                <>เข้าสู่ระบบ <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">หรือ</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            สมัครสมาชิกใหม่
          </Link>

          <p className="text-center text-xs text-slate-400 mt-5">
            สำหรับนักศึกษาและร้านค้าในมหาวิทยาลัย
          </p>
        </div>
      </div>
    </div>
  );
}
