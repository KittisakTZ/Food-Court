import { Character } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadGroupItem } from "@modules/ms_group_item/groupItemModel";


export const Keys = [
    "group_item_id",
    "group_item_name",
    "group_item_description",
]

export const groupItemRepository = {

    findByname : async (group_item_name: string) => {
        group_item_name = group_item_name.trim();
        return prisma.ms_group_item.findFirst({
            where: { group_item_name : group_item_name }, 
        });
    },
    count: async (searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_group_item.count({
            where: {
                ...(searchText
                    && {
                        OR: [
                            {
                                group_item_name: {
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
        group_item_id : string,
    ) => {
        group_item_id = group_item_id.trim();
        return await prisma.ms_group_item.findUnique({
            where: { group_item_id: group_item_id },
            select: {
                group_item_name: true,
                group_item_description: true
            },
        }) ;
    },

    fineAllAsync : async (skip: number , take: number , searchText: string) => {
        return await prisma.ms_group_item.findMany({
            where: {...(searchText 
                && {
                    OR : [{
                        group_item_name : {
                            contains: searchText,
                            mode: 'insensitive' // คือการค้นหาที่ไม่สนใจตัวพิมพ์เล็กหรือใหญ่
                        }
                    }]
                } )},
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                group_item_id: true,
                group_item_name: true,
                group_item_description: true
            },
            orderBy: { created_at: 'asc' },
        });
    },

    

    update: async (
        group_item_id : string,
        payload: TypePayloadGroupItem,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadGroupItem;
        group_item_id = group_item_id.trim();
        employee_id = employee_id.trim();

        return await prisma.ms_group_item.update({
            where: { group_item_id: group_item_id },
            data: {
                group_item_name: setForm.group_item_name,
                group_item_description: setForm.group_item_description,
                updated_by: employee_id,
            }
        });
    },
    create: async (
        payload: TypePayloadGroupItem,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadGroupItem;
        employee_id = employee_id.trim();
          
        return await prisma.ms_group_item.create({
            data: {
                group_item_name : setForm.group_item_name,
                group_item_description: setForm.group_item_description,
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    delete: async (group_item_id: string) => {
        group_item_id = group_item_id.trim();
        return await prisma.ms_group_item.delete({
            where: { group_item_id: group_item_id },
        });
    }
}