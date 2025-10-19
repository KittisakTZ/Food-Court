// @modules/order/orderService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { orderRepository } from "./orderRepository";
import prisma from "@src/db";
import { OrderStatus, Role } from "@prisma/client";

type CreateOrderPayload = {
    storeId: string;
    position: number;
    items: Array<{ menuId: string; quantity: number }>;
};

export const orderService = {
    createOrder: async (payload: CreateOrderPayload, user: { id: string }) => {
        try {
            // 1. ตรวจสอบร้านค้า
            const store = await prisma.store.findUnique({ where: { id: payload.storeId } });
            if (!store) {
                return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
            }
            if (!store.isOpen) {
                return new ServiceResponse(ResponseStatus.Failed, "This store is currently closed.", null, StatusCodes.BAD_REQUEST);
            }

            // 2. ตรวจสอบและดึงข้อมูลเมนูทั้งหมดในครั้งเดียวเพื่อประสิทธิภาพ
            const menuIds = payload.items.map(item => item.menuId);
            const menusFromDb = await prisma.menu.findMany({
                where: {
                    id: { in: menuIds },
                    storeId: payload.storeId, // **สำคัญ:** เช็คว่าทุกเมนูเป็นของร้านนี้จริง
                },
            });

            // เช็คว่าหาเมนูเจอครบทุกรายการหรือไม่
            if (menusFromDb.length !== menuIds.length) {
                return new ServiceResponse(ResponseStatus.Failed, "Some menu items are invalid or do not belong to this store.", null, StatusCodes.BAD_REQUEST);
            }

            let totalAmount = 0;
            const itemsForRepo = [];

            // 3. คำนวณราคาและตรวจสอบความพร้อมขาย
            for (const item of payload.items) {
                const menu = menusFromDb.find(m => m.id === item.menuId);

                // menu จะไม่เป็น undefined เพราะเราเช็คไปแล้วข้างบน แต่ใส่ไว้เพื่อความปลอดภัย
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

            // 4. สร้างข้อมูลสำหรับส่งให้ Repository
            const orderCreationData = {
                buyerId: user.id,
                storeId: payload.storeId,
                position: payload.position,
                totalAmount: totalAmount,
                items: itemsForRepo,
            };

            // 5. เรียกใช้ Transaction
            const newOrder = await orderRepository.createOrderTransaction(orderCreationData);
            return new ServiceResponse(ResponseStatus.Success, "Order created successfully.", newOrder, StatusCodes.CREATED);

        } catch (error) {
            const errorMessage = "Error creating order: " + (error as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    // (ใหม่) Service สำหรับ Buyer ดูประวัติการสั่งซื้อของตัวเอง
    findMyOrders: async (user: { id: string }, page: number, pageSize: number) => {
        const orders = await orderRepository.findOrdersByBuyerId(user.id, page, pageSize);
        const totalCount = await orderRepository.countOrdersByBuyerId(user.id);

        return new ServiceResponse(
            ResponseStatus.Success,
            "Your orders retrieved successfully.",
            {
                data: orders,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            },
            StatusCodes.OK
        );
    },

    // (ใหม่) Service สำหรับ Seller ดู Order ของร้านตัวเอง
    findMyStoreOrders: async (user: { id: string }, page: number, pageSize: number) => {
        // ก่อนอื่น ต้องหาร้านของ Seller คนนี้ก่อน
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.NOT_FOUND);
        }

        const orders = await orderRepository.findOrdersByStoreId(store.id, page, pageSize);
        const totalCount = await orderRepository.countOrdersByStoreId(store.id);

        return new ServiceResponse(
            ResponseStatus.Success,
            "Your store's orders retrieved successfully.",
            {
                data: orders,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            },
            StatusCodes.OK
        );
    },

    // (ใหม่) Service สำหรับ Seller อัปเดตสถานะ Order
    updateOrderStatus: async (orderId: string, status: OrderStatus, user: { id: string }) => {
        // ต้องหาร้านของ Seller คนนี้ก่อนเช่นกัน
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.FORBIDDEN);
        }

        // ตรวจสอบว่า Order ที่จะอัปเดตมีอยู่จริงหรือไม่
        const order = await orderRepository.findOrderById(orderId);
        if (!order) {
            return new ServiceResponse(ResponseStatus.Failed, "Order not found.", null, StatusCodes.NOT_FOUND);
        }

        // **การตรวจสอบสิทธิ์:** เช็คว่า Order นี้เป็นของร้านค้าของ Seller คนนี้จริง
        if (order.storeId !== store.id) {
            return new ServiceResponse(ResponseStatus.Failed, "This order does not belong to your store.", null, StatusCodes.FORBIDDEN);
        }

        // (Optional) เพิ่ม Logic การเปลี่ยนสถานะที่ซับซ้อนขึ้นได้ที่นี่
        // เช่น ไม่สามารถเปลี่ยนสถานะเป็น COMPLETED ถ้ายังไม่ ACCEPTED
        // หรือ ไม่สามารถ REJECT ถ้าสถานะเป็น COMPLETED ไปแล้ว
        if (order.status === "COMPLETED" || order.status === "CANCELLED" || order.status === "REJECTED") {
            return new ServiceResponse(ResponseStatus.Failed, `Cannot change status of an order that is already ${order.status}.`, null, StatusCodes.BAD_REQUEST);
        }

        const updatedOrder = await orderRepository.updateOrderStatus(orderId, status);
        return new ServiceResponse(ResponseStatus.Success, `Order status updated to ${status}.`, null, StatusCodes.OK);
    }
};