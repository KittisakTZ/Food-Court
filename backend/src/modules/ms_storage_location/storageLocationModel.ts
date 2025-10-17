import { z } from "zod";

export type TypePayloadStorageLocation = {
    storage_location_code: string;
    warehouse_id: string;
    name_th: string;
    name_en?: string | null;
    remark?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        storage_location_code: z.string({ required_error: "Storage Location Code is required" }).min(1, { message: "Code is required" }).max(20, { message: "Code must be 20 characters or less" }),
        warehouse_id: z.string({ required_error: "Warehouse ID is required" }).uuid({ message: "Invalid Warehouse ID format" }),
        name_th: z.string({ required_error: "Thai Name is required" }).min(1, { message: "Thai Name is required" }).max(100, { message: "Thai Name must be 100 characters or less" }),
        name_en: z.string().max(100, { message: "English Name must be 100 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ storage_location_id: z.string().uuid({ message: "Invalid Storage Location ID format" }) }),
    body: z.object({
        storage_location_code: z.string().min(1, { message: "Code cannot be empty" }).max(20, { message: "Code must be 20 characters or less" }).optional(),
        warehouse_id: z.string().uuid({ message: "Invalid Warehouse ID format" }).optional(),
        name_th: z.string().min(1, { message: "Thai Name cannot be empty" }).max(100, { message: "Thai Name must be 100 characters or less" }).optional(),
        name_en: z.string().max(100, { message: "English Name must be 100 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ storage_location_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ storage_location_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        warehouseId: z.string().uuid({ message: "Invalid Warehouse ID format" }).optional(),
    }),
    body: z.object({
        operator: z.enum(['contains', 'startsWith', 'endsWith', 'equals']).optional(),
        searchCol: z.string().optional(),
        searchField: z.enum(['storage_location_code', 'name_th', 'name_en', 'remark']).optional()
    }).optional()
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        warehouseId: z.string().uuid({ message: "Invalid Warehouse ID format" }).optional(),
    })
});

export type Filter = {
    operator?: 'contains' | 'startsWith' | 'endsWith' | 'equals';
    searchCol?: string;
    searchField?: 'storage_location_code' | 'name_th' | 'name_en' | 'remark';
}