// @/hooks/useOrders.ts

import { getMyOrders, getMyStoreOrders, updateOrderStatus, moveOrderPosition, createOrder, uploadPaymentSlip, getOrderById } from "@/services/order.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/types/response/order.response"; // **1. Import 'Order' Type ของเรา**
import { toastService } from '@/services/toast.service';
import { dialogService } from '@/services/dialog.service';
import { useClearCart } from "./useCart";
import { useLocation } from "react-router-dom";

// ===== HOOK สำหรับ BUYER (โค้ดเดิม) =====
type UseOrdersProps = {
    page?: number;
    pageSize?: number;
};

export const useMyOrders = ({ page = 1, pageSize = 10 }: UseOrdersProps = {}) => {
    return useQuery({
        queryKey: ['my-orders', { page, pageSize }],
        queryFn: () => getMyOrders({ page, pageSize }),
        staleTime: 1000 * 60, // 1 minute
    });
};


// ===== HOOKS สำหรับ SELLER (ส่วนที่แก้ไข) =====

const STORE_ORDERS_QUERY_KEY = 'store-orders';

// **2. ดึง Type ของ status มาจาก 'Order' Type ของเรา**
type OrderStatusString = Order['status'];

// **1. สร้าง Type สำหรับ Filter ให้ชัดเจนขึ้น**
interface StoreOrdersFilter {
    page?: number;
    pageSize?: number;
    status?: OrderStatusString[];
}

// **2. แก้ไข Hook ให้รับ Parameter ที่ถูกต้อง**
export const useMyStoreOrders = (filters: StoreOrdersFilter) => {
    return useQuery({
        // **3. นำ Filter ทั้งหมดมาเป็นส่วนหนึ่งของ Query Key**
        queryKey: [STORE_ORDERS_QUERY_KEY, filters],
        // **4. ส่ง Filter ทั้งหมดต่อไปยัง Service**
        queryFn: () => getMyStoreOrders(filters),
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 30,
    });
};

// Hook สำหรับอัปเดตสถานะ Order
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [STORE_ORDERS_QUERY_KEY] });
        },
        onError: (error) => {
            const errorMessage = (error as any)?.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้: ${errorMessage}`);
        }
    });
};

// Hook สำหรับรายงานปัญหาออเดอร์
export const useReportOrderIssue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [STORE_ORDERS_QUERY_KEY] });
            if (variables.action === 'REPORT_ISSUE') {
                toastService.success('รายงานปัญหาออเดอร์เรียบร้อยแล้ว');
            } else {
                toastService.success('ล้างปัญหาออเดอร์เรียบร้อยแล้ว');
            }
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error.message;
            toastService.error(`เกิดข้อผิดพลาด: ${errorMessage}`);
        }
    });
};

// (ใหม่) Hook สำหรับย้ายตำแหน่ง Order (แทนที่ useReorderQueue)
export const useMoveOrderPosition = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: moveOrderPosition,
        onSuccess: () => {
            // เมื่อสำเร็จ, invalidate query เพื่อดึงลำดับที่ถูกต้องจาก server มาแสดง
            queryClient.invalidateQueries({ queryKey: [STORE_ORDERS_QUERY_KEY] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            dialogService.error(
                'ไม่สามารถย้ายคำสั่งซื้อได้',
                errorMessage
            );
            // ถ้าล้มเหลว, ก็ควร invalidate เพื่อให้ UI กลับไปเป็นลำดับเดิมที่ถูกต้อง
            queryClient.invalidateQueries({ queryKey: [STORE_ORDERS_QUERY_KEY] });
        }
    });
};

// (ใหม่) Hook สำหรับสร้าง Order ใหม่
export const useCreateOrder = () => {
    // ดึง mutate function สำหรับล้างตะกร้ามาใช้
    const { mutate: clearCart } = useClearCart();

    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            // **เมื่อสร้าง Order สำเร็จ, ให้เรียกใช้ mutation เพื่อล้างตะกร้า**
            clearCart();

            // (Optional) อาจจะไม่ต้อง invalidate 'my-orders' ที่นี่
            // เพราะเราจะ navigate ไปหน้านั้น ซึ่งมันจะ refetch เองอยู่แล้ว
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถสร้างคำสั่งซื้อได้: ${errorMessage}`);
        }
    });
};

// (เพิ่ม hook ใหม่)
export const useUploadSlip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadPaymentSlip,
        onSuccess: () => {
            toastService.success("อัปโหลดสลิปสำเร็จ! กรุณารอการยืนยัน");
            // Invalidate query 'my-orders' เพื่อให้สถานะอัปเดตเป็น AWAITING_CONFIRMATION
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถอัปโหลดสลิปได้: ${errorMessage}`);
        }
    });
};

// ✨ (เพิ่ม) Hook สำหรับดึงข้อมูลออร์เดอร์เดียว
export const useOrder = (orderId?: string) => {
    // ✨ 2. ใช้ useLocation เพื่อเข้าถึงข้อมูล path ปัจจุบัน
    const location = useLocation();

    // ✨ 3. ตรวจสอบว่า path ปัจจุบันเป็นของฝั่งร้านค้าหรือไม่
    const isStoreContext = location.pathname.includes('/my-store/');

    return useQuery({
        // ✨ 4. (แนะนำ) เพิ่ม context เข้าไปใน queryKey เพื่อป้องกันการ cache ชนกัน
        queryKey: ['order', orderId, { isStore: isStoreContext }],

        // ✨ 5. เรียกใช้ service โดยส่งพารามิเตอร์เป็น object ที่มีทั้ง orderId และ context
        queryFn: () => getOrderById({ orderId: orderId!, isStoreContext }),

        enabled: !!orderId,
        staleTime: 1000 * 60,
    });
};