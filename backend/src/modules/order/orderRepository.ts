// @modules/order/orderRepository.ts

import prisma from "@src/db";
import { Order, OrderItem, OrderStatus, Prisma, PaymentMethod } from "@prisma/client";

// Type สำหรับข้อมูลที่จำเป็นในการสร้าง Order
type OrderCreationData = {
    buyerId: string;
    storeId: string;
    totalAmount: number;
    position: number;
    scheduledPickup?: Date | null;
    queueNumber: number;
    orderDate: Date;
    paymentMethod: PaymentMethod;
    description?: string;
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
                    scheduledPickup: data.scheduledPickup,
                    queueNumber: data.queueNumber,
                    orderDate: data.orderDate,
                    paymentMethod: data.paymentMethod,
                    description: data.description,
                },
            });

            // 2. เตรียมข้อมูล OrderItems
            const orderItemsData = data.items.map(item => ({
                ...item,
                orderId: newOrder.id,
                storeId: newOrder.storeId,
            }));

            // 3. สร้าง OrderItems ทั้งหมดในครั้งเดียว
            await tx.orderItem.createMany({
                data: orderItemsData,
            });

            // 4. ดึงข้อมูล Order ที่สมบูรณ์พร้อม Items กลับไป
            const completeOrder = await tx.order.findUniqueOrThrow({
                where: {
                    id: newOrder.id
                },
                include: {
                    orderItems: {
                        include: {
                            menu: true
                        }
                    }
                }
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
    findOrdersByStoreId: async (storeId: string, page: number, pageSize: number, filterStatus?: OrderStatus[]) => {
        const skip = (page - 1) * pageSize;

        const whereClause: Prisma.OrderWhereInput = {
            storeId: storeId,
            // ถ้ามี filterStatus ส่งเข้ามา ให้ใช้เงื่อนไข in
            ...(filterStatus && filterStatus.length > 0 && {
                status: { in: filterStatus }
            })
        };

        return prisma.order.findMany({
            where: whereClause,
            skip: skip,
            take: pageSize,
            // ถ้าไม่มี filter (ดูประวัติ) ให้เรียงตามเวลา
            // ถ้ามี filter (ดูคิว) ให้เรียงตาม position
            orderBy: filterStatus ? { position: 'asc' } : { createdAt: 'desc' },
            include: { store: true, buyer: { select: { username: true } }, orderItems: { include: { menu: true } } }
        });
    },

    countOrdersByStoreId: (storeId: string, filterStatus?: OrderStatus[]) => {
        const whereClause: Prisma.OrderWhereInput = {
            storeId: storeId,
            ...(filterStatus && filterStatus.length > 0 && {
                status: { in: filterStatus }
            })
        };
        return prisma.order.count({ where: whereClause });
    },

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
    },

    // (ใหม่) หาค่า position ที่มากที่สุดในร้านค้า
    findMaxPositionInStore: async (storeId: string) => {
        const result = await prisma.order.aggregate({
            _max: {
                position: true,
            },
            where: {
                storeId: storeId,
            },
        });
        return result._max.position || 0; // ถ้ายังไม่มีเลย ให้เริ่มที่ 0
    },

    // (ใหม่) อัปเดต position ของหลายๆ Order ใน Transaction เดียว
    updateOrderPositions: async (updates: Array<{ id: string; position: number }>) => {
        return prisma.$transaction(
            updates.map(update =>
                prisma.order.update({
                    where: { id: update.id },
                    data: { position: update.position },
                })
            )
        );
    },

    // (ใหม่) ย้ายตำแหน่ง Order และขยับตำแหน่งอื่นๆ ทั้งหมดใน Transaction
    moveOrderPosition: async (storeId: string, orderToMoveId: string, newPosition: number) => {
        return prisma.$transaction(async (tx) => {
            // 1. หาตำแหน่งปัจจุบันของออเดอร์ที่จะย้าย
            const orderToMove = await tx.order.findUniqueOrThrow({
                where: { id: orderToMoveId },
                select: { position: true }
            });
            const oldPosition = orderToMove.position;

            if (oldPosition === newPosition) {
                return; // ไม่ต้องทำอะไรถ้าตำแหน่งไม่เปลี่ยนแปลง
            }

            // 2. ขยับออเดอร์อื่นๆ
            if (oldPosition < newPosition) {
                // ถ้าเลื่อนลง (เช่น จาก 2 ไป 5)
                // ออเดอร์ที่อยู่ระหว่าง 3-5 ต้องถูกขยับขึ้น (position - 1)
                await tx.order.updateMany({
                    where: {
                        storeId: storeId,
                        position: {
                            gt: oldPosition,
                            lte: newPosition
                        }
                    },
                    data: { position: { decrement: 1 } }
                });
            } else { // oldPosition > newPosition
                // ถ้าเลื่อนขึ้น (เช่น จาก 5 ไป 2)
                // ออเดอร์ที่อยู่ระหว่าง 2-4 ต้องถูกขยับลง (position + 1)
                await tx.order.updateMany({
                    where: {
                        storeId: storeId,
                        position: {
                            gte: newPosition,
                            lt: oldPosition
                        }
                    },
                    data: { position: { increment: 1 } }
                });
            }

            // 3. อัปเดตตำแหน่งของออเดอร์เป้าหมาย
            await tx.order.update({
                where: { id: orderToMoveId },
                data: { position: newPosition }
            });
        });
    },

    getNextDailyQueueNumber: async (storeId: string) => {
        // ✨ FIX 1: สร้างวันที่โดยคำนึงถึง Timezone (ตัวอย่างสำหรับประเทศไทย GMT+7) ✨
        // วิธีนี้จะช่วยให้แน่ใจว่า "วันนี้" คือ "วันนี้" ของประเทศไทยจริงๆ
        const nowInThailand = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));

        // 2. สร้างวันที่เริ่มต้น (เที่ยงคืน) และสิ้นสุด (สุดท้ายของวัน) ของ "วันนี้"
        const startOfDay = new Date(nowInThailand);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(nowInThailand);
        endOfDay.setHours(23, 59, 59, 999);

        // 3. หา Order ที่มี "หมายเลขคิว" สูงสุดของ "วันนี้"
        // โดยใช้เงื่อนไข "ระหว่าง" (between) ซึ่งแม่นยำกว่า
        const latestOrderOfToday = await prisma.order.findFirst({
            where: {
                storeId: storeId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: {
                queueNumber: 'desc',
            },
            select: {
                queueNumber: true
            }
        });

        // 4. หา position สูงสุดที่มีอยู่ทั้งหมด (ส่วนนี้ยังเหมือนเดิม)
        const maxPositionResult = await prisma.order.aggregate({
            _max: { position: true },
            where: { storeId: storeId },
        });

        // 5. คำนวณคิวถัดไป
        const nextQueueNumber = latestOrderOfToday ? latestOrderOfToday.queueNumber + 1 : 1;
        const maxPosition = maxPositionResult._max.position || 0;

        return {
            nextQueueNumber,
            // ✨ FIX 3: ส่ง `startOfDay` กลับไปเพื่อบันทึกลง `orderDate` ✨
            // เพื่อให้ทุกออเดอร์ของวันเดียวกันมีค่า `orderDate` เหมือนกันเป๊ะๆ
            orderDate: startOfDay,
            maxPosition
        };
    },
};