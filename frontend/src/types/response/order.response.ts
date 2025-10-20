// @/types/response/order.response.ts
import { CartItem } from "./cart.response";
import { Store } from "./store.response";

// Type นี้ควรจะตรงกับข้อมูล Order ที่ Backend ส่งกลับมา
export interface Order {
    id: string;
    status: 'PENDING' | 'REJECTED' | 'AWAITING_PAYMENT' | 'COOKING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    position: number;
    isReviewed: boolean;
    createdAt: string;
    updatedAt: string;
    store: Omit<Store, 'owner'>;
    orderItems: CartItem[];
    buyer?: {
        username: string;
    };
    scheduledPickup?: string | null;
}