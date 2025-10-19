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
        // รับ Action เข้ามาแทน Status ตรงๆ
        action: z.enum(["APPROVE", "REJECT", "CONFIRM_PAYMENT", "PREPARE_COMPLETE"]),
    }),
});

// Schema สำหรับการดึงประวัติการสั่งซื้อ (มี Pagination)
export const GetOrdersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
    }),
});