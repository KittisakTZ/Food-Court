// @/hooks/useMenuCategories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoriesByStore, createCategory, updateCategory, deleteCategory } from "@/services/menuCategory.service";
import { toastService } from '@/services/toast.service';

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
            toastService.success('สร้างหมวดหมู่สำเร็จ');
            queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, data.storeId] });
        },
        onError: (error) => {
            toastService.error(`ไม่สามารถสร้างหมวดหมู่ได้: ${error.message}`);
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCategory,
        onSuccess: (data) => {
            toastService.success('อัปเดตหมวดหมู่สำเร็จ');
            queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, data.storeId] });
        },
        onError: (error) => {
            toastService.error(`ไม่สามารถอัปเดตหมวดหมู่ได้: ${error.message}`);
        }
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCategory,
        onSuccess: (data, variables) => {
            if (data.statusCode >= 200 && data.statusCode < 300) {
                toastService.success('ลบหมวดหมู่สำเร็จ');
                queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY, variables.storeId] });
            } else {
                toastService.error(data.message || 'ไม่สามารถลบหมวดหมู่ได้');
            }
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message;
            toastService.error(`ไม่สามารถลบหมวดหมู่ได้: ${errorMessage}`);
        }
    });
};