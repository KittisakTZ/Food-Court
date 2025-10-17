import { z } from "zod";

export type TypePayloadWasteProduct = {
    waste_product_code: string;
    waste_product_name: string;
    description?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        waste_product_code: z.string({ required_error: "Waste Product Code is required" }).min(1, { message: "Waste Product Code is required" }).max(20, { message: "Code must be 20 characters or less" }),
        waste_product_name: z.string({ required_error: "Waste Product Name is required" }).min(1, { message: "Waste Product Name is required" }).max(100, { message: "Name must be 100 characters or less" }),
        description: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ waste_product_id: z.string().uuid({ message: "Invalid Waste Product ID format" }) }),
    body: z.object({
        waste_product_code: z.string().min(1, { message: "Code cannot be empty" }).max(20, { message: "Code must be 20 characters or less" }).optional(),
        waste_product_name: z.string().min(1, { message: "Name cannot be empty" }).max(100, { message: "Name must be 100 characters or less" }).optional(),
        description: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ waste_product_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ waste_product_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
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
        searchField: z.enum(['waste_product_code', 'waste_product_name', 'description']).optional()
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
    searchField?: 'waste_product_code' | 'waste_product_name' | 'description';
}