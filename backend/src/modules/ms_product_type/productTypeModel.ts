import { z } from "zod";

export type TypePayloadProductType = {
    product_type_code: string;
    product_type_name: string;
    remark?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        product_type_code: z.string({ required_error: "Product Type Code is required" }).min(1, { message: "Product Type Code is required" }).max(20, { message: "Code must be 20 characters or less" }),
        product_type_name: z.string({ required_error: "Product Type Name is required" }).min(1, { message: "Product Type Name is required" }).max(100, { message: "Name must be 100 characters or less" }),
        remark: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ product_type_id: z.string().uuid({ message: "Invalid Product Type ID format" }) }),
    body: z.object({
        product_type_code: z.string().min(1, { message: "Code cannot be empty" }).max(20, { message: "Code must be 20 characters or less" }).optional(),
        product_type_name: z.string().min(1, { message: "Name cannot be empty" }).max(100, { message: "Name must be 100 characters or less" }).optional(),
        remark: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ product_type_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ product_type_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
    }),
    body: z.object({
        operator: z.enum(['contains', 'startsWith', 'endsWith', 'equals']).optional(),
        searchCol: z.string().optional(),
        searchField: z.enum(['product_type_code', 'product_type_name', 'remark']).optional()
    }).optional()
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});

export type Filter = {
    operator?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
    searchCol?: string;
    searchField?: 'product_type_code' | 'product_type_name' | 'remark';
}