// @/services/menuCategory.service.ts
import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";
// สร้าง Type สำหรับ MenuCategory ด้วย
// src/types/response/menuCategory.response.ts

export interface MenuCategory {
    id: string;
    name: string;
    storeId: string;
}

export const getCategoriesByStore = async (storeId: string) => {
    const { data: response } = await mainApi.get<APIResponseType<MenuCategory[]>>(`/v1/stores/${storeId}/categories`);
    return response.responseObject;
};

export const createCategory = async ({ storeId, name }: { storeId: string, name: string }) => {
    const { data: response } = await mainApi.post<APIResponseType<MenuCategory>>(`/v1/stores/${storeId}/categories`, { name });
    return response.responseObject;
};

export const updateCategory = async ({ storeId, categoryId, name }: { storeId: string, categoryId: string, name: string }) => {
    const { data: response } = await mainApi.patch<APIResponseType<MenuCategory>>(`/v1/stores/${storeId}/categories/${categoryId}`, { name });
    return response.responseObject;
}

export const deleteCategory = async ({ storeId, categoryId }: { storeId: string, categoryId: string }) => {
    const { data: response } = await mainApi.delete<APIResponseType<null>>(`/v1/stores/${storeId}/categories/${categoryId}`);
    return response;
}

// เพิ่ม service สำหรับ update และ delete ตามต้องการ...