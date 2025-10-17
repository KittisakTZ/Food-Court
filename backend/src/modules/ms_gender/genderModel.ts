import { z } from "zod";

export type TypePayloadGender = {
    gender_code: string;
    gender_name: string;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        gender_code: z.string({ required_error: "Gender Code is required" }).min(1, { message: "Gender Code is required" }).max(10, { message: "Code must be 10 characters or less" }),
        gender_name: z.string({ required_error: "Gender Name is required" }).min(1, { message: "Gender Name is required" }).max(20, { message: "Name must be 20 characters or less" }),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ gender_id: z.string().uuid({ message: "Invalid Gender ID format" }) }),
    body: z.object({
        gender_code: z.string().min(1, { message: "Code cannot be empty" }).max(10, { message: "Code must be 10 characters or less" }).optional(),
        gender_name: z.string().min(1, { message: "Name cannot be empty" }).max(20, { message: "Name must be 20 characters or less" }).optional(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ gender_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ gender_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
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
        searchField: z.enum(['gender_code', 'gender_name']).optional()
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
    searchField?: 'gender_code' | 'gender_name';
}