import { z } from "zod";

export type TypePayloadSaleperson = {
    saleperson_code: string;
    first_name: string;
    last_name: string;
    position?: string | null;
    email?: string | null;
    phone?: string | null;
    remark?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        saleperson_code: z.string({ required_error: "Saleperson Code is required" }).min(1, { message: "Saleperson Code is required" }).max(20, { message: "Saleperson Code must be 20 characters or less" }),
        first_name: z.string({ required_error: "First Name is required" }).min(1, { message: "First Name is required" }).max(50, { message: "First Name must be 50 characters or less" }),
        last_name: z.string({ required_error: "Last Name is required" }).min(1, { message: "Last Name is required" }).max(50, { message: "Last Name must be 50 characters or less" }),
        position: z.string().max(200, { message: "Position must be 200 characters or less" }).optional().nullable(),
        email: z.string().email({ message: "Invalid email format" }).max(50, { message: "Email must be 50 characters or less" }).optional().nullable(),
        phone: z.string().max(20, { message: "Phone must be 20 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ saleperson_id: z.string().uuid({ message: "Invalid Saleperson ID format" }) }),
    body: z.object({
        saleperson_code: z.string().min(1, { message: "Saleperson Code cannot be empty" }).max(20, { message: "Saleperson Code must be 20 characters or less" }).optional(),
        first_name: z.string().min(1, { message: "First Name cannot be empty" }).max(50, { message: "First Name must be 50 characters or less" }).optional(),
        last_name: z.string().min(1, { message: "Last Name cannot be empty" }).max(50, { message: "Last Name must be 50 characters or less" }).optional(),
        position: z.string().max(200, { message: "Position must be 200 characters or less" }).optional().nullable(),
        email: z.string().email({ message: "Invalid email format" }).max(50, { message: "Email must be 50 characters or less" }).optional().nullable(),
        phone: z.string().max(20, { message: "Phone must be 20 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ saleperson_id: z.string().uuid({ message: "Saleperson ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ saleperson_id: z.string().uuid({ message: "Saleperson ID is required and must be a valid UUID" }) })
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
        searchField: z.enum(['saleperson_code', 'first_name', 'last_name', 'position', 'email', 'phone']).optional()
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
    searchField?: 'saleperson_code' | 'first_name' | 'last_name' | 'position' | 'email' | 'phone';
}