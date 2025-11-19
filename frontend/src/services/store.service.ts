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
    categoryId?: string;
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

// (ใหม่) Type สำหรับ Payload การอัปเดตข้อมูลร้าน
// เราจะอนุญาตให้อัปเดตแค่บาง field เท่านั้น
export interface UpdateStorePayload {
    name?: string;
    description?: string;
    location?: string;
    promptPayId?: string;
    image?: File;
}

// (ใหม่) ฟังก์ชันสำหรับ Seller อัปเดตข้อมูลร้านของตัวเอง
export const updateMyStore = async (payload: UpdateStorePayload) => {
    const formData = new FormData();

    // วนลูปเพื่อ append ข้อมูล text ทั้งหมดลงใน formData
    Object.entries(payload).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
    });

    // เพิ่มไฟล์รูปภาพถ้ามี
    if (payload.image) {
        formData.append('image', payload.image);
    }

    const { data: response } = await mainApi.patch<APIResponseType<Store>>(
        `/v1/stores/my-store`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.responseObject;
};

// (ใหม่) ฟังก์ชันสำหรับ Seller เปิด/ปิดร้าน
export const toggleMyStoreStatus = async (isOpen: boolean) => {
    const { data: response } = await mainApi.patch<APIResponseType<Store>>(
        `/v1/stores/my-store/status`,
        { isOpen }
    );
    return response.responseObject;
};