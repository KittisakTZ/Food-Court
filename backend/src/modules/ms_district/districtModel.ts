import { z } from "zod";

export type TypePayloadDistrict = {
    district_code: string;
    district_name: string;
    province_id: string;
};

export const CreateSchema = z.object({
    body: z.object({
        district_code: z.string({ required_error: "District Code is required" }).min(1, { message: "District Code is required" }).max(10, { message: "Code must be 10 characters or less" }),
        district_name: z.string({ required_error: "District Name is required" }).min(1, { message: "District Name is required" }).max(100, { message: "Name must be 100 characters or less" }),
        province_id: z.string({ required_error: "Province ID is required" }).uuid({ message: "Invalid Province ID format" }),
    })
});

export const UpdateSchema = z.object({
    params: z.object({ district_id: z.string().uuid({ message: "Invalid District ID format" }) }),
    body: z.object({
        district_code: z.string().min(1, { message: "Code cannot be empty" }).max(10, { message: "Code must be 10 characters or less" }).optional(),
        district_name: z.string().min(1, { message: "Name cannot be empty" }).max(100, { message: "Name must be 100 characters or less" }).optional(),
        province_id: z.string().uuid({ message: "Invalid Province ID format" }).optional(),
    })
});

export const GetByIdSchema = z.object({
    params: z.object({ district_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const DeleteSchema = z.object({
    params: z.object({ district_id: z.string().uuid({ message: "ID is required and must be a valid UUID" }) })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        provinceId: z.string().uuid({ message: "Invalid Province ID format" }).optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        provinceId: z.string().uuid({ message: "Invalid Province ID format" }).optional(),
    })
});