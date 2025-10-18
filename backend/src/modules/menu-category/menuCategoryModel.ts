// @modules/menu-category/menuCategoryModel.ts

import { z } from "zod";

// Payload สำหรับการสร้างและอัปเดต
export type MenuCategoryPayload = {
    name: string;
};

// Schema สำหรับการสร้างหมวดหมู่
export const CreateMenuCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required").max(50),
    }),
});

// Schema สำหรับการอัปเดตหมวดหมู่
export const UpdateMenuCategorySchema = z.object({
    params: z.object({
        categoryId: z.string().cuid("Invalid category ID"),
    }),
    body: z.object({
        name: z.string().min(1, "Category name is required").max(50),
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลด้วย ID
export const MenuCategoryIdParamSchema = z.object({
    params: z.object({
        categoryId: z.string().cuid("Invalid category ID"),
    }),
});