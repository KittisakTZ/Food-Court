// @modules/auth/authModel.ts
import { z } from "zod";
import { Role, Gender } from "@prisma/client";

// Payload สำหรับ User model
export type UserPayload = {
    id?: string;
    username: string;
    password: string;
    email?: string | null;
    role?: Role;
};

// Payload สำหรับ Login (รองรับ username หรือ email)
export type LoginPayload = {
    identifier: string;
    password: string;
};

// Payload สำหรับ Update Profile
export type UpdateProfilePayload = {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    gender?: Gender | null;
};

// Schema สำหรับการ Login (รองรับ username หรือ email)
export const LoginSchema = z.object({
    body: z.object({
        identifier: z.string().min(1, "กรุณากรอกชื่อผู้ใช้หรืออีเมล"),
        password: z.string().min(4, "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร"),
    }),
});

// Schema สำหรับการ Register
export const RegisterSchema = z.object({
    body: z.object({
        username: z.string().min(4).max(50),
        password: z.string().min(4).max(50),
        email: z.string().email().optional(),
        role: z.nativeEnum(Role).default(Role.BUYER), // กำหนดค่าเริ่มต้นเป็น BUYER
    }),
});

// Schema สำหรับการ Update Profile
export const UpdateProfileSchema = z.object({
    body: z.object({
        firstName: z
            .string()
            .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร")
            .regex(/^[a-zA-Zก-๙\s]*$/, "ชื่อต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น")
            .optional()
            .nullable(),
        lastName: z
            .string()
            .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร")
            .regex(/^[a-zA-Zก-๙\s]*$/, "นามสกุลต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น")
            .optional()
            .nullable(),
        phone: z
            .string()
            .regex(/^[0-9]*$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น")
            .length(10, "เบอร์โทรศัพท์ต้องมี 10 หลัก")
            .optional()
            .nullable(),
        email: z
            .string()
            .email("รูปแบบอีเมลไม่ถูกต้อง")
            .optional()
            .nullable(),
        gender: z
            .nativeEnum(Gender)
            .optional()
            .nullable(),
    }),
});