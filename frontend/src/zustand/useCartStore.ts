// @/zustand/useCartStore.ts (ฉบับแก้ไขสมบูรณ์)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Menu } from '@/types/response/menu.response';
import { useAuthStore } from './useAuthStore';

export interface CartItem extends Menu {
    quantity: number;
}

interface CartState {
    cart: CartItem[];
    storeId: string | null;
    totalItems: number;
    totalPrice: number;
    addItem: (item: Menu) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            storeId: null,
            totalItems: 0,
            totalPrice: 0,

            addItem: (item) => {
                const { cart, storeId } = get();

                if (storeId && storeId !== item.storeId) {
                    if (!window.confirm("You have items from another store. Do you want to clear your cart and start a new order?")) {
                        return;
                    }
                }

                const newStoreId = storeId && storeId !== item.storeId ? item.storeId : storeId || item.storeId;
                let newCart = storeId && storeId !== item.storeId ? [] : [...cart];

                const existingItem = newCart.find((cartItem) => cartItem.id === item.id);

                if (existingItem) {
                    newCart = newCart.map((cartItem) =>
                        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                    );
                } else {
                    newCart = [...newCart, { ...item, quantity: 1 }];
                }

                // **** แก้ไขตรงนี้: คำนวณและ set ทุกอย่างในครั้งเดียว ****
                const newTotalItems = newCart.reduce((total, i) => total + i.quantity, 0);
                const newTotalPrice = newCart.reduce((total, i) => total + i.price * i.quantity, 0);

                set({
                    cart: newCart,
                    storeId: newStoreId,
                    totalItems: newTotalItems,
                    totalPrice: newTotalPrice
                });
            },

            removeItem: (itemId) => {
                const { cart } = get();
                const existingItem = cart.find((cartItem) => cartItem.id === itemId);
                let newCart;

                if (existingItem && existingItem.quantity > 1) {
                    newCart = cart.map((cartItem) =>
                        cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                    );
                } else {
                    newCart = cart.filter((cartItem) => cartItem.id !== itemId);
                }

                // **** แก้ไขตรงนี้: คำนวณและ set ทุกอย่างในครั้งเดียว ****
                const newTotalItems = newCart.reduce((total, i) => total + i.quantity, 0);
                const newTotalPrice = newCart.reduce((total, i) => total + i.price * i.quantity, 0);

                set({
                    cart: newCart,
                    totalItems: newTotalItems,
                    totalPrice: newTotalPrice,
                    // ถ้าตะกร้าว่าง ให้ล้าง storeId ด้วย
                    storeId: newCart.length > 0 ? get().storeId : null
                });
            },

            clearCart: () => set({ cart: [], storeId: null, totalItems: 0, totalPrice: 0 }),
        }),
        {
            name: 'cart-storage',
        }
    )
);

// **** เพิ่มส่วนนี้เข้าไปข้างล่าง ****
// นี่คือ Logic ที่จะคอย "ฟัง" การเปลี่ยนแปลงของ Auth Store
// เมื่อ user logout (user state ใน auth store กลายเป็น null) มันจะล้างตะกร้า
useAuthStore.subscribe(
    (state, prevState) => {
        // ถ้าสถานะ user เปลี่ยนจาก "มี" เป็น "ไม่มี" (logout)
        if (prevState.user && !state.user) {
            useCartStore.getState().clearCart();
        }
    }
);