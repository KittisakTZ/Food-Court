// @/hooks/useStores.ts

import { getStores, getStoreById, getMyStore, toggleMyStoreStatus, updateMyStore } from "@/services/store.service";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type ของ Parameter ที่ Hook จะรับเข้ามา
type UseStoresProps = {
    page?: number;
    pageSize?: number;
    searchText?: string;
};

const MY_STORE_QUERY_KEY = 'my-store';

export const useStores = ({ page = 1, pageSize = 10, searchText = "" }: UseStoresProps) => {
    return useQuery({
        queryKey: ['stores', { page, pageSize, searchText }], // Key สำหรับ Caching
        queryFn: () => getStores({ page, pageSize, searchText }), // ฟังก์ชันที่จะเรียกเพื่อดึงข้อมูล
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// (ใหม่) Hook สำหรับดึงข้อมูลร้านค้าเดียว
export const useStore = (storeId: string) => {
    return useQuery({
        queryKey: ['store', storeId], // Key ที่มี storeId เพื่อแยก cache ของแต่ละร้าน
        queryFn: () => getStoreById(storeId),
        enabled: !!storeId, // จะเริ่มดึงข้อมูลก็ต่อเมื่อ storeId ไม่ใช่ค่าว่าง
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// (ใหม่) Hook สำหรับดึงข้อมูลร้านค้าของ Seller ที่ Login อยู่
export const useMyStore = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: ['my-store'],
        queryFn: getMyStore,
        // จะดึงข้อมูลก็ต่อเมื่อ: Login แล้ว และ Role เป็น SELLER เท่านั้น
        enabled: !!user && user.role === 'SELLER',
        staleTime: 1000 * 60 * 15, // 15 minutes cache
    });
};

// (ใหม่) Hook สำหรับอัปเดตข้อมูลร้าน
export const useUpdateMyStore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMyStore, // **ตรวจสอบว่าเรียก Service ที่ถูกต้อง**
        onSuccess: (updatedStore) => {
            queryClient.setQueryData(['my-store'], updatedStore);
            // **Alert "Success" มาจากตรงนี้**
            alert("Store information updated successfully!"); 
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            // **Console Error อาจจะมาจากตรงนี้**
            console.error("Mutation Error:", error.response?.data || error); 
            alert(`Failed to update store: ${errorMessage}`);
        }
    });
};

// (ใหม่) Hook สำหรับเปิด/ปิดร้าน
export const useToggleMyStoreStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleMyStoreStatus,
        onSuccess: (updatedStore) => {
            queryClient.setQueryData([MY_STORE_QUERY_KEY], updatedStore);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            alert(`Failed to toggle store status: ${errorMessage}`);
        }
    });
};