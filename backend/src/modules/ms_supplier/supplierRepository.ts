import { Character } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadSupplier } from "@modules/ms_supplier/supplierModel";
const fs = require('fs');

export const supplierRepository = {

    findByCode : async (supplier_code: string) => {
        supplier_code = supplier_code.trim();
        return prisma.ms_supplier.findFirst({
            where: { supplier_code : supplier_code }, 
        });
    },
    count: async (searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_supplier.count({
            where: {
                ...(searchText
                    && {
                        OR: 
                        [
                            {
                                supplier_code: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                sale_name_th: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                sale_name_en: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            }, 
                            
                            {
                                supplier_phone_main: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_fax: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_name: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_phone: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_email: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    }
                )
            },
        });
    },

    fineAllAsync : async (skip: number , take: number , searchText: string) => {
        return await prisma.ms_supplier.findMany({
            where: {
                ...(searchText
                    && {
                        OR: 
                        [
                            {
                                supplier_code: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                sale_name_th: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                sale_name_en: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_phone_main: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_fax: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_name: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_phone: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                supplier_contact_email: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    }
                )
            },
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                supplier_code: true,
                sale_name_th: true,
                sale_name_en: true,
                supplier_type: true,
                supplier_picture: true,
                supplier_address: true,
                supplier_phone_main: true,
                supplier_fax: true,
                supplier_contact_name: true,
                supplier_contact_phone: true,
                supplier_contact_email: true,
                supplier_remark: true,
                supplier_detail: { 
                    select: { 
                        supplier_detail_id: true ,  
                        product_step:{ select: { step_id: true , step_name: true }}
                    }
                }
            },
            orderBy: { created_at: 'desc' },
        });
    },

    findById: async ( supplier_id : string,) => {
        supplier_id = supplier_id.trim();
        return await prisma.ms_supplier.findUnique({
            where: { supplier_id: supplier_id },
            select: {
                supplier_code: true,
                sale_name_th: true,
                sale_name_en: true,
                supplier_type: true,
                supplier_picture: true,
                supplier_address: true,
                supplier_phone_main: true,
                supplier_fax: true,
                supplier_contact_name: true,
                supplier_contact_phone: true,
                supplier_contact_email: true,
                supplier_remark: true,
                supplier_detail: { 
                    select: { 
                        supplier_detail_id: true ,  
                        product_step:{ select: { step_id: true , step_name: true }}
                    }
                }
            },
        }) ;
    },

    update: async (
        supplier_id : string,
        payload: TypePayloadSupplier,
        employee_id: string,
        files: Express.Multer.File[]
    ) => {
        const setFormNull: string[] = [];

        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => {
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                if (trimmed === '') setFormNull.push(key); // เก็บชื่อ key ไว้ลบภายหลัง
                    return [key, trimmed === '' ? null : trimmed];
                }
                return [key, value === undefined ? null : value];
            })
        ) as TypePayloadSupplier;

        setFormNull.forEach((key) => {
            if (!setForm[key as keyof typeof setForm]) {
                delete setForm[key as keyof typeof setForm];
            }
        });
        supplier_id = supplier_id.trim();
        employee_id = employee_id.trim();

        const check = await prisma.ms_supplier.findFirst({ where: { supplier_id } });

        if(files && files.length == 1){
            fs.unlink(`src${check?.supplier_picture}`, (err: Error) => {
                if (err) console.log("not found file", err);
            });
        }

        const supplier = await prisma.ms_supplier.update({
            where: { supplier_id: supplier_id },
            data: {
                supplier_code: setForm.supplier_code,
                sale_name_th: setForm.sale_name_th,
                sale_name_en: setForm.sale_name_en,
                supplier_type: setForm.supplier_type,
                supplier_picture: files && files.length == 1 ? `/uploads/supplier/${files[0].filename}` : null,
                supplier_address: setForm.supplier_address,
                supplier_phone_main: setForm.supplier_phone_main,
                supplier_fax: setForm.supplier_fax,
                supplier_contact_name: setForm.supplier_contact_name,
                supplier_contact_phone: setForm.supplier_contact_phone,
                supplier_contact_email: setForm.supplier_contact_email,
                supplier_remark: setForm.supplier_remark,
                updated_by: employee_id
            }
        });

        if(setForm.supplier_detail && setForm.supplier_detail.length > 0){
            await prisma.ms_supplier_detail.createMany({
                data: setForm.supplier_detail.map((item) => ({
                    supplier_id: supplier_id,
                    production_step_id: item.production_step_id,
                    created_by: employee_id
                }))
            });
        }

        return supplier;
    },
    create: async (
        payload: TypePayloadSupplier,
        employee_id: string,
        files: Express.Multer.File[]
    ) => {
        const setFormNull: string[] = [];

        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key, value]) => {
                if (typeof value === 'string') {
                    const trimmed = value.trim();
                if (trimmed === '') setFormNull.push(key); // เก็บชื่อ key ไว้ลบภายหลัง
                    return [key, trimmed === '' ? null : trimmed];
                }
                return [key, value === undefined ? null : value];
            })
        ) as TypePayloadSupplier;

        setFormNull.forEach((key) => {
            if (!setForm[key as keyof typeof setForm]) {
                delete setForm[key as keyof typeof setForm];
            }
        });
        employee_id = employee_id.trim();
          
        const supplier = await prisma.ms_supplier.create({
            data: {
                supplier_code: setForm.supplier_code,
                sale_name_th: setForm.sale_name_th,
                sale_name_en: setForm.sale_name_en,
                supplier_type: setForm.supplier_type,
                supplier_picture: files && files.length == 1 ? `/uploads/supplier/${files[0].filename}` : null,
                supplier_address: setForm.supplier_address,
                supplier_phone_main: setForm.supplier_phone_main,
                supplier_fax: setForm.supplier_fax,
                supplier_contact_name: setForm.supplier_contact_name,
                supplier_contact_phone: setForm.supplier_contact_phone,
                supplier_contact_email: setForm.supplier_contact_email,
                supplier_remark: setForm.supplier_remark,
                created_by: employee_id,
                updated_by: employee_id
            }
        });

        if(setForm.supplier_detail && setForm.supplier_detail.length > 0){
            await prisma.ms_supplier_detail.createMany({
                data: setForm.supplier_detail.map((item) => ({
                    supplier_id: supplier.supplier_id,
                    production_step_id: item.production_step_id,
                    created_by: employee_id
                }))
            });
        }

        return supplier;
    },
    delete: async (supplier_id: string) => {
        supplier_id = supplier_id.trim();
        await prisma.ms_supplier_detail.deleteMany({ where: { supplier_id }});
        return await prisma.ms_supplier.delete({ where: { supplier_id }});
    }
}