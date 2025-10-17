import { z } from "zod";

export type TypePayloadProductionStep = {
    step_code: string;
    step_name: string;
    description?: string | null;
    remark?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        step_code: z.string({ required_error: "Step Code is required" }).min(1, { message: "Step Code is required" }).max(20, { message: "Step Code must be 20 characters or less" }),
        step_name: z.string({ required_error: "Step Name is required" }).min(1, { message: "Step Name is required" }).max(100, { message: "Step Name must be 100 characters or less" }),
        description: z.string().optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ step_id: z.string().uuid({ message: "Invalid Step ID format" }) }),
    body: z.object({
        step_code: z.string().min(1, { message: "Step Code cannot be empty" }).max(20, { message: "Step Code must be 20 characters or less" }).optional(),
        step_name: z.string().min(1, { message: "Step Name cannot be empty" }).max(100, { message: "Step Name must be 100 characters or less" }).optional(),
        description: z.string().optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ step_id: z.string().uuid({ message: "Step ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ step_id: z.string().uuid({ message: "Step ID is required and must be a valid UUID" }) })
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
        searchField: z.enum(['step_code', 'step_name', 'description', 'remark']).optional()
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
    searchField?: 'step_code' | 'step_name' | 'description' | 'remark';
}