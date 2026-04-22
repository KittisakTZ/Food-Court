// @modules/menu-category/menuCategoryRepository.ts

import prisma from "@src/db";
import { MenuCategoryPayload } from "./menuCategoryModel";

export const menuCategoryRepository = {
    create: async (payload: MenuCategoryPayload, storeId: string) => {
        return (prisma.menuCategory.create as any)({
            data: {
                name: payload.name,
                menuType: payload.menuType,
                storeId: storeId,
            },
        });
    },

    // ค้นหาหมวดหมู่ทั้งหมดของร้านค้า
    findByStoreId: async (storeId: string) => {
        return prisma.menuCategory.findMany({
            where: { storeId: storeId },
            orderBy: { name: 'asc' },
        });
    },

    // ค้นหาหมวดหมู่ด้วย ID
    findById: async (categoryId: string) => {
        return prisma.menuCategory.findUnique({
            where: { id: categoryId },
        });
    },
    
    // ค้นหาด้วยชื่อและรหัสร้านค้า (ป้องกันชื่อซ้ำในร้านเดียวกัน)
    findByNameAndStore: async (name: string, storeId: string) => {
        return prisma.menuCategory.findFirst({
            where: {
                name: name,
                storeId: storeId,
            }
        })
    },

    update: async (categoryId: string, payload: Partial<MenuCategoryPayload>) => {
        return (prisma.menuCategory.update as any)({
            where: { id: categoryId },
            data: {
                ...(payload.name !== undefined && { name: payload.name }),
                ...(payload.menuType !== undefined && { menuType: payload.menuType }),
            },
        });
    },

    delete: async (categoryId: string) => {
        return prisma.menuCategory.delete({
            where: { id: categoryId },
        });
    },
    
    // ตรวจสอบว่ามีเมนูอยู่ในหมวดหมู่นี้หรือไม่ ก่อนที่จะลบ
    countMenusInCategory: async (categoryId: string) => {
        return prisma.menu.count({
            where: { categoryId: categoryId },
        });
    }
};