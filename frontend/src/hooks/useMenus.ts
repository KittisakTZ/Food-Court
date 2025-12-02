// @/hooks/useMenus.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createMenu, updateMenu, deleteMenu } from "@/services/menu.service";
import { getMenusByStore } from "@/services/store.service";
import { toastService } from '@/services/toast.service';

const MENUS_QUERY_KEY = 'menus';

type UseMenusProps = {
    storeId: string;
    page?: number;
    pageSize?: number;
    searchText?: string;
    categoryId?: string;
};

export const useMenus = ({ storeId, page = 1, pageSize = 12, searchText = "", categoryId = "" }: UseMenusProps) => {
    return useQuery({
        queryKey: ['menus', storeId, { page, pageSize, searchText, categoryId }],
        queryFn: () => getMenusByStore({ storeId, page, pageSize, searchText, categoryId }),
        enabled: !!storeId, // จะเริ่มดึงข้อมูลก็ต่อเมื่อ storeId มีค่า
    });
};

// (ใหม่) Hook สำหรับสร้างเมนูใหม่
export const useCreateMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // 'variables' คือ object ที่เราส่งเข้ามาใน mutate()
        mutationFn: (variables: { storeId: string, formData: FormData }) => createMenu(variables),
        
        // 'data' คือผลลัพธ์จาก mutationFn
        // 'variables' คือสิ่งที่เราส่งเข้ามาในตอนแรก
        onSuccess: (data, variables) => {
            // **แก้ไขตรงนี้:**
            // ดึง storeId มาจาก 'variables' แทนที่จะเป็น 'data'
            const storeId = variables.storeId;
            
            // ตอนนี้เรามั่นใจได้ 100% ว่า storeId จะมีค่าเสมอ
            queryClient.invalidateQueries({ queryKey: [MENUS_QUERY_KEY, storeId] });
            toastService.success(`สร้างเมนูสำเร็จ!`);
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถสร้างเมนูได้: ${errorMessage}`);
        }
    });
};

// (ใหม่) Hook สำหรับอัปเดตเมนู
export const useUpdateMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMenu,
        onSuccess: (data) => {
            // เมื่ออัปเดตสำเร็จ, invalidate ทั้ง 'menus' list และ cache ของ 'menu' เดี่ยวๆ (ถ้ามี)
            queryClient.invalidateQueries({ queryKey: [MENUS_QUERY_KEY, data.storeId] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถอัปเดตเมนูได้: ${errorMessage}`);
        }
    });
};

// (ใหม่) Hook สำหรับลบเมนู
export const useDeleteMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMenu,
        onSuccess: (data, variables) => {
            // เมื่อลบสำเร็จ, บอกให้ react-query ไปดึงข้อมูล 'menus' ของร้านนั้นๆ มาใหม่
            // เราดึง storeId มาจาก variables ที่ส่งเข้ามา
            queryClient.invalidateQueries({ queryKey: [MENUS_QUERY_KEY, variables.storeId] });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถลบเมนูได้: ${errorMessage}`);
        }
    });
};