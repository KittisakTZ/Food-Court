import { Menu } from "./menu.response";

export interface CartItem {
    id: string; // ID ของ CartItem
    cartId: string;
    menuId: string;
    quantity: number;
    createdAt: string;
    menu: Menu; // ข้อมูลเมนูที่ nested มา
}

export interface Cart {
    id: string;
    userId: string;
    storeId: string | null;
    items: CartItem[];
}