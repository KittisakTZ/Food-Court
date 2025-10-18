// @modules/menu/menuRepository.ts

import prisma from "@src/db";
import { MenuPayload } from "./menuModel";
import { Prisma } from "@prisma/client";

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
    findByStoreId: async (storeId: string, page: number, pageSize: number, searchText?: string) => {
        const skip = (page - 1) * pageSize;

        // สร้างเงื่อนไขการค้นหา
        const whereClause: Prisma.MenuWhereInput = {
            storeId: storeId,
            ...(searchText && {
                name: {
                    contains: searchText,
                    mode: 'insensitive',
                }
            })
        };

        return prisma.menu.findMany({
            where: whereClause,
            skip: skip,
            take: pageSize,
            include: { category: true },
            orderBy: { name: 'asc' },
        });
    },

    // (ใหม่) นับจำนวนเมนูทั้งหมดในร้านค้า (สำหรับ Pagination)
    countByStoreId: async (storeId: string, searchText?: string) => {
        // สร้างเงื่อนไขการค้นหา (ต้องเหมือนกับ findByStoreId)
        const whereClause: Prisma.MenuWhereInput = {
            storeId: storeId,
            ...(searchText && {
                name: {
                    contains: searchText,
                    mode: 'insensitive',
                }
            })
        };

        return prisma.menu.count({
            where: whereClause,
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