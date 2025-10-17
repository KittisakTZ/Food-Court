import { z } from "zod";

export type TypePayloadItem = {
    item_code?: string;
    item_name: string;
    item_description: string;
    additional_note: string;
    group_item_id: string;
    type_item_id: string;
    unit_id: string;
    item_price: string;
    created_by?: string;
    updated_by?: string;
    created_at?: Date;
    updated_at?: Date;
}

export const CreateSchema = z.object({
    body: z.object({
        item_name: z.string().min(1, {message: "enter item name minimum 1 character"}).max(50, {message: "enter item name maximum 50 character"}),
        item_description: z.string(),
        additional_note: z.string(),
        group_item_id: z.string().min(1, {message: "enter group item id minimum 1 character"}).max(50, {message: "enter group item id maximum 50 character"}),
        type_item_id: z.string().min(1, {message: "enter type item id minimum 1 character"}).max(50, {message: "enter type item id maximum 50 character"}),
        unit_id: z.string().min(1, {message: "enter unit id minimum 1 character"}).max(50, {message: "enter unit id maximum 50 character"}),
        item_price: z.number().min(0, {message: "enter item price minimum 0 "}),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ item_id: z.string().min(1, {message: "enter item id minimum 1 character"}).max(50, {message: "enter item id maximum 50 character"}) }),
    body: z.object({
        item_name: z.string().min(1, {message: "enter item name minimum 1 character"}).max(50, {message: "enter item name maximum 50 character"}),
        item_description: z.string().max(50).optional(),
        additional_note: z.string().max(50).optional(),
        group_item_id: z.string().min(1, {message: "enter group item id minimum 1 character"}).max(50, {message: "enter group item id maximum 50 character"}),
        type_item_id: z.string().min(1, {message: "enter type item id minimum 1 character"}).max(50, {message: "enter type item id maximum 50 character"}),
        unit_id: z.string().min(1, {message: "enter unit id minimum 1 character"}).max(50, {message: "enter unit id maximum 50 character"}),
        item_price: z.number().min(0, {message: "enter item price minimum 0 "}),
    })
})

export const DeleteSchema = z.object({
    params: z.object({
        item_id: z.string().min(1, {message: "enter item id minimum 1 character"}).max(50, {message: "enter item id maximum 50 character"}),
    })
})

export const GetByIdSchema = z.object({
    params: z.object({
        item_id: z.string().min(1, {message: "enter item id minimum 1 character"}).max(50, {message: "enter item id maximum 50 character"}),
    })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().min(1, {message: "enter page minimum 1 "}).max(100, {message: "enter page maximum 100"}).optional(),
        limit: z.string().min(1, {message: "enter limit minimum 1 "}).max(50, {message: "enter limit maximum 1 "}).optional(),
        search: z.string().optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});

