// @modules/order/orderRepository.ts

import prisma from "@src/db";
import { Order, OrderItem, OrderStatus } from "@prisma/client";

// Type สำหรับข้อมูลที่จำเป็นในการสร้าง Order
type OrderCreationData = {
    buyerId: string;
    storeId: string;
    totalAmount: number;
    position: number;
    items: Array<{
        menuId: string;
        quantity: number;
        subtotal: number;
    }>;
};

export const orderRepository = {
    // ฟังก์ชันหลัก: สร้าง Order และ OrderItems ใน Transaction เดียว
    createOrderTransaction: async (data: OrderCreationData): Promise<Order & { orderItems: OrderItem[] }> => {
        return prisma.$transaction(async (tx) => {
            // 1. สร้าง Order หลัก
            const newOrder = await tx.order.create({
                data: {
                    buyerId: data.buyerId,
                    storeId: data.storeId,
                    position: data.position,
                    totalAmount: data.totalAmount,
                    // status จะเป็น PENDING โดย default
                },
            });

            // 2. เตรียมข้อมูล OrderItems
            const orderItemsData = data.items.map(item => ({
                ...item,
                orderId: newOrder.id,
            }));

            // 3. สร้าง OrderItems ทั้งหมดในครั้งเดียว
            await tx.orderItem.createMany({
                data: orderItemsData,
            });
            
            // 4. ดึงข้อมูล Order ที่สมบูรณ์พร้อม Items กลับไป
            const completeOrder = await tx.order.findUniqueOrThrow({
                where: { id: newOrder.id },
                include: { orderItems: true }
            });

            return completeOrder;
        });
    },

    // ดึงประวัติการสั่งซื้อของ Buyer
    findOrdersByBuyerId: async (buyerId: string, page: number, pageSize: number) => {
        const skip = (page - 1) * pageSize;
        return prisma.order.findMany({
            where: { buyerId: buyerId },
            skip: skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: { store: true, orderItems: { include: { menu: true } } }
        });
    },
    countOrdersByBuyerId: (buyerId: string) => prisma.order.count({ where: { buyerId } }),

    // ดึงรายการสั่งซื้อของร้านค้า (สำหรับ Seller)
    findOrdersByStoreId: async (storeId: string, page: number, pageSize: number) => {
        const skip = (page - 1) * pageSize;
        return prisma.order.findMany({
            where: { storeId: storeId },
            skip: skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: { buyer: { select: { username: true } }, orderItems: { include: { menu: true } } }
        });
    },
    countOrdersByStoreId: (storeId: string) => prisma.order.count({ where: { storeId } }),
    
    // ค้นหา Order ด้วย ID
    findOrderById: async (orderId: string) => {
        return prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        });
    },
    
    // อัปเดตสถานะ Order
    updateOrder: async (orderId: string, data: Partial<Order>) => {
        return prisma.order.update({
            where: { id: orderId },
            data: data
        });
    }
};