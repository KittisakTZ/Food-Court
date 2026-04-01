// @/features/edit-profile/index.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/zustand/useAuthStore";
import { putUpdateProfile } from "@/services/auth.service";
import { toastService } from "@/services/toast.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiUser, FiMail, FiPhone, FiSave, FiArrowLeft,
  FiAlertCircle, FiCheckCircle, FiInfo, FiShield,
} from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────
type Gender = "MALE" | "FEMALE" | "NOT_SPECIFIED";
type FormValues = { firstName: string; lastName: string; phone: string; email: string; gender: Gender | "" };
type FieldErrors = Partial<Record<keyof FormValues, string>>;

// ─── Regex ───────────────────────────────────────────────
const NAME_REGEX  = /^[a-zA-Zก-๙\s]*$/;
const PHONE_REGEX = /^[0-9]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(field: keyof FormValues, value: string): string | undefined {
  switch (field) {
    case "firstName":
    case "lastName":
      if (value && !NAME_REGEX.test(value))  return "ใช้ตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น ห้ามตัวเลขและอักขระพิเศษ";
      if (value.length > 50)                  return "ไม่เกิน 50 ตัวอักษร";
      break;
    case "phone":
      if (value && !PHONE_REGEX.test(value))  return "กรอกตัวเลขเท่านั้น";
      if (value && value.length !== 10)        return "ต้องมี 10 หลักพอดี";
      break;
    case "email":
      if (value && !EMAIL_REGEX.test(value))  return "รูปแบบอีเมลไม่ถูกต้อง เช่น name@email.com";
      break;
  }
}

function validateAll(values: FormValues): FieldErrors {
  const out: FieldErrors = {};
  (Object.keys(values) as (keyof FormValues)[]).forEach(k => {
    const e = validateField(k, values[k]);
    if (e) out[k] = e;
  });
  return out;
}

// ─── FieldStatus ─────────────────────────────────────────
// แสดงสถานะ: hint (ยังไม่ได้แตะ / ไม่มีค่า) | error | success (แตะแล้ว มีค่า ไม่ error)
function FieldStatus({
  touched, error, value, hint, successText,
}: {
  touched?: boolean; error?: string; value: string; hint: string; successText: string;
}) {
  if (!touched) {
    return <Hint text={hint} />;
  }
  if (error) {
    return (
      <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
      </p>
    );
  }
  if (value.trim()) {
    return (
      <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-emerald-500">
        <FiCheckCircle className="w-3.5 h-3.5 shrink-0" /> {successText}
      </p>
    );
  }
  // touched แต่ว่าง → ยังแสดง hint ตามปกติ
  return <Hint text={hint} />;
}

// ─── Role display ─────────────────────────────────────────
const ROLE_LABEL: Record<string, string> = { BUYER: "ผู้ซื้อ", SELLER: "ผู้ขาย", ADMIN: "ผู้ดูแลระบบ" };
const ROLE_GRADIENT: Record<string, string> = {
  BUYER:  "from-orange-400 to-amber-400",
  SELLER: "from-emerald-400 to-teal-500",
  ADMIN:  "from-violet-500 to-purple-500",
};

