import { Character } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadUnit ,Filter } from "@modules/ms_unit/unitModel";
import { Prisma } from '@prisma/client';


export const Keys = [
    "unit_id",
    "unit_name",
    "unit_description",
]

export const unitRepository = {

    findByname : async (unit_name: string) => {
        unit_name = unit_name.trim();
        return prisma.ms_unit.findFirst({
            where: { unit_name : unit_name }, 
        });
    },
    count: async ( payload: Filter , searchText?: string) => {
        searchText = searchText?.trim();
        return await prisma.ms_unit.count({
            where: {...(searchText 
                && {
                    OR : [{
                        unit_name : {
                            contains: searchText,
                            mode: 'insensitive'
                        }
                    }]
                } ),
                AND: [
                    ...( payload.operator && payload.searchCol
                    ? [
                          {
                              unit_name: {
                                  ...({[payload.operator ]: payload.searchCol , mode: 'insensitive', } as Prisma.StringFilter),
                              },
                          },
                      ]
                    : []),
                ],
            },
        });
    },
    findById: async (
        unit_id : string,
    ) => {
        unit_id = unit_id.trim();
        return await prisma.ms_unit.findUnique({
            where: { unit_id: unit_id },
            select: {
                unit_name: true,
            },
        }) ;
    },

    fineAllAsync : async (skip: number , take: number , searchText: string , payload: Filter) => {
        return await prisma.ms_unit.findMany({
            where: {...(searchText 
                && {
                    OR : [{
                        unit_name : {
                            contains: searchText,
                            mode: 'insensitive'
                        }
                    }]
                } ),
                AND: [
                    ...( payload.operator && payload.searchCol
                    ? [
                          {
                              unit_name: {
                                  ...({[payload.operator ]: payload.searchCol , mode: 'insensitive', } as Prisma.StringFilter),
                              },
                          },
                      ]
                    : []),
                ],
            },
            skip: (skip - 1 ) * take,
            take: take,
            select: {
                unit_id: true,
                unit_name: true,
            },
            orderBy: { created_at: 'asc' },
        });
    },

    

    update: async (
        unit_id : string,
        payload: TypePayloadUnit,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadUnit;
        unit_id = unit_id.trim();
        employee_id = employee_id.trim();

        return await prisma.ms_unit.update({
            where: { unit_id: unit_id },
            data: {
                unit_name: setForm.unit_name,
                updated_by: employee_id,
            }
        });
    },
    create: async (
        payload: TypePayloadUnit,
        employee_id: string,
    ) => {
        const setForm = Object.fromEntries(
            Object.entries(payload).map(([key,value]) => [
                key,
                typeof value === 'string' ? value.trim() : value    
            ])
        ) as TypePayloadUnit;
        employee_id = employee_id.trim();
          
        return await prisma.ms_unit.create({
            data: {
                unit_name : setForm.unit_name,
                created_by: employee_id,
                updated_by: employee_id,
            }
        });
    },
    delete: async (unit_id: string) => {
        unit_id = unit_id.trim();
        return await prisma.ms_unit.delete({
            where: { unit_id: unit_id },
        });
    }
}