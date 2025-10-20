// @/hooks/useMenuCategories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoriesByStore, createCategory } from "@/services/menuCategory.service";

const CATEGORIES_QUERY_KEY = 'menu-categories';

export const useMenuCategories = (storeId: string) => {
    return useQuery({
        queryKey: [CATEGORIES_QUERY_KEY, storeId],
        queryFn: () => getCategoriesByStore(storeId),
        enabled: !!storeId,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCategory,
        onSuccess: (data) => {
            // เมื่อสร้างสำเร็จ, บอกให้ react-query ดึงข้อมูล categories ใหม่
            queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, data.storeId] });
        },
        onError: (error) => {
            alert(`Failed to create category: ${error.message}`);
        }
    });
};