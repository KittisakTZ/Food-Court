// @modules/order/orderModel.ts

import { z } from "zod";
import { OrderStatus } from "@prisma/client"; // Import เข้ามา

// Schema สำหรับ Item แต่ละรายการที่สั่ง
const OrderItemSchema = z.object({
    menuId: z.string().cuid("Invalid menu ID"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Schema สำหรับการสร้าง Order ใหม่
export const CreateOrderSchema = z.object({
    body: z.object({
        storeId: z.string().cuid("Invalid store ID"),
        items: z.array(OrderItemSchema).min(1, "Order must contain at least one item"),
        scheduledPickupTime: z.string()
            .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Please use HH:mm (24-hour).")
            .optional(),
    }),
});

// Schema สำหรับการดึงข้อมูล Order ด้วย ID
export const OrderIdParamSchema = z.object({
    params: z.object({
        orderId: z.string().cuid("Invalid order ID"),
    }),
});

// Schema สำหรับ Seller เพื่ออัปเดตสถานะ Order
export const SellerUpdateOrderStatusSchema = z.object({
    params: z.object({
        orderId: z.string().cuid("Invalid order ID"),
    }),
    body: z.object({
        // เพิ่ม Action ใหม่เข้าไป
        action: z.enum(["APPROVE", "REJECT", "CONFIRM_PAYMENT", "PREPARE_COMPLETE", "CUSTOMER_PICKED_UP"]),
    }),
});

const OrderStatusEnum = z.nativeEnum(OrderStatus); // สร้าง Zod Enum

// (แก้ไข) Schema สำหรับการดึงประวัติ/คิว
export const GetOrdersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
        // (ใหม่) รับ status ได้หลายค่า เช่น ?status=PENDING&status=COOKING
        status: z.union([OrderStatusEnum, z.array(OrderStatusEnum)]).optional()
    }),
});

// (ใหม่) Schema สำหรับการเปลี่ยนลำดับคิว
export const ReorderQueueSchema = z.object({
    body: z.object({
        // Frontend จะส่ง Array ของ Order ID ที่เรียงลำดับใหม่แล้วมา
        orderedIds: z.array(z.string().cuid()).min(1, "At least one order ID is required"),
    }),
});

// (ใหม่) Schema สำหรับการย้ายตำแหน่ง Order
export const MoveOrderSchema = z.object({
    body: z.object({
        // ตำแหน่งใหม่ที่ต้องการให้ไปอยู่
        newPosition: z.number().positive("Position must be a positive number"),
    }),
});