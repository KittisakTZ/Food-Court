// @/services/menuCategory.service.ts
import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";

export type MenuType = "MAIN" | "DRINK" | "DESSERT" | "SNACK" | "OTHER";

export const MENU_TYPE_LABEL: Record<MenuType, string> = {
    MAIN:    "อาหารจานหลัก",
    DRINK:   "เครื่องดื่ม",
    DESSERT: "ของหวาน",
    SNACK:   "ของทานเล่น",
    OTHER:   "อื่นๆ",
};

export const MENU_TYPE_DEFAULT_COOKING_TIME: Record<MenuType, number> = {
    MAIN:    7,
    DRINK:   2,
    DESSERT: 4,
    SNACK:   3,
    OTHER:   5,
};

export const MENU_TYPE_EMOJI: Record<MenuType, string> = {
    MAIN:    "🍛",
    DRINK:   "🧋",
    DESSERT: "🍮",
    SNACK:   "🍟",
    OTHER:   "🍽",
};

export interface MenuCategory {
    id: string;
    name: string;
    menuType: MenuType;
    storeId: string;
}

export const getCategoriesByStore = async (storeId: string) => {
    const { data: response } = await mainApi.get<APIResponseType<MenuCategory[]>>(`/v1/stores/${storeId}/categories`);
    return response.responseObject;
};

export const createCategory = async ({ storeId, name, menuType }: { storeId: string; name: string; menuType: MenuType }) => {
    const { data: response } = await mainApi.post<APIResponseType<MenuCategory>>(`/v1/stores/${storeId}/categories`, { name, menuType });
    return response.responseObject;
};

export const updateCategory = async ({ storeId, categoryId, name, menuType }: { storeId: string; categoryId: string; name: string; menuType?: MenuType }) => {
    const { data: response } = await mainApi.patch<APIResponseType<MenuCategory>>(`/v1/stores/${storeId}/categories/${categoryId}`, { name, menuType });
    return response.responseObject;
};

export const deleteCategory = async ({ storeId, categoryId }: { storeId: string; categoryId: string }) => {
    const { data: response } = await mainApi.delete<APIResponseType<null>>(`/v1/stores/${storeId}/categories/${categoryId}`);
    return response;
};