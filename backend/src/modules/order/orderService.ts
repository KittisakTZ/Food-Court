// @modules/order/orderService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { orderRepository } from "./orderRepository";
import prisma from "@src/db";
import { OrderStatus, Role, PaymentMethod } from "@prisma/client";
import { paymentGateway } from "@common/utils/paymentGateway"; // Import QR Code service (ตัวจำลอง)
import { env } from "@common/utils/envConfig";

// Type สำหรับข้อมูลที่ Frontend ส่งมาเพื่อสร้าง Order
type CreateOrderPayload = {
    storeId: string;
    items: Array<{ menuId: string; quantity: number }>;
    paymentMethod: PaymentMethod; // ✨ เพิ่ม type
    scheduledPickupTime?: string;
    description?: string; // Add this line
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
            let scheduledPickupDate: Date | null = null;
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

            if (payload.scheduledPickupTime) {
                const now = new Date();

                // 1. แยกชั่วโมงและนาทีออกจาก String "HH:mm"
                const [hours, minutes] = payload.scheduledPickupTime.split(':').map(Number);

                // 2. สร้าง Date object ของเวลาที่นัดรับ โดยใช้วันที่ของ "วันนี้"
                const pickupTime = new Date();
                pickupTime.setHours(hours, minutes, 0, 0); // ตั้งค่า ชั่วโมง, นาที, วินาที, มิลลิวินาที

                // --- ทำการ Validate เหมือนเดิม แต่ใช้ pickupTime ที่เราสร้างขึ้นใหม่ ---

                // เงื่อนไขที่ 1: เวลาที่เลือกต้องไม่เป็นเวลาในอดีต
                if (pickupTime < now) {
                    return new ServiceResponse(ResponseStatus.Failed, "Scheduled pickup time cannot be in the past.", null, StatusCodes.BAD_REQUEST);
                }

                // (เงื่อนไขเรื่องต้องเป็นวันเดียวกัน ไม่จำเป็นแล้ว เพราะเราสร้างจากวันที่ปัจจุบันเสมอ)

                scheduledPickupDate = pickupTime; // กำหนดค่า Date object ที่ถูกต้องให้กับตัวแปรของเรา
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

            // **(ลบ Logic เดิม) Logic การกำหนด Position เริ่มต้น**
            // const maxPosition = await orderRepository.findMaxPositionInStore(payload.storeId);
            // const newPosition = maxPosition + 1;

            // ✨ (Logic ใหม่) การกำหนด "หมายเลขคิวรายวัน" ✨
            const { nextQueueNumber, orderDate, maxPosition } = await orderRepository.getNextDailyQueueNumber(payload.storeId);

            // 1.4 สร้างข้อมูลสำหรับส่งให้ Repository
            const orderCreationData = {
                buyerId: user.id,
                storeId: payload.storeId,
                paymentMethod: payload.paymentMethod, // <-- เพิ่มตรงนี้
                description: payload.description, // Add this line
                position: maxPosition + 1,
                queueNumber: nextQueueNumber,
                orderDate: orderDate,
                scheduledPickup: scheduledPickupDate,
                totalAmount: totalAmount,
                items: itemsForRepo,
            };

            const newOrder = await orderRepository.createOrderTransaction(orderCreationData);
            return new ServiceResponse(ResponseStatus.Success, "Order created successfully.", newOrder, StatusCodes.CREATED);

        } catch (error) {
            const errorMessage = "Error creating order: " + (error as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    // (ใหม่) Service สำหรับ Seller เพื่อเรียงลำดับคิวใหม่
    reorderQueue: async (orderedIds: string[], user: { id: string }) => {
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.FORBIDDEN);
        }

        // สร้าง Array ของ object สำหรับอัปเดต
        const updates = orderedIds.map((id, index) => ({
            id: id,
            position: index + 1, // กำหนด position ใหม่ตามลำดับใน Array
        }));

        try {
            // **ตรวจสอบสิทธิ์เพิ่มเติมที่นี่ (ขั้นสูง)**
            // เราควรจะเช็คก่อนว่า Order ID ทั้งหมดที่ส่งมา เป็นของร้านนี้จริงหรือไม่
            const ordersInStore = await prisma.order.count({
                where: {
                    id: { in: orderedIds },
                    storeId: store.id,
                },
            });

            if (ordersInStore !== orderedIds.length) {
                return new ServiceResponse(ResponseStatus.Failed, "Some orders do not belong to your store or do not exist.", null, StatusCodes.BAD_REQUEST);
            }

            await orderRepository.updateOrderPositions(updates);
            return new ServiceResponse(ResponseStatus.Success, "Queue has been reordered successfully.", null, StatusCodes.OK);

        } catch (error) {
            const errorMessage = "Error reordering queue: " + (error as Error).message;
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

                // ✨ (Logic ใหม่) แยกตามประเภทการจ่ายเงิน
                if (order.paymentMethod === 'PROMPTPAY') {
                    // ✨ (ปรับปรุง) ดึงข้อมูลร้านค้าเต็มรูปแบบเพื่อเอา promptPayId
                    const storeWithPaymentInfo = await prisma.store.findUnique({
                        where: { id: store.id },
                        select: { promptPayId: true }
                    });

                    if (!storeWithPaymentInfo?.promptPayId) {
                        return new ServiceResponse(ResponseStatus.Failed, "This store has not configured its PromptPay account yet.", null, StatusCodes.BAD_REQUEST);
                    }

                    const qrCode = await paymentGateway.generateQrCode(storeWithPaymentInfo.promptPayId, order.totalAmount);
                    const paymentExpiresAt = new Date(Date.now() + env.PAYMENT_QR_CODE_EXPIRATION_MINUTES * 60 * 1000); // 15 mins

                    await orderRepository.updateOrder(orderId, {
                        status: 'AWAITING_PAYMENT',
                        paymentQrCode: qrCode,
                        paymentExpiresAt: paymentExpiresAt,
                        confirmedAt: new Date(), // บันทึกเวลาที่ร้านกดยืนยัน
                    });
                    return new ServiceResponse(ResponseStatus.Success, "Order approved. Awaiting payment.", null, StatusCodes.OK);

                } else if (order.paymentMethod === 'CASH_ON_PICKUP') {
                    // --- Flow จ่ายหน้าร้าน ---
                    // เมื่อร้านค้ากด Approve ก็เริ่มทำอาหารได้เลย
                    await orderRepository.updateOrder(orderId, {
                        status: 'COOKING',
                        confirmedAt: new Date(),
                    });
                    return new ServiceResponse(ResponseStatus.Success, "Order approved and moved to cooking.", null, StatusCodes.OK);
                }
                // กรณีไม่มี paymentMethod (เผื่อข้อมูลเก่า)
                return new ServiceResponse(ResponseStatus.Failed, "Invalid payment method for this order.", null, StatusCodes.BAD_REQUEST);


            case 'REJECT':
                // Logic เหมือนเดิม
                if (order.status !== 'PENDING') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot reject an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                await orderRepository.updateOrder(orderId, { status: 'REJECTED' });
                return new ServiceResponse(ResponseStatus.Success, "Order has been rejected.", null, StatusCodes.OK);

            case 'CONFIRM_PAYMENT':
                // ✨ (ปรับปรุง Logic) Action นี้ใช้สำหรับยืนยัน "สลิป"
                if (order.status !== 'AWAITING_CONFIRMATION') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot confirm payment for an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                if (!order.paymentSlip) {
                    return new ServiceResponse(ResponseStatus.Failed, "No payment slip has been uploaded for this order.", null, StatusCodes.BAD_REQUEST);
                }
                await orderRepository.updateOrder(orderId, {
                    status: 'COOKING',
                    paidAt: new Date(),
                    paymentQrCode: null, // ล้าง QR Code และวันหมดอายุออกไป
                    paymentExpiresAt: null,
                });
                return new ServiceResponse(ResponseStatus.Success, "Payment confirmed. Order is now cooking.", null, StatusCodes.OK);

            case 'PREPARE_COMPLETE':
                // Logic เหมือนเดิม
                if (order.status !== 'COOKING') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot complete an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                await orderRepository.updateOrder(orderId, { status: 'READY_FOR_PICKUP' });
                return new ServiceResponse(ResponseStatus.Success, "Order is ready for pickup.", null, StatusCodes.OK);

            case 'CUSTOMER_PICKED_UP':
                if (order.status !== 'READY_FOR_PICKUP') {
                    return new ServiceResponse(ResponseStatus.Failed, `Cannot complete an order with status ${order.status}`, null, StatusCodes.BAD_REQUEST);
                }
                // ✨ (ปรับปรุง) สำหรับเคสจ่ายเงินสด ให้บันทึกเวลาจ่ายเงินตอนนี้
                const updateData: { status: OrderStatus, completedAt: Date, paidAt?: Date } = {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                };
                if (order.paymentMethod === 'CASH_ON_PICKUP' && !order.paidAt) {
                    updateData.paidAt = new Date();
                }
                await orderRepository.updateOrder(orderId, updateData);
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
    findMyStoreOrders: async (user: { id: string }, page: number, pageSize: number, filterStatus?: OrderStatus[]) => {
        const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store.", null, StatusCodes.NOT_FOUND);
        }

        const orders = await orderRepository.findOrdersByStoreId(store.id, page, pageSize, filterStatus);
        const totalCount = await orderRepository.countOrdersByStoreId(store.id, filterStatus);

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
                review: true, // ✨ <--- เพิ่มบรรทัดนี้เข้าไป
            }
        });

        return new ServiceResponse(ResponseStatus.Success, "Order details retrieved successfully.", detailedOrder, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับย้ายตำแหน่ง Order
    async moveOrder(user: any, orderId: string, newPosition: number): Promise<ServiceResponse<null>> {
        try {
            // 🔹 ตรวจสอบว่า user เป็นเจ้าของร้าน
            const store = await prisma.store.findUnique({ where: { ownerId: user.id } });
            if (!store) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "You do not own a store.",
                    null,
                    StatusCodes.FORBIDDEN
                );
            }

            // 🔹 ตรวจสอบว่า order มีอยู่จริงและเป็นของร้านนี้
            const order = await orderRepository.findOrderById(orderId);
            if (!order || order.storeId !== store.id) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Order not found or does not belong to your store.",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }

            // 🔹 พยายามย้ายตำแหน่ง order
            await orderRepository.moveOrderPosition(store.id, orderId, newPosition);

            return new ServiceResponse(
                ResponseStatus.Success,
                "Order position updated successfully.",
                null,
                StatusCodes.OK
            );
        } catch (error) {
            // 🔹 จัดการ error แบบปลอดภัย
            const errorMessage = "Error moving order: " + (error as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // ✨ (Service ใหม่) สำหรับ Buyer อัปโหลดสลิป
    uploadPaymentSlip: async (orderId: string, user: UserPayload, file: Express.Multer.File): Promise<ServiceResponse<null>> => {
        try {
            const order = await orderRepository.findOrderById(orderId);

            // 1. ตรวจสอบสิทธิ์
            if (!order) {
                return new ServiceResponse(ResponseStatus.Failed, "Order not found.", null, StatusCodes.NOT_FOUND);
            }
            if (order.buyerId !== user.id) {
                return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to access this order.", null, StatusCodes.FORBIDDEN);
            }

            // 2. ตรวจสอบสถานะและประเภทการจ่ายเงิน
            if (order.status !== 'AWAITING_PAYMENT') {
                return new ServiceResponse(ResponseStatus.Failed, `You can only upload a slip for orders that are awaiting payment. Current status: ${order.status}`, null, StatusCodes.BAD_REQUEST);
            }

            // 3. สร้าง URL ของไฟล์ที่อัปโหลด
            // (ต้องตั้งค่า server.ts ให้ serve static file จาก /uploads ด้วย)
            const fileUrl = `${process.env.APP_URL}/uploads/${file.filename}`;

            // 4. อัปเดต Order
            await orderRepository.updateOrder(orderId, {
                paymentSlip: fileUrl,
                status: 'AWAITING_CONFIRMATION', // เปลี่ยนสถานะเป็น "รอร้านค้าตรวจสอบ"
            });

            return new ServiceResponse(ResponseStatus.Success, "Payment slip uploaded successfully. Please wait for the store to confirm.", null, StatusCodes.OK);

        } catch (error) {
            const errorMessage = "Error uploading slip: " + (error as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};