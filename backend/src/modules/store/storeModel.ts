// @modules/store/storeModel.ts

import { z } from "zod";

// Payload สำหรับการสร้างและอัปเดตร้านค้า
export type StorePayload = {
    name: string;
    description?: string | null;
    location?: string | null;
    image?: string | null;
};

// Schema สำหรับการสร้างร้านค้า
export const CreateStoreSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().optional(),
        location: z.string().optional(),
        image: z.string().url().optional(), // สมมติว่า image เป็น URL
    }),
});

// Schema สำหรับการอัปเดตร้านค้า
export const UpdateStoreSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"), // ID จาก Prisma เป็น CUID
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        image: z.string().url().optional().nullable(),
        isOpen: z.boolean().optional(),
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลร้านค้าด้วย ID
export const StoreIdParamSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"),
    }),
});

// (ใหม่) Schema สำหรับการเปลี่ยนสถานะ เปิด/ปิด ร้าน
export const ToggleStoreStatusSchema = z.object({
    body: z.object({
        isOpen: z.boolean({ required_error: "isOpen status is required" }),
    }),
});