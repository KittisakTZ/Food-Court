// @modules/auth/authModel.ts
import { z } from "zod";
import { Role } from "@prisma/client";

// Payload สำหรับ User model
export type UserPayload = {
    id?: string;
    username: string;
    password: string;
    email?: string | null;
    role?: Role;
};

// Schema สำหรับการ Login
export const LoginSchema = z.object({
    body: z.object({
        username: z.string().min(4, "Username must be at least 4 characters long"),
        password: z.string().min(4, "Password must be at least 4 characters long"),
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