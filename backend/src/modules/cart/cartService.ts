// @/modules/cart/cartService.ts
import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { cartRepository } from "./cartRepository";
import prisma from "@src/db";

export const cartService = {
    // ดึงข้อมูลตะกร้าของ User ที่ Login อยู่
    getCart: async (userId: string) => {
        const cart = await cartRepository.findOrCreateCart(userId);
        return new ServiceResponse(ResponseStatus.Success, "Cart retrieved successfully.", cart, StatusCodes.OK);
    },

    // เพิ่มของลงตะกร้า
    addItemToCart: async (userId: string, menuId: string, quantity: number) => {
        // 1. หาเมนูและร้านค้า
        const menu = await prisma.menu.findUnique({ where: { id: menuId } });
        if (!menu || !menu.isAvailable) {
            return new ServiceResponse(ResponseStatus.Failed, "Menu not found or is unavailable.", null, StatusCodes.NOT_FOUND);
        }

        // 2. Find or create cart
        const cart = await cartRepository.findOrCreateCart(userId);

        // 3. Add item (multi-store: no restriction on mixing stores)
        await cartRepository.upsertCartItem(cart.id, menuId, quantity, menu.storeId);

        // 4. Return updated cart
        const updatedCart = await cartRepository.findOrCreateCart(userId);
        return new ServiceResponse(ResponseStatus.Success, "Item added to cart.", updatedCart, StatusCodes.OK);
    },

    // อัปเดตจำนวนสินค้า
    updateItemQuantity: async (userId: string, itemId: string, quantity: number) => {
        const cart = await cartRepository.findOrCreateCart(userId);
        const item = await cartRepository.findCartItemById(itemId);

        // ตรวจสอบสิทธิ์: Item นี้อยู่ใน Cart ของ User คนนี้จริงหรือไม่
        if (!item || item.cartId !== cart.id) {
            return new ServiceResponse(ResponseStatus.Failed, "Cart item not found.", null, StatusCodes.NOT_FOUND);
        }
        
        if (quantity <= 0) {
            // ถ้าจำนวนเป็น 0 หรือน้อยกว่า, ให้ลบ Item นั้นทิ้ง
            await cartRepository.deleteCartItem(itemId);
        } else {
            await cartRepository.updateCartItemQuantity(itemId, quantity);
        }
        
        const updatedCart = await cartRepository.findOrCreateCart(userId);
        return new ServiceResponse(ResponseStatus.Success, "Cart updated.", updatedCart, StatusCodes.OK);
    },
    
    // ล้างตะกร้า
    clearCart: async (userId: string) => {
        const cart = await cartRepository.findOrCreateCart(userId);
        await cartRepository.clearCart(cart.id);
        return new ServiceResponse(ResponseStatus.Success, "Cart cleared.", null, StatusCodes.OK);
    }
};