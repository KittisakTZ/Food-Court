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
                    include: {
                        menu: {
                            include: {
                                store: { select: { id: true, name: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    },

    upsertCartItem: async (cartId: string, menuId: string, quantity: number, _storeId: string) => {
        return prisma.cartItem.upsert({
            where: { cartId_menuId: { cartId, menuId } },
            update: { quantity: { increment: quantity } },
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
        return prisma.cartItem.deleteMany({
            where: { cartId: cartId },
        });
    },

    // หา Item เดียว
    findCartItemById: (itemId: string) => prisma.cartItem.findUnique({ where: { id: itemId } }),
    // หา Cart เดียว
    findCartById: (cartId: string) => prisma.cart.findUnique({ where: { id: cartId } }),
};