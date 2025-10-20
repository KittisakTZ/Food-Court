// @/modules/cart/cartModel.ts

import { z } from "zod";

export const AddToCartSchema = z.object({
    body: z.object({
        menuId: z.string().cuid("Invalid menu ID"),
        quantity: z.number().int().positive("Quantity must be a positive number"),
    }),
});

export const UpdateCartItemSchema = z.object({
    params: z.object({
        itemId: z.string().cuid("Invalid cart item ID"),
    }),
    body: z.object({
        quantity: z.number().int().min(0, "Quantity cannot be negative"), // 0 หมายถึงการลบ
    }),
});

export const CartItemIdParamSchema = z.object({
    params: z.object({
        itemId: z.string().cuid("Invalid cart item ID"),
    }),
});