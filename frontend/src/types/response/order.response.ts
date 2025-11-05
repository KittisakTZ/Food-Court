import { CartItem } from "./cart.response";
import { Store } from "./store.response";

// Type นี้ควรจะตรงกับข้อมูล Order ที่ Backend ส่งกลับมา
export interface Order {
    id: string;
    status: 'PENDING' | 'REJECTED' | 'AWAITING_PAYMENT' | 'COOKING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    position: number;           // ยังคงมีอยู่ สำหรับการลากวาง (Drag-and-Drop)
    isReviewed: boolean;
    createdAt: string;
    updatedAt: string;
    store: Omit<Store, 'owner'>;
    orderItems: CartItem[];
    buyer?: {
        username: string;
    };
    scheduledPickup?: string | null;

    // ✨ เพิ่ม 2 ฟิลด์นี้เข้ามาให้ตรงกับ Backend ✨
    queueNumber: number;        // หมายเลขคิวของวันนั้นๆ
    orderDate: string;          // วันที่ของออเดอร์ (จะเป็น string format YYYY-MM-DD)
}