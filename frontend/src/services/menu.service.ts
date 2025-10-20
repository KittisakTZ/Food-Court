// @/services/menu.service.ts
import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";
import { Menu } from "@/types/response/menu.response";

// Type สำหรับ Payload ที่จะส่งไป (ใช้ FormData)
// เราไม่จำเป็นต้องกำหนด Type ที่นี่ เพราะจะสร้างเป็น FormData object

export const createMenu = async ({ storeId, formData }: { storeId: string, formData: FormData }) => {
    const { data: response } = await mainApi.post<APIResponseType<Menu>>(
        `/v1/stores/${storeId}/menus`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data', // **สำคัญมาก**
            },
        }
    );
    return response.responseObject;
};

// เพิ่ม service สำหรับ updateMenu และ deleteMenu ที่นี่ในภายหลัง...