// @modules/menu/menuModel.ts

import { z } from "zod";

// Payload สำหรับการสร้างและอัปเดตเมนู
export type MenuPayload = {
    name: string;
    description?: string | null;
    price: number;
    image?: string | null;
    isAvailable?: boolean;
    categoryId: string; // **สำคัญ:** เมนูต้องสังกัดหมวดหมู่
};

// Schema สำหรับการสร้างเมนู
export const CreateMenuSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Menu name is required").max(100),
        description: z.string().max(500).optional().nullable(),
        price: z.number().positive("Price must be a positive number"),
        image: z.string().url("Image must be a valid URL").optional().nullable(),
        isAvailable: z.boolean().optional().default(true),
        categoryId: z.string().cuid("A valid category ID is required"),
    }),
});

// Schema สำหรับการอัปเดตเมนู
export const UpdateMenuSchema = z.object({
    params: z.object({
        menuId: z.string().cuid("Invalid menu ID"),
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional().nullable(),
        price: z.number().positive().optional(),
        image: z.string().url().optional().nullable(),
        isAvailable: z.boolean().optional(),
        categoryId: z.string().cuid().optional(), // อาจจะอนุญาตให้ย้ายหมวดหมู่ได้
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลด้วย ID
export const MenuIdParamSchema = z.object({
    params: z.object({
        menuId: z.string().cuid("Invalid menu ID"),
    }),
});