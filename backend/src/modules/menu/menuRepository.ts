// @modules/menu/menuRepository.ts

import prisma from "@src/db";
import { MenuPayload } from "./menuModel";

export const menuRepository = {
    create: async (payload: MenuPayload, storeId: string) => {
        return prisma.menu.create({
            data: {
                ...payload,
                storeId: storeId, // **สำคัญ:** เมนูต้องสังกัดร้านค้าโดยตรงด้วย
            },
        });
    },

    // ค้นหาเมนูทั้งหมดของร้านค้า
    findByStoreId: async (storeId: string) => {
        return prisma.menu.findMany({
            where: { storeId: storeId },
            include: { category: true }, // ดึงข้อมูลหมวดหมู่มาด้วย
            orderBy: { name: 'asc' },
        });
    },

    // ค้นหาเมนูด้วย ID
    findById: async (menuId: string) => {
        return prisma.menu.findUnique({
            where: { id: menuId },
        });
    },

    update: async (menuId: string, payload: Partial<MenuPayload>) => {
        return prisma.menu.update({
            where: { id: menuId },
            data: payload,
        });
    },

    delete: async (menuId: string) => {
        return prisma.menu.delete({
            where: { id: menuId },
        });
    },
};