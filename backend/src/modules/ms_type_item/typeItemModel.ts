import { z } from "zod";

export type TypePayloadTypeItem = {
    group_item_id : string;
    type_item_name : string;
    type_item_description : string;
    created_by? : string;
    updated_by? : string;
    created_at? : Date;
    updated_at? : Date;
}

export const CreateSchema = z.object({
    body: z.object({
        group_item_id: z.string().min(1).max(50),
        type_item_name: z.string().min(1).max(50),
        type_item_description: z.string(),
    })
})

export const UpdateSchema = z.object({
    params: z.object({ type_item_id: z.string().min(1).max(50) }),
    body: z.object({
        group_item_id: z.string().max(50).optional(),
        type_item_name: z.string().max(50).optional(),
        type_item_description: z.string().optional(),
    })
})

export const DeleteSchema = z.object({
    params: z.object({
        type_item_id: z.string().min(1).max(50),
    })
})

export const GetByIdSchema = z.object({
    params: z.object({
        type_item_id: z.string().min(1).max(50),
    })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().min(1).max(100).optional(),
        limit: z.string().min(1).max(50).optional(),
        search: z.string().optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});

