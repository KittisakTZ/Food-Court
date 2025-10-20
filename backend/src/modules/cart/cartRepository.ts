// @/modules/cart/cartRepository.ts
import prisma from "@src/db";

export const cartRepository = {
    // หาหรือสร้าง Cart ของ User
    findOrCreateCart: async (userId: string) => {
        return prisma.cart.upsert({
            where: { userId: userId },
            update: {},
            create: { userId: userId },
            include: {
                items: {
                    include: { menu: true },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    },
    
    // เพิ่ม/อัปเดต Item ใน Cart
    upsertCartItem: async (cartId: string, menuId: string, quantity: number, storeId: string) => {
        // อัปเดต storeId ของตะกร้าทุกครั้งที่มีการเพิ่มของ
        await prisma.cart.update({
            where: { id: cartId },
            data: { storeId: storeId }
        });

        return prisma.cartItem.upsert({
            where: { cartId_menuId: { cartId, menuId } }, // ใช้ unique constraint
            update: { quantity: { increment: quantity } }, // ถ้ามีอยู่แล้วให้บวกเพิ่ม
            create: { cartId, menuId, quantity },
        });
    },

    // อัปเดตจำนวน Item โดยตรง
    updateCartItemQuantity: async (itemId: string, quantity: number) => {
        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: quantity },
        });
    },
    
    // ลบ Item ออกจาก Cart
    deleteCartItem: async (itemId: string) => {
        return prisma.cartItem.delete({
            where: { id: itemId },
        });
    },
    
    // ล้าง Item ทั้งหมดใน Cart
    clearCart: async (cartId: string) => {
        // ล้าง storeId ใน Cart ด้วย
        await prisma.cart.update({
            where: { id: cartId },
            data: { storeId: null }
        });
        
        return prisma.cartItem.deleteMany({
            where: { cartId: cartId },
        });
    },

    // หา Item เดียว
    findCartItemById: (itemId: string) => prisma.cartItem.findUnique({ where: { id: itemId } }),
    // หา Cart เดียว
    findCartById: (cartId: string) => prisma.cart.findUnique({ where: { id: cartId } }),
};