import { z } from "zod";

export type TypePayloadProvince = {
    province_code: string;
    province_name: string;
    country_id: string;
};

export const CreateSchema = z.object({
    body: z.object({
        province_code: z.string({ required_error: "Province Code is required" }).min(1, { message: "Province Code is required" }).max(10, { message: "Code must be 10 characters or less" }),
        province_name: z.string({ required_error: "Province Name is required" }).min(1, { message: "Province Name is required" }).max(100, { message: "Name must be 100 characters or less" }),
        country_id: z.string({ required_error: "Country ID is required" }).uuid({ message: "Invalid Country ID format" }),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ province_id: z.string().uuid({ message: "Invalid Province ID format" }) }),
    body: z.object({
        province_code: z.string().min(1, { message: "Code cannot be empty" }).max(10, { message: "Code must be 10 characters or less" }).optional(),
        province_name: z.string().min(1, { message: "Name cannot be empty" }).max(100, { message: "Name must be 100 characters or less" }).optional(),
        country_id: z.string().uuid({ message: "Invalid Country ID format" }).optional(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ province_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ province_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        countryId: z.string().uuid({ message: "Invalid Country ID format" }).optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        countryId: z.string().uuid({ message: "Invalid Country ID format" }).optional(),
    })
});