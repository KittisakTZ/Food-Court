import { z } from "zod";

export type TypePayloadCustomer = {
    customer_code: string;
    customer_name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    country_id?: string | null;
    province_id?: string | null;
    district_id?: string | null;
    postal_code?: string | null;
    remark?: string | null;
    created_by?: string;
    updated_by?: string;
};

export const CreateSchema = z.object({
    body: z.object({
        customer_code: z.string({ required_error: "Customer Code is required" }).min(1, { message: "Customer Code is required" }).max(20, { message: "Customer Code must be 20 characters or less" }),
        customer_name: z.string({ required_error: "Customer Name is required" }).min(1, { message: "Customer Name is required" }).max(100, { message: "Customer Name must be 100 characters or less" }),
        email: z.string().email({ message: "Invalid email format" }).max(50, { message: "Email must be 50 characters or less" }).optional().nullable(),
        phone: z.string().max(20, { message: "Phone must be 20 characters or less" }).optional().nullable(),
        address: z.string().max(255, { message: "Address must be 255 characters or less" }).optional().nullable(),
        country_id: z.string().uuid({ message: "Invalid Country ID format" }).optional().nullable(),
        province_id: z.string().uuid({ message: "Invalid Province ID format" }).optional().nullable(),
        district_id: z.string().uuid({ message: "Invalid District ID format" }).optional().nullable(),
        postal_code: z.string().max(10, { message: "Postal Code must be 10 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ customer_id: z.string().uuid({ message: "Invalid Customer ID format" }) }),
    body: z.object({
        customer_code: z.string().min(1, { message: "Customer Code cannot be empty" }).max(20, { message: "Customer Code must be 20 characters or less" }).optional(),
        customer_name: z.string().min(1, { message: "Customer Name cannot be empty" }).max(100, { message: "Customer Name must be 100 characters or less" }).optional(),
        email: z.string().email({ message: "Invalid email format" }).max(50, { message: "Email must be 50 characters or less" }).optional().nullable(),
        phone: z.string().max(20, { message: "Phone must be 20 characters or less" }).optional().nullable(),
        address: z.string().max(255, { message: "Address must be 255 characters or less" }).optional().nullable(),
        country_id: z.string().uuid({ message: "Invalid Country ID format" }).optional().nullable(),
        province_id: z.string().uuid({ message: "Invalid Province ID format" }).optional().nullable(),
        district_id: z.string().uuid({ message: "Invalid District ID format" }).optional().nullable(),
        postal_code: z.string().max(10, { message: "Postal Code must be 10 characters or less" }).optional().nullable(),
        remark: z.string().optional().nullable(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ customer_id: z.string().uuid({ message: "Customer ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ customer_id: z.string().uuid({ message: "Customer ID is required and must be a valid UUID" }) })
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
        searchField: z.enum(['customer_code', 'customer_name', 'email', 'phone', 'address']).optional()
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
    searchField?: 'customer_code' | 'customer_name' | 'email' | 'phone' | 'address';
}