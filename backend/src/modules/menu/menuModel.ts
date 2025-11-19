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
        price: z.coerce.number().positive("Price must be a positive number"), // ใช้ coerce
        isAvailable: z.coerce.boolean().optional().default(true), // ใช้ coerce
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
        price: z.coerce.number().positive().optional(), // ใช้ coerce
        isAvailable: z.coerce.boolean().optional(),   // ใช้ coerce
        categoryId: z.string().cuid().optional(), // อาจจะอนุญาตให้ย้ายหมวดหมู่ได้
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลด้วย ID
export const MenuIdParamSchema = z.object({
    params: z.object({
        menuId: z.string().cuid("Invalid menu ID"),
    }),
});

// (ใหม่) Schema สำหรับการดึงข้อมูลเมนูแบบมี Pagination
export const GetMenusQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
        searchText: z.string().optional(),
        categoryId: z.string().optional(),
    }),
});