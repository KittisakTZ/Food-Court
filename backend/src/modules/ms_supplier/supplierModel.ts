import { z } from "zod";

export type TypePayloadSupplier = {
    supplier_code : string;
    sale_name_th : string;
    sale_name_en? : string;
    supplier_type : boolean;
    // supplier_picture : string;
    supplier_address : string;
    supplier_phone_main : string;
    supplier_fax? : string;
    supplier_contact_name : string;
    supplier_contact_phone : string;
    supplier_contact_email : string;
    supplier_remark? : string;

    supplier_detail?: {
        production_step_id : string;
    }[];
}

export const CreateSchema = z.object({
    body: z.object({
        ship_type_name: z.string().min(1, {message: "enter ship type name minimum 1 character"}).max(50, {message: "enter ship type name maximum 50 character"}),
    })
})

export const UpdateSchema = z.object({
    params: z.object({ ship_type_id: z.string().min(1, {message: "enter ship type id minimum 1 character"}).max(50, {message: "enter ship type id maximum 50 character"}) }),
    body: z.object({
        ship_type_name: z.string().min(1, {message: "enter ship type name minimum 1 character"}).max(50, {message: "enter ship type name maximum 50 character"}).optional(),
    })
})

export const DeleteSchema = z.object({
    params: z.object({
        ship_type_id: z.string().min(1, {message: "enter ship type id minimum 1 character"}).max(50, {message: "enter ship type id maximum 50 character"}),
    })
})

export const GetByIdSchema = z.object({
    params: z.object({
        ship_type_id: z.string().min(1, {message: "enter ship type id minimum 1 character"}).max(50, {message: "enter ship type id minimum 50 character"}),
    })
});

export const GetAllSchema = z.object({
    query: z.object({
        page: z.string().min(1, {message: "enter page minimum 1"}).max(100, {message: "enter page maximum 100 "}).optional(),
        limit: z.string().min(1, {message: "enter page minimum 1"}).max(50, {message: "enter limit maximum 50 "}).optional(),
        search: z.string().optional(),
    })
});

export const SelectSchema = z.object({
    query: z.object({
        search: z.string().optional(),
    })
});

