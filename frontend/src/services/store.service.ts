// @/services/store.service.ts

import mainApi from "@/apis/main.api";
import { APIPaginationType, APIResponseType } from "@/types/response";
import { Store } from "@/types/response/store.response";
import { Menu } from "@/types/response/menu.response";

// Type สำหรับ Parameter ของการดึงข้อมูลร้านค้า
type GetStoresParams = {
    page?: number;
    pageSize?: number;
    searchText?: string;
}

// ฟังก์ชันดึงข้อมูลร้านค้าทั้งหมด (มี Pagination)
export const getStores = async (params: GetStoresParams) => {
    const { data: response } = await mainApi.get<APIResponseType<APIPaginationType<Store[]>>>(
        "/v1/stores", // Endpoint
        { params }    // ส่ง page, pageSize, searchText ไปเป็น query params
    );
    return response.responseObject; // trả về object ที่มี data, totalCount, etc.
};

// (ใหม่) ฟังก์ชันดึงข้อมูลร้านค้าเดียวด้วย ID
export const getStoreById = async (storeId: string) => {
    const { data: response } = await mainApi.get<APIResponseType<Store>>(
        `/v1/stores/${storeId}` // Endpoint: /v1/stores/:storeId
    );
    return response.responseObject;
};

// Type สำหรับ Parameter ของการดึงข้อมูลเมนู
type GetMenusParams = {
    storeId: string;
    page?: number;
    pageSize?: number;
    searchText?: string;
}

// (ใหม่) ฟังก์ชันดึงข้อมูลเมนูทั้งหมดของร้าน (มี Pagination)
export const getMenusByStore = async ({ storeId, ...params }: GetMenusParams) => {
    const { data: response } = await mainApi.get<APIResponseType<APIPaginationType<Menu[]>>>(
        `/v1/stores/${storeId}/menus`, // Endpoint: /v1/stores/:storeId/menus
        { params }
    );
    return response.responseObject;
};

// (ใหม่) ฟังก์ชันดึงข้อมูลร้านค้าของฉัน
export const getMyStore = async () => {
    const { data: response } = await mainApi.get<APIResponseType<Store>>(
        "/v1/stores/my-store"
    );
    return response.responseObject;
};