// @/features/register/index.tsx
import { useState } from "react";
import { postRegister } from "@/services/auth.service";
import { Link, useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";
import { MdRestaurant } from "react-icons/md";
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight, FiCheck } from "react-icons/fi";
import { FaStore, FaShoppingBag } from "react-icons/fa";

const ROLE_OPTIONS = [
  {
    value: "BUYER" as const,
    icon: <FaShoppingBag className="w-5 h-5" />,
    label: "Customer",
    desc: "Order food from various stores",
    accent: "orange",
  },
  {
    value: "SELLER" as const,
    icon: <FaStore className="w-5 h-5" />,
    label: "Store",
    desc: "Open a store and manage orders",
    accent: "amber",
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterFeature() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"BUYER" | "SELLER">("BUYER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordMatch = confirmPassword === "" || password === confirmPassword;

  const validateEmail = (val: string) => {
    if (val && !EMAIL_REGEX.test(val)) return "Invalid email format, e.g. name@email.com";
    return "";
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailTouched) setEmailError(validateEmail(val));
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return toastService.error("Please enter username and password");
    if (username.trim().length < 4) return toastService.error("Username must be at least 4 characters");
    if (password.length < 4) return toastService.error("Password must be at least 4 characters");
    if (confirmPassword && password !== confirmPassword) return toastService.error("Passwords do not match");
    if (email) {
      const err = validateEmail(email);
      if (err) { setEmailTouched(true); setEmailError(err); return toastService.error(err); }
    }

    setIsSubmitting(true);
    try {
      const res = await postRegister({ username: username.trim(), password, email: email || undefined, role });
      if (res.statusCode === 201) {
        toastService.success("Registration successful! Please sign in.");
        navigate("/login");
      } else {
        toastService.error(res.message || "Registration failed");
      }
    } catch (err: unknown) {
      toastService.error(
        (err as { response?: { data?: { message: string } } })?.response?.data?.message
          || "An error occurred during registration"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[380px] xl:w-[440px] flex-col justify-between bg-gradient-to-b from-orange-500 to-amber-500 p-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <MdRestaurant className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight">Food Court</span>
        </div>

        <div>
          <h2 className="text-4xl font-black text-white leading-snug mb-4">
            Get Started<br />Today, Free!
          </h2>
          <p className="text-orange-100 text-sm leading-relaxed mb-6">
            Register to access the university<br />
            food ordering system, easy and convenient
          </p>
          <div className="space-y-2.5">
            {[
              "Free registration, no cost",
              "Supports online food ordering",
              "Track orders in real-time",
            ].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-orange-100 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-white" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200/60 text-xs">© 2025 Food Court University</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6 overflow-y-auto">
        <div className="w-full max-w-[400px] py-6">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-7">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow">
              <MdRestaurant className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 font-black text-xl">Food Court</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
            <p className="text-sm text-slate-400 mt-1">Create an account to get started</p>
          </div>

          {/* Role selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  disabled={isSubmitting}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
                    role === opt.value
                      ? "border-orange-400 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/40"
                  }`}
                >
                  {role === opt.value && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <FiCheck className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <span className={role === opt.value ? "text-orange-500" : "text-slate-400"}>
                    {opt.icon}
                  </span>
                  <div className="text-center">
                    <p className={`text-sm font-bold ${role === opt.value ? "text-orange-700" : "text-slate-700"}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-tight">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3.5">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Username <span className="text-red-400 normal-case font-normal">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="At least 4 characters"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email <span className="text-slate-400 normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-3 transition-all disabled:opacity-50 ${
                    emailTouched && emailError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : emailTouched && email && !emailError
                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              {emailTouched && emailError && (
                <p className="flex items-center gap-1.5 mt-1 text-xs font-medium text-red-500">
                  <FiMail className="w-3.5 h-3.5 shrink-0" /> {emailError}
                </p>
              )}
              {emailTouched && email && !emailError && (
                <p className="flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-600">
                  <FiCheck className="w-3.5 h-3.5 shrink-0" /> Email format is valid
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password <span className="text-red-400 normal-case font-normal">*</span>
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 4 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:border-orange-400 focus:ring-3 focus:ring-orange-100 transition-all disabled:opacity-50"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Enter password again"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-xl text-slate-800 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-3 transition-all disabled:opacity-50 ${
                    !passwordMatch
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : confirmPassword && passwordMatch
                        ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                        : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }`}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {!passwordMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && passwordMatch && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <FiCheck className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !passwordMatch}
              className="w-full mt-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
              ) : (
                <>Create Account <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">Already have an account?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
          >
            Sign In
          </Link>

          <p className="text-center text-xs text-slate-400 mt-5">
            For students and stores in the university
          </p>
        </div>
      </div>
    </div>
  );
}
