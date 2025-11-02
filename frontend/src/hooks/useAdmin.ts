import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminGetAllStores, adminApproveStore, adminRejectStore, adminGetStoreStats } from "@/services/admin.service";
import { toastService } from '@/services/toast.service';

const ADMIN_STORES_QUERY_KEY = 'admin-stores';
const ADMIN_STATS_QUERY_KEY = 'admin-stats';

// Hook สำหรับดึงสถิติร้านค้า (ไม่ขึ้นกับ filter)
export const useAdminStoreStats = () => {
    return useQuery({
        queryKey: [ADMIN_STATS_QUERY_KEY],
        queryFn: adminGetStoreStats,
        staleTime: 1000 * 60, // 1 minute
    });
};

// Hook สำหรับ Admin ดึงข้อมูลร้านค้าทั้งหมด (รองรับ pagination + filter)
export const useAdminStores = (
    page: number = 1,
    pageSize: number = 10,
    searchText?: string,
    filterStatus?: 'all' | 'pending' | 'approved'
) => {
    return useQuery({
        queryKey: [ADMIN_STORES_QUERY_KEY, page, pageSize, searchText, filterStatus],
        queryFn: () => adminGetAllStores(page, pageSize, searchText, filterStatus),
        staleTime: 1000 * 60, // 1 minute
    });
};

// Hook สำหรับ Admin อนุมัติร้านค้า
export const useAdminApproveStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApproveStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_STORES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ADMIN_STATS_QUERY_KEY] }); // รีเฟรช stats ด้วย
            toastService.success("Store approved successfully!");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`Failed to approve store: ${errorMessage}`);
        }
    });
};

// Hook สำหรับ Admin ยกเลิกการอนุมัติร้านค้า
export const useAdminRejectStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminRejectStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ADMIN_STORES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [ADMIN_STATS_QUERY_KEY] }); // รีเฟรช stats ด้วย
            toastService.success("Store approval revoked successfully!");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`Failed to revoke approval: ${errorMessage}`);
        }
    });
};