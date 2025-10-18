// @modules/review/reviewModel.ts

import { z } from "zod";

// Payload สำหรับการสร้างรีวิว
export type ReviewPayload = {
    rating: number;
    comment?: string | null;
};

// Schema สำหรับการสร้างรีวิว
export const CreateReviewSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"),
    }),
    body: z.object({
        rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
        comment: z.string().max(500, "Comment must be 500 characters or less").optional(),
    }),
});

// Schema สำหรับการดึงข้อมูลรีวิว
export const GetReviewsSchema = z.object({
    params: z.object({
        storeId: z.string().cuid("Invalid store ID"),
    }),
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(5),
    }),
});