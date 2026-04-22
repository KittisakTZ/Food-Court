// @modules/menu-category/menuCategoryModel.ts

import { z } from "zod";

export type MenuType = "MAIN" | "DRINK" | "DESSERT" | "SNACK" | "OTHER";

// Default cooking times (minutes) per menu type
export const MENU_TYPE_DEFAULT_COOKING_TIME: Record<MenuType, number> = {
    MAIN:    7,
    DRINK:   2,
    DESSERT: 4,
    SNACK:   3,
    OTHER:   5,
};

const menuTypeEnum = z.enum(["MAIN", "DRINK", "DESSERT", "SNACK", "OTHER"]);

// Payload สำหรับการสร้างและอัปเดต
export type MenuCategoryPayload = {
    name: string;
    menuType: MenuType;
};

// Schema สำหรับการสร้างหมวดหมู่
export const CreateMenuCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required").max(50),
        menuType: menuTypeEnum.optional().default("OTHER"),
    }),
});

// Schema สำหรับการอัปเดตหมวดหมู่
export const UpdateMenuCategorySchema = z.object({
    params: z.object({
        categoryId: z.string().cuid("Invalid category ID"),
    }),
    body: z.object({
        name: z.string().min(1, "Category name is required").max(50),
        menuType: menuTypeEnum.optional(),
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลด้วย ID
export const MenuCategoryIdParamSchema = z.object({
    params: z.object({
        categoryId: z.string().cuid("Invalid category ID"),
    }),
});