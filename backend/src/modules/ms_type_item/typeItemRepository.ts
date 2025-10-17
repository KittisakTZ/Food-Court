import { Character } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadTypeItem } from "@modules/ms_type_item/typeItemModel";
import { select } from "@common/models/selectData";


export const Keys = [
    "type_item_id",
    "type_item_name",
    "type_item_description",
]

export const typeItemRepository = {

    findByname : async (type_item_name: string) => {
        type_item_name = type_item_name.trim();
        return prisma.ms_type_item.findFirst({
            where: { type_item_name : type_item_name }, 
        });
    },
    count: async (searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_type_item.count({
            where: {
                ...(searchText
                    && {
                        OR: [
                            {
                                type_item_name: {
                                    contains: searchText,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    })
            },
        });
    },
    findById: async (
        type_item_id : string,
    ) => {
        type_item_id = type_item_id.trim();
        return await prisma.ms_type_item.findUnique({
            where: { type_item_id: type_item_id },
            select: {
                type_item_name: true,
                type_item_description: true,
                group_item: {select: { group_item_id: true , group_item_name: true }},
            },
        }) ;
    },

    fineAllAsync : async (skip: number , take: number , searchText: string) => {
        return await prisma.ms_type_item.findMany({
            where: {...(searchText 
                && {
                    OR : [{
                        type_item_name : {
                            contains: searchText,
                            mode: 'insensitive' // คือการค้นหาที่ไม่สนใจตัวพิมพ์เล็กหรือใหญ่
                        }
                    }]
                } )},
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                type_item_id: true,
                type_item_name: true,
                type_item_description: true,
                group_item: {select: { group_item_id: true , group_item_name: true }},
            },
            orderBy: { created_at: 'asc' },
        });
    },

    

    update: async (
        type_item_id : string,
        payload: TypePayloadTypeItem,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadTypeItem;
        type_item_id = type_item_id.trim();
        employee_id = employee_id.trim();

        return await prisma.ms_type_item.update({
            where: { type_item_id: type_item_id },
            data: {
                group_item_id: setForm.group_item_id,
                type_item_name: setForm.type_item_name,
                type_item_description: setForm.type_item_description,
                updated_by: employee_id,
            }
        });
    },
    create: async (
        payload: TypePayloadTypeItem,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadTypeItem;
        employee_id = employee_id.trim();
          
        return await prisma.ms_type_item.create({
            data: {
                group_item_id: setForm.group_item_id,
                type_item_name : setForm.type_item_name,
                type_item_description: setForm.type_item_description,
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    delete: async (type_item_id: string) => {
        type_item_id = type_item_id.trim();
        return await prisma.ms_type_item.delete({
            where: { type_item_id: type_item_id },
        });
    }
}