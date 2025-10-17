import { z } from "zod";

export type TypePayloadCountry = {
    country_code: string;
    country_name: string;
};

export const CreateSchema = z.object({
    body: z.object({
        country_code: z.string({ required_error: "Country Code is required" }).min(1, { message: "Country Code is required" }).max(10, { message: "Code must be 10 characters or less" }),
        country_name: z.string({ required_error: "Country Name is required" }).min(1, { message: "Country Name is required" }).max(100, { message: "Name must be 100 characters or less" }),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ country_id: z.string().uuid({ message: "Invalid Country ID format" }) }),
    body: z.object({
        country_code: z.string().min(1, { message: "Code cannot be empty" }).max(10, { message: "Code must be 10 characters or less" }).optional(),
        country_name: z.string().min(1, { message: "Name cannot be empty" }).max(100, { message: "Name must be 100 characters or less" }).optional(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ country_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ country_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});