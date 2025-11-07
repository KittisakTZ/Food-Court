import { Menu } from "./menu.response";

export interface CartItem {
    id: string;
    cartId?: string; // ทำให้เป็น Optional เพราะใน OrderItem ไม่มี cartId
    orderId?: string; // อาจจะเพิ่มเข้าไปเพื่อความสมบูรณ์
    menuId: string;
    quantity: number;
    createdAt?: string; // ทำให้เป็น Optional
    menu: Menu;
    subtotal: number; // ✨ เพิ่มฟิลด์นี้เข้ามา
}

export interface Cart {
    id: string;
    userId: string;
    storeId: string | null;
    items: CartItem[];
}