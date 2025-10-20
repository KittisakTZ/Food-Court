// @/hooks/useOrders.ts

import { getMyOrders, getMyStoreOrders, updateOrderStatus } from "@/services/order.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/types/response/order.response"; // **1. Import 'Order' Type ของเรา**

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

// Hook สำหรับดึงข้อมูล Order ของร้าน
export const useMyStoreOrders = (filters: { status?: OrderStatusString[] }) => { // **3. ใช้ Type ที่ถูกต้องที่นี่**
    return useQuery({
        queryKey: [STORE_ORDERS_QUERY_KEY, filters],
        queryFn: () => getMyStoreOrders({ status: filters.status }),
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
            // เราสามารถเข้าถึง message ของ error ที่ axios ส่งกลับมาได้
            const errorMessage = (error as any)?.response?.data?.message || error.message;
            alert(`Failed to update order status: ${errorMessage}`);
        }
    });
};