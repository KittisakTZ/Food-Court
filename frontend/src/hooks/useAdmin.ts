// @/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAllStores, adminApproveStore } from "@/services/admin.service";
import { toastService } from '@/services/toast.service';

const ADMIN_STORES_QUERY_KEY = 'admin-stores';

// Hook สำหรับ Admin ดึงข้อมูลร้านค้าทั้งหมด
export const useAdminStores = () => {
    return useQuery({
        queryKey: [ADMIN_STORES_QUERY_KEY],
        queryFn: adminGetAllStores,
        staleTime: 1000 * 60, // 1 minute
    });
};

// Hook สำหรับ Admin อนุมัติร้านค้า
export const useAdminApproveStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApproveStore,
        onSuccess: () => {
            // เมื่ออนุมัติสำเร็จ, บอกให้ react-query ไปดึงข้อมูล 'admin-stores' มาใหม่
            queryClient.invalidateQueries({ queryKey: [ADMIN_STORES_QUERY_KEY] });
            toastService.success("Store approved successfully!");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`Failed to approve store: ${errorMessage}`);
        }
    });
};