// @/hooks/useStores.ts

import { getStores, getStoreById } from "@/services/store.service";
import { useQuery } from "@tanstack/react-query";

// Type ของ Parameter ที่ Hook จะรับเข้ามา
type UseStoresProps = {
    page?: number;
    pageSize?: number;
    searchText?: string;
};

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