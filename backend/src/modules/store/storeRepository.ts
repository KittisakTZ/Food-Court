// @modules/store/storeRepository.ts

import prisma from "@src/db";
import { StorePayload } from "./storeModel";

export const storeRepository = {
    // สร้างร้านค้าใหม่ โดยต้องระบุ ownerId (มาจาก token ของผู้ใช้ที่ login)
    create: async (payload: StorePayload, ownerId: string) => {
        return prisma.store.create({
            data: {
                ...payload,
                ownerId: ownerId, // เชื่อมความสัมพันธ์กับ User ที่เป็นเจ้าของ
            },
        });
    },

    countPublic: async () => {
        return prisma.store.count({
            where: { isApproved: true },
        });
    },

    findAllPublic: async (page: number, pageSize: number) => {
        const skip = (page - 1) * pageSize;
        return prisma.store.findMany({
            skip: skip,
            take: pageSize,
            where: { isApproved: true }, // Logic เดิม
            orderBy: { name: 'asc' },   // เรียงตามชื่อ
            include: { owner: { select: { id: true, username: true } } }
        });
    },

    // (ใหม่) ฟังก์ชันสำหรับ Admin: ดึงร้านค้าทั้งหมดโดยไม่มีเงื่อนไข
    findAllAdmin: async () => {
        return prisma.store.findMany({
            orderBy: { createdAt: 'desc' }, // เรียงจากใหม่ไปเก่าเพื่อให้ร้านที่รออนุมัติอยู่บนๆ
            include: { owner: { select: { id: true, username: true } } }
        });
    },

    // (ใหม่) ฟังก์ชันสำหรับ Admin: ดึงเฉพาะร้านที่รอการอนุมัติ
    findPendingApproval: async () => {
        return prisma.store.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: 'asc' }, // เรียงจากเก่าไปใหม่เพื่อให้ Admin อนุมัติตามคิว
            include: { owner: { select: { id: true, username: true } } }
        });
    },

    // ค้นหาร้านค้าด้วย ID
    findById: async (storeId: string) => {
        return prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: true } // ดึงข้อมูลเจ้าของมาด้วยเพื่อใช้ตรวจสอบสิทธิ์
        });
    },

    // ค้นหาร้านค้าด้วยชื่อ (เพื่อป้องกันชื่อซ้ำ)
    findByName: async (name: string) => {
        return prisma.store.findUnique({
            where: { name: name },
        });
    },

    // ค้นหาร้านค้าด้วย ownerId
    findByOwnerId: async (ownerId: string) => {
        return prisma.store.findUnique({
            where: { ownerId: ownerId },
            include: {
                // ตัวอย่างการดึงข้อมูลที่เกี่ยวข้องเผื่อไว้สำหรับหน้า Dashboard
                _count: {
                    select: {
                        menus: true,
                        orders: true,
                        reviews: true,
                    }
                },
                categories: {
                    orderBy: { name: 'asc' }
                }
            }
        });
    },

    // อัปเดตข้อมูลร้านค้า
    update: async (storeId: string, payload: Partial<StorePayload & { isApproved: boolean }>) => {
        return prisma.store.update({
            where: { id: storeId },
            data: payload,
        });
    },

    // ลบร้านค้า
    delete: async (storeId: string) => {
        return prisma.store.delete({
            where: { id: storeId },
        });
    },
};