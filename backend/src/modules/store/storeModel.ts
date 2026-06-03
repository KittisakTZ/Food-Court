// @modules/store/storeModel.ts

import { z } from "zod";

const PromptPaySchema = z.string()
    .regex(/^(?:\d{10}|\d{13})$/, "Invalid PromptPay ID format. Must be a 10-digit phone number or 13-digit ID card number.")
    .optional()
    .nullable();

export type StorePayload = {
    name: string;
    description?: string | null;
    location?: string | null;
    image?: string | null;
    openTime?: string | null;
    closeTime?: string | null;
};

// Schema สำหรับการสร้างร้านค้า
export const CreateStoreSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        promptPayId: PromptPaySchema, // ✨ (เพิ่ม)
    }),
});

// Schema สำหรับการอัปเดตร้านค้า
export const UpdateStoreSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"),
    }),
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        promptPayId: PromptPaySchema,
        image: z.string().optional().nullable(),
        openTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
        closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    }),
});

// Schema สำหรับการดึง/ลบข้อมูลร้านค้าด้วย ID
export const StoreIdParamSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"),
    }),
});

// Schema สำหรับการเปลี่ยนสถานะ เปิด/ปิด ร้าน
export const ToggleStoreStatusSchema = z.object({
    body: z.object({
        isOpen: z.boolean({ required_error: "isOpen status is required" }),
        closeReason: z.string().max(200).optional().nullable(),
        reopenAt: z.string().datetime({ offset: true }).optional().nullable(),
    }),
});