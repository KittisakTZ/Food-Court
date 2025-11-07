import { CartItem } from "./cart.response";
import { Store } from "./store.response";

// ✨ (ปรับปรุง) อัปเดต Type ให้ตรงกับ Backend ล่าสุด
export interface Order {
    id: string;
    // เพิ่ม 'AWAITING_CONFIRMATION' เข้าไป
    status: 'PENDING' | 'REJECTED' | 'AWAITING_PAYMENT' | 'AWAITING_CONFIRMATION' | 'COOKING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
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
    queueNumber: number;
    orderDate: string;

    // --- ✨ เพิ่ม Fields ใหม่ทั้งหมด ---
    paymentMethod: 'PROMPTPAY' | 'CASH_ON_PICKUP' | null;
    paymentQrCode: string | null;
    paymentSlip: string | null;
    paymentExpiresAt: string | null;
    paidAt: string | null;
    confirmedAt: string | null;
    completedAt: string | null;
}