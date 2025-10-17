import { Character } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadShipType } from "@modules/ms_ship_type/shipTypeModel";

export const shipTypeRepository = {

    findByname : async (ship_type_name: string) => {
        ship_type_name = ship_type_name.trim();
        return prisma.ms_ship_type.findFirst({
            where: { ship_type_name : ship_type_name }, 
        });
    },
    count: async (searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_ship_type.count({
            where: {
                ...(searchText
                    && {
                        OR: [
                            {
                                ship_type_name: {
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
        ship_type_id : string,
    ) => {
        ship_type_id = ship_type_id.trim();
        return await prisma.ms_ship_type.findUnique({
            where: { ship_type_id: ship_type_id },
            select: {
                ship_type_name: true,
            },
        }) ;
    },

    fineAllAsync : async (skip: number , take: number , searchText: string) => {
        return await prisma.ms_ship_type.findMany({
            where: {...(searchText 
                && {
                    OR : [{
                        ship_type_name : {
                            contains: searchText,
                            mode: 'insensitive' // คือการค้นหาที่ไม่สนใจตัวพิมพ์เล็กหรือใหญ่
                        }
                    }]
                } )},
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                ship_type_id: true,
                ship_type_name: true,
            },
            orderBy: { created_at: 'asc' },
        });
    },

    

    update: async (
        ship_type_id : string,
        payload: TypePayloadShipType,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadShipType;
        ship_type_id = ship_type_id.trim();
        employee_id = employee_id.trim();

        return await prisma.ms_ship_type.update({
            where: { ship_type_id: ship_type_id },
            data: {
                ship_type_name: setForm.ship_type_name,
                updated_by: employee_id,
            }
        });
    },
    create: async (
        payload: TypePayloadShipType,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadShipType;
        employee_id = employee_id.trim();
          
        return await prisma.ms_ship_type.create({
            data: {
                ship_type_name : setForm.ship_type_name,
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    delete: async (ship_type_id: string) => {
        ship_type_id = ship_type_id.trim();
        return await prisma.ms_ship_type.delete({
            where: { ship_type_id: ship_type_id },
        });
    }
}