// ─── Main Component ───────────────────────────────────────
export default function EditProfileFeature() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<FormValues>({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    phone:     user?.phone     ?? "",
    email:     user?.email     ?? "",
    gender:    (user?.gender as Gender) ?? "",
  });

  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setValues({
        firstName: user.firstName ?? "",
        lastName:  user.lastName  ?? "",
        phone:     user.phone     ?? "",
        email:     user.email     ?? "",
        gender:    (user.gender as Gender) ?? "",
      });
    }
  }, [user]);

  const handleChange = useCallback((field: keyof FormValues, raw: string) => {
    if ((field === "firstName" || field === "lastName") && !NAME_REGEX.test(raw)) return;
    if (field === "phone") {
      if (!PHONE_REGEX.test(raw)) return;
      if (raw.length > 10) return;
    }
    setValues(p => ({ ...p, [field]: raw }));
    if (touched[field]) {
      setErrors(p => ({ ...p, [field]: validateField(field, raw) }));
    }
  }, [touched]);

  const handleBlur = useCallback((field: keyof FormValues) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(p => ({ ...p, [field]: validateField(field, values[field]) }));
  }, [values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.fromEntries((Object.keys(values) as (keyof FormValues)[]).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validateAll(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toastService.error("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง"); return; }

    setIsSubmitting(true);
    try {
      const res = await putUpdateProfile({
        firstName: values.firstName || null,
        lastName:  values.lastName  || null,
        phone:     values.phone     || null,
        email:     values.email     || null,
        gender:    (values.gender as Gender) || null,
      });
      if (res.statusCode === 200 && res.responseObject) {
        setUser(res.responseObject);
        queryClient.invalidateQueries({ queryKey: ["me"] });
        toastService.success("อัปเดตโปรไฟล์สำเร็จ");
        navigate("/");
      } else {
        toastService.error(res.message || "เกิดข้อผิดพลาด");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toastService.error(e?.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Input style ──────────────────────────────────────
  const base = "w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 bg-white";
  const cls = (field: keyof FormValues) => {
    if (touched[field] && errors[field])
      return `${base} border-red-300 ring-2 ring-red-100 text-gray-700`;
    if (touched[field] && !errors[field] && values[field].trim())
      return `${base} border-emerald-300 ring-2 ring-emerald-100 text-gray-700`;
    return `${base} border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-gray-700`;
  };

  const role     = user?.role ?? "BUYER";
  const gradient = ROLE_GRADIENT[role] ?? ROLE_GRADIENT.BUYER;
  const initial  = user?.username?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-gray-50/60 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
        >
          <span className="w-7 h-7 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:border-orange-300">
            <FiArrowLeft className="w-3.5 h-3.5" />
          </span>
          ย้อนกลับ
        </button>

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* banner */}
          <div className={`h-20 bg-gradient-to-r ${gradient}`} />
          {/* avatar + name */}
          <div className="px-5 pb-4">
            <div className="flex items-end gap-3 -mt-8 mb-3">
              <div className={`w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br ${gradient}
                flex items-center justify-center text-white text-2xl font-bold
                border-4 border-white shadow-md`}>
                {initial}
              </div>
              <div className="pb-0.5">
                <p className="font-bold text-gray-800 text-base leading-tight">{user?.username}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  bg-gradient-to-r ${gradient} text-white`}>
                  {ROLE_LABEL[role]}
                </span>
              </div>
            </div>

            {/* quick info pills */}
            <div className="flex flex-wrap gap-1.5">
              {values.firstName && (
                <Pill icon={<FiUser className="w-3 h-3" />} text={[values.firstName, values.lastName].filter(Boolean).join(" ")} />
              )}
              {values.email && <Pill icon={<FiMail className="w-3 h-3" />} text={values.email} />}
              {values.phone && <Pill icon={<FiPhone className="w-3 h-3" />} text={values.phone} />}
              {!values.firstName && !values.email && !values.phone && (
                <p className="text-xs text-gray-400 italic">ยังไม่ได้กรอกข้อมูล</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Hint Banner ── */}
        <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <FiShield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            <span className="font-semibold">กฎการกรอก:</span>{" "}
            ชื่อ-นามสกุลใช้ตัวอักษรเท่านั้น · เบอร์โทรตัวเลข 10 หลัก · อีเมลรูปแบบ name@domain.com · ทุกช่องไม่บังคับ
          </p>
        </div>

        {/* ── Form Card ── */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">

            {/* Section: ชื่อ-นามสกุล */}
            <Section title="ชื่อ-นามสกุล">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="ชื่อ">
                  <InputWrapper icon={<FiUser />}>
                    <input
                      type="text" placeholder="ชื่อจริง"
                      value={values.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      className={cls("firstName")}
                      disabled={isSubmitting} maxLength={50}
                    />
                  </InputWrapper>
                  <FieldStatus
                    touched={touched.firstName} error={errors.firstName}
                    value={values.firstName} successText="ถูกต้อง"
                    hint="ภาษาไทยหรืออังกฤษเท่านั้น"
                  />
                </Field>

                <Field label="นามสกุล">
                  <InputWrapper icon={<FiUser />}>
                    <input
                      type="text" placeholder="นามสกุล"
                      value={values.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      className={cls("lastName")}
                      disabled={isSubmitting} maxLength={50}
                    />
                  </InputWrapper>
                  <FieldStatus
                    touched={touched.lastName} error={errors.lastName}
                    value={values.lastName} successText="ถูกต้อง"
                    hint="ภาษาไทยหรืออังกฤษเท่านั้น"
                  />
                </Field>
              </div>
            </Section>

            {/* Section: ติดต่อ */}
            <Section title="ข้อมูลติดต่อ">
              <Field label="เบอร์โทรศัพท์">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FiPhone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel" placeholder="0812345678"
                    value={values.phone}
                    onChange={e => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`${cls("phone")} pr-12`}
                    disabled={isSubmitting} maxLength={10} inputMode="numeric"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums pointer-events-none
                    ${values.phone.length === 10 ? "text-emerald-500" : values.phone.length > 0 ? "text-orange-400" : "text-gray-300"}`}>
                    {values.phone.length}/10
                  </span>
                </div>
                <FieldStatus
                  touched={touched.phone} error={errors.phone}
                  value={values.phone} successText="ครบ 10 หลัก"
                  hint="ตัวเลขเท่านั้น ระบบบล็อกตัวอักษรอัตโนมัติ"
                />
              </Field>

              <Field label="อีเมล" className="mt-3">
                <InputWrapper icon={<FiMail />}>
                  <input
                    type="text" placeholder="example@email.com"
                    value={values.email}
                    onChange={e => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={cls("email")}
                    disabled={isSubmitting}
                  />
                </InputWrapper>
                <FieldStatus
                  touched={touched.email} error={errors.email}
                  value={values.email} successText="รูปแบบถูกต้อง"
                  hint="เช่น student@university.ac.th"
                />
              </Field>
            </Section>

            {/* Section: เพศ */}
            <Section title="เพศ">
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { value: "MALE",          label: "ชาย",    emoji: "👨" },
                    { value: "FEMALE",        label: "หญิง",   emoji: "👩" },
                    { value: "NOT_SPECIFIED", label: "ไม่ระบุ", emoji: "🧑" },
                  ] as { value: Gender; label: string; emoji: string }[]
                ).map(opt => {
                  const active = values.gender === opt.value;
                  return (
                    <label key={opt.value}
                      className={`relative flex flex-col items-center gap-1 py-3.5 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 select-none
                        ${active ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-gray-50 hover:border-orange-200"}
                        ${isSubmitting ? "opacity-40 pointer-events-none" : ""}`}
                    >
                      <input type="radio" name="gender" value={opt.value}
                        checked={active}
                        onChange={() => setValues(p => ({ ...p, gender: opt.value }))}
                        className="sr-only" disabled={isSubmitting}
                      />
                      <span className="text-2xl leading-none">{opt.emoji}</span>
                      <span className={`text-xs font-semibold ${active ? "text-orange-600" : "text-gray-500"}`}>
                        {opt.label}
                      </span>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <Hint text="เลือกหรือไม่เลือกก็ได้" />
            </Section>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit" disabled={isSubmitting}
            className="mt-4 w-full py-3.5 rounded-2xl text-sm font-bold text-white
              bg-gradient-to-r from-orange-500 to-amber-500
              hover:from-orange-600 hover:to-amber-600
              disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
              shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200
              active:scale-[0.985] transition-all duration-200
              flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                บันทึกโปรไฟล์
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            ข้อมูลของคุณจะถูกเก็บไว้อย่างปลอดภัย
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InputWrapper({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
      <span className="text-gray-400">{icon}</span>
      {text}
    </span>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
      <FiInfo className="w-3 h-3 shrink-0" /> {text}
    </p>
  );
}
