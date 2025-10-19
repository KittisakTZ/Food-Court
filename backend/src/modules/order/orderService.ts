// @modules/order/orderService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { orderRepository } from "./orderRepository";
import prisma from "@src/db"; // Import prisma โดยตรงเพื่อใช้ดึงข้อมูลเมนู

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
    
    // ... (Service สำหรับ get orders และ update status จะตามมา)
};