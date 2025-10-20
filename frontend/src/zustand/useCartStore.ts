// @/zustand/useCartStore.ts (ฉบับยกเครื่องใหม่)

import { create } from 'zustand';
import { Cart as CartData } from '@/types/response/cart.response'; // เราจะสร้าง Type นี้

// Type ใหม่สำหรับข้อมูลตะกร้าจาก Backend
// สร้างไฟล์ใหม่ src/types/response/cart.response.ts
/*
import { CartItem as ApiCartItem } from './menu.response'; // สมมติว่า cart item คล้าย menu

export interface Cart {
    id: string;
    userId: string;
    storeId: string | null;
    items: ApiCartItem[];
    // อาจจะมีข้อมูลสรุปจาก Backend มาให้เลย
    totalItems: number;
    totalPrice: number;
}
*/

// กำหนด Type ของ State และ Actions ใหม่
interface CartState {
    cart: CartData | null;
    setCart: (cart: CartData | null) => void;
}

// สร้าง Store ใหม่ที่เรียบง่าย
export const useCartStore = create<CartState>((set) => ({
    cart: null, // เริ่มต้นด้วยตะกร้าว่าง
    setCart: (cartData) => set({ cart: cartData }),
}));

// ไม่ต้องใช้ persist middleware อีกต่อไป เพราะข้อมูลจะมาจาก Backend โดยตรง
// ไม่ต้องมี subscribe อีกต่อไป เพราะ react-query จะจัดการเอง