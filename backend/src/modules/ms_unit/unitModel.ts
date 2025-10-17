import { z } from "zod";

export type TypePayloadUnit = {
    unit_name : string;
    created_by? : string;
    updated_by? : string;
    created_at? : Date;
    updated_at? : Date;
}

export type Filter = {
    operator?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
    searchCol?: string
}

export const CreateSchema = z.object({
    body: z.object({
        unit_name: z.string().min(1, {message: "enter unit name minimum 1 character"}).max(50, {message: "enter unit name maximum 50 character"}),
    })
})

export const UpdateSchema = z.object({
    params: z.object({ unit_id: z.string().min(1, {message: "enter unit id minimum 1 character"}).max(50, {message: "enter unit id maximum 50 character"}), }),
    body: z.object({
        unit_name: z.string().min(1, {message: "enter unit name minimum 1 character"}).max(50, {message: "enter unit name maximum 50 character"}).optional(),
    })
})

export const DeleteSchema = z.object({
    params: z.object({
        unit_id: z.string().min(1, {message: "enter unit id minimum 1 character"}).max(50, {message: "enter unit id maximum 50 character"}),
    })
})

export const GetByIdSchema = z.object({
    params: z.object({
        unit_id: z.string().min(1, {message: "enter unit id minimum 1 character"}).max(50, {message: "enter unit id maximum 50 character"}),
    })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().min(1, {message: "enter page minimum 1 "}).max(100, {message: "enter page maximum 100 "}).optional(),
        limit: z.string().min(1, {message: "enter page minimum 1 "}).max(50, {message: "enter page maximum 100 "}).optional(),
        search: z.string().optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});

