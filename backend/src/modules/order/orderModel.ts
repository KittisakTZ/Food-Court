// @modules/order/orderModel.ts

import { z } from "zod";

// Schema สำหรับ Item แต่ละรายการที่สั่ง
const OrderItemSchema = z.object({
    menuId: z.string().cuid("Invalid menu ID"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
});

// Schema สำหรับการสร้าง Order ใหม่
export const CreateOrderSchema = z.object({
    body: z.object({
        storeId: z.string().cuid("Invalid store ID"),
        position: z.number().positive("position must be a positive integer"),
        items: z.array(OrderItemSchema).min(1, "Order must contain at least one item"),
        
        // (แก้ไข) เปลี่ยนเป็นรับแค่เวลาในรูปแบบ HH:mm
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

// Schema สำหรับการดึงประวัติการสั่งซื้อ (มี Pagination)
export const GetOrdersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
    }),
});