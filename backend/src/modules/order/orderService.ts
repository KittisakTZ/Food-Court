// @modules/order/orderService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { orderRepository } from "./orderRepository";
import prisma from "@src/db";
import { OrderStatus, Role } from "@prisma/client";
import { paymentGateway } from "@common/utils/paymentGateway"; // Import QR Code service (ตัวจำลอง)

// Type สำหรับข้อมูลที่ Frontend ส่งมาเพื่อสร้าง Order
type CreateOrderPayload = {
    storeId: string;
    position: number;
    items: Array<{ menuId: string; quantity: number }>;
};

// Type สำหรับข้อมูล user ที่ได้จาก Token
type UserPayload = {
    id: string;
    role: Role;
};

export const orderService = {
    // 1. Buyer สร้าง Order -> PENDING
    createOrder: async (payload: CreateOrderPayload, user: UserPayload) => {
        try {
            // 1.1 ตรวจสอบร้านค้า
            const store = await prisma.store.findUnique({ where: { id: payload.storeId } });
            if (!store) {
                return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
            }
            if (!store.isOpen) {
                return new ServiceResponse(ResponseStatus.Failed, "This store is currently closed.", null, StatusCodes.BAD_REQUEST);
            }

            // 1.2 ตรวจสอบและดึงข้อมูลเมนูทั้งหมดในครั้งเดียว
            const menuIds = payload.items.map(item => item.menuId);
            const menusFromDb = await prisma.menu.findMany({
                where: { id: { in: menuIds }, storeId: payload.storeId },
            });

            if (menusFromDb.length !== menuIds.length) {
                return new ServiceResponse(ResponseStatus.Failed, "Some menu items are invalid or do not belong to this store.", null, StatusCodes.BAD_REQUEST);
            }

            let totalAmount = 0;
            const itemsForRepo = [];

            // 1.3 คำนวณราคาและตรวจสอบความพร้อมขาย
            for (const item of payload.items) {
                const menu = menusFromDb.find(m => m.id === item.menuId);
                if (!menu) continue;
                if (!menu.isAvailable) {
                    return new ServiceResponse(ResponseStatus.Failed, `Menu '${menu.name}' is currently unavailable.`, null, StatusCodes.BAD_REQUEST);
                }
                const subtotal = menu.price * item.quantity;
                totalAmount += subtotal;
                itemsForRepo.push({
                    menuId: item.menuId,
                    quantity: item.quantity,
                    subtotal: subtotal
                });
            }

            // 1.4 สร้างข้อมูลสำหรับส่งให้ Repository
            const orderCreationData = {
                buyerId: user.id,
                storeId: payload.storeId,
                position: payload.position,
                totalAmount: totalAmount,
                items: itemsForRepo,
            };

            // 1.5 เรียกใช้ Transaction เพื่อสร้าง Order
            const newOrder = await orderRepository.createOrderTransaction(orderCreationData);
            return new ServiceResponse(ResponseStatus.Success, "Order created successfully. Awaiting seller approval.", newOrder, StatusCodes.CREATED);

        } catch (error) {
            const errorMessage = "Error creating order: " + (error as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    // 2. Seller จัดการ Order (Approve, Reject, Confirm Payment, etc.)
    reviewOrder: async (orderId: string, action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP", user: UserPayload) => {
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.FORBIDDEN);
        }

        const order = await orderRepository.findOrderById(orderId);
        if (!order || order.storeId !== store.id) {
            return new ServiceResponse(ResponseStatus.Failed, "Order not found or does not belong to your store.", null, StatusCodes.NOT_FOUND);
        }

        switch (action) {
            case 'APPROVE':
                if (order.status !== 'PENDING') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot approve an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                // สมมติว่าร้านค้ามี PromptPay ID (ในอนาคตดึงมาจาก store.promptPayId)
                const storePromptPayId = "0812345678";
                const qrCode = await paymentGateway.generateQrCode(storePromptPayId, order.totalAmount);
                const paymentExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 นาที

                const updatedOrder = await orderRepository.updateOrder(orderId, {
                    status: 'AWAITING_PAYMENT',
                    paymentQrCode: qrCode,
                    paymentExpiresAt: paymentExpiresAt,
                });
                return new ServiceResponse(ResponseStatus.Success, "Order approved. Awaiting payment.", null, StatusCodes.OK);

            case 'REJECT':
                if (order.status !== 'PENDING') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot reject an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                const rejectedOrder = await orderRepository.updateOrder(orderId, { status: 'REJECTED' });
                return new ServiceResponse(ResponseStatus.Success, "Order has been rejected.", null, StatusCodes.OK);

            case 'CONFIRM_PAYMENT':
                if (order.status !== 'AWAITING_PAYMENT') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot confirm payment for an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                const paidOrder = await orderRepository.updateOrder(orderId, {
                    status: 'COOKING',
                    paidAt: new Date(),
                    paymentQrCode: null,
                    paymentExpiresAt: null,
                });
                return new ServiceResponse(ResponseStatus.Success, "Payment confirmed. Order is now cooking.", null, StatusCodes.OK);

            case 'PREPARE_COMPLETE':
                if (order.status !== 'COOKING') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot complete an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                const completedOrder = await orderRepository.updateOrder(orderId, { status: 'READY_FOR_PICKUP' });
                return new ServiceResponse(ResponseStatus.Success, "Order is ready for pickup.", null, StatusCodes.OK);

            // (ใหม่) Case สำหรับปิด Order
            case 'CUSTOMER_PICKED_UP':
                if (order.status !== 'READY_FOR_PICKUP') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot complete an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                const finishedOrder = await orderRepository.updateOrder(orderId, {
                    status: 'COMPLETED',
                    completedAt: new Date(), // บันทึกเวลาที่จบสมบูรณ์
                });
                return new ServiceResponse(ResponseStatus.Success, "Order has been completed.", null, StatusCodes.OK);

            default:
                return new ServiceResponse(ResponseStatus.Failed, "Invalid action.", null, StatusCodes.BAD_REQUEST);
        }
    },

    // 3. Buyer ดูประวัติการสั่งซื้อของตัวเอง
    findMyOrders: async (user: UserPayload, page: number, pageSize: number) => {
        const orders = await orderRepository.findOrdersByBuyerId(user.id, page, pageSize);
        const totalCount = await orderRepository.countOrdersByBuyerId(user.id);

        return new ServiceResponse(ResponseStatus.Success, "Your orders retrieved successfully.", {
            data: orders, totalCount, totalPages: Math.ceil(totalCount / pageSize), currentPage: page
        }, StatusCodes.OK);
    },

    // 4. Seller ดู Order ของร้านตัวเอง
    findMyStoreOrders: async (user: UserPayload, page: number, pageSize: number) => {
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.NOT_FOUND);
        }

        const orders = await orderRepository.findOrdersByStoreId(store.id, page, pageSize);
        const totalCount = await orderRepository.countOrdersByStoreId(store.id);

        return new ServiceResponse(ResponseStatus.Success, "Your store's orders retrieved successfully.", {
            data: orders, totalCount, totalPages: Math.ceil(totalCount / pageSize), currentPage: page
        }, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับ Buyer เพื่อยกเลิก Order
    cancelMyOrder: async (orderId: string, user: { id: string }) => {
        // 1. ค้นหา Order ที่ต้องการยกเลิก
        const order = await orderRepository.findOrderById(orderId);

        if (!order) {
            return new ServiceResponse(ResponseStatus.Failed, "Order not found.", null, StatusCodes.NOT_FOUND);
        }

        // 2. ตรวจสอบสิทธิ์: ผู้ใช้คนนี้เป็นเจ้าของ Order จริงหรือไม่
        if (order.buyerId !== user.id) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to cancel this order.", null, StatusCodes.FORBIDDEN);
        }

        // 3. ตรวจสอบเงื่อนไข: สถานะของ Order ต้องเป็น PENDING เท่านั้น
        if (order.status !== 'PENDING') {
            return new ServiceResponse(
                ResponseStatus.Failed,
                `Cannot cancel an order with status '${order.status}'. It may have already been processed by the store.`,
                null,
                StatusCodes.BAD_REQUEST
            );
        }

        // 4. ถ้าเงื่อนไขทั้งหมดผ่าน, ทำการอัปเดตสถานะเป็น CANCELLED
        const cancelledOrder = await orderRepository.updateOrder(orderId, { status: 'CANCELLED' });

        return new ServiceResponse(ResponseStatus.Success, "Your order has been successfully cancelled.", null, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับดู Order เดียวแบบละเอียด
    findOrderDetails: async (orderId: string, user: { id: string, role: Role }) => {
        const order = await orderRepository.findOrderById(orderId);
        if (!order) {
            return new ServiceResponse(ResponseStatus.Failed, "Order not found.", null, StatusCodes.NOT_FOUND);
        }

        // ตรวจสอบสิทธิ์:
        // 1. ถ้าผู้ใช้เป็น BUYER, ต้องเป็นเจ้าของ Order
        // 2. ถ้าผู้ใช้เป็น SELLER, Order นั้นต้องเป็นของร้านเค้า
        if (user.role === 'BUYER' && order.buyerId !== user.id) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to view this order.", null, StatusCodes.FORBIDDEN);
        }

        if (user.role === 'SELLER') {
            const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
            if (!store || order.storeId !== store.id) {
                return new ServiceResponse(ResponseStatus.Failed, "This order does not belong to your store.", null, StatusCodes.FORBIDDEN);
            }
        }

        // ถ้าผ่านการตรวจสอบสิทธิ์ทั้งหมด, ส่งข้อมูลกลับไป
        // (เราอาจจะอยากดึงข้อมูลที่ละเอียดกว่านี้)
        const detailedOrder = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                store: true,
                buyer: { select: { username: true } },
                orderItems: { include: { menu: true } },
            }
        });

        return new ServiceResponse(ResponseStatus.Success, "Order details retrieved successfully.", detailedOrder, StatusCodes.OK);
    },
};