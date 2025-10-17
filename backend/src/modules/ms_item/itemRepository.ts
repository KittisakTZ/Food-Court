import prisma from "@src/db";
import { TypePayloadItem } from "@modules/ms_item/itemModel";
import { generateNumber , convertDecimalToNumber } from '@common/models/createCode';
const fs = require('fs');


export const itemRepository = {

    findByname : async (item_name: string) => {
        item_name = item_name.trim();
        return prisma.ms_item.findFirst({
            where: { item_name : item_name }, 
        });
    },
    
    count: async (searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_item.count({
            where: {
                ...(searchText
                    && {
                        OR: [
                            {
                                item_name: {
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

    findById: async (
        item_id : string,
    ) => {
        item_id = item_id.trim();
        return convertDecimalToNumber(await prisma.ms_item.findUnique({
            where: { item_id: item_id },
            select: {
                item_code: true,
                item_name: true,
                item_description: true,
                additional_note: true,
                group_item: { select: { group_item_id: true , group_item_name: true }},
                type_item: { select : { type_item_id: true, type_item_name: true }},
                unit: { select : { unit_id: true, unit_name: true }},
                item_price: true,
                item_file: true,
            },
        })) ;
    },

    fineAllAsync : async (skip: number , take: number , searchText: string) => {
        return convertDecimalToNumber(await prisma.ms_item.findMany({
            where: {...(searchText 
                && {
                    OR : [{
                        item_name : {
                            contains: searchText,
                            mode: 'insensitive'
                        }
                    }]
                } )},
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                item_id: true,
                item_code: true,
                item_name: true,
                item_description: true,
                group_item: { select: { group_item_id: true , group_item_name: true }},
                type_item: { select : { type_item_id: true, type_item_name: true }},
                unit: { select : { unit_id: true, unit_name: true }},
                item_price: true,
            },
            orderBy: { created_at: 'asc' },
        }));
    },

    update: async (
        item_id : string,
        payload: TypePayloadItem,
        employee_id: string,
        files: Express.Multer.File[]
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadItem;
        item_id = item_id.trim();
        employee_id = employee_id.trim();

        const existing = await prisma.ms_item.findFirst({where: {item_id}});

        if (Array.isArray(existing?.item_file)) {
            existing.item_file.forEach((item) => {
                const filePath = `src${(item as { item_file: string }).item_file}`;
                fs.unlink(filePath, (err: Error) => {
                if (err) console.log(`ไม่พบไฟล์: ${filePath}`, err);
                });
            });
        };

        return await prisma.ms_item.update({
            where: { item_id: item_id },
            data: {
                item_name: setForm.item_name,
                item_description: setForm.item_description,
                additional_note: setForm.additional_note,
                group_item_id: setForm.group_item_id,
                type_item_id: setForm.type_item_id,
                unit_id: setForm.unit_id,
                item_price: setForm.item_price,
                item_file: files.map(file => ({ "item_file_url": `/uploads/item/${file.filename}`})),
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    create: async (
        payload: TypePayloadItem,
        employee_id: string,
        files: Express.Multer.File[]
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadItem;
        employee_id = employee_id.trim();

        const generateItemCode = await generateNumber("ms_item");
          
        return await prisma.ms_item.create({
            data: {
                item_code : "SKU" + generateItemCode,
                item_name: setForm.item_name,
                item_description: setForm.item_description,
                additional_note: setForm.additional_note,
                group_item_id: setForm.group_item_id,
                type_item_id: setForm.type_item_id,
                unit_id: setForm.unit_id,
                item_price: setForm.item_price,
                item_file: files.map(file => ({ "item_file_url": `/uploads/item/${file.filename}`})),
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    delete: async (item_id: string) => {
        item_id = item_id.trim();
        const deleteItem = await prisma.ms_item.delete({
            where: { item_id: item_id },
        });

        if (Array.isArray(deleteItem?.item_file)) {
            deleteItem.item_file.forEach((item) => {
                const filePath = `src${(item as { item_file: string }).item_file}`;
                fs.unlink(filePath, (err: Error) => {
                if (err) console.log(`ไม่พบไฟล์: ${filePath}`, err);
                });
            });
        };
        return deleteItem;
    }
}