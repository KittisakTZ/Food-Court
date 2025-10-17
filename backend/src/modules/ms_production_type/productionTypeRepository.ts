import { ms_production_type, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadProductionType, Filter } from "@modules/ms_production_type/productionTypeModel";

export const Keys: (keyof ms_production_type)[] = [
    "production_type_id", "production_type_code", "production_type_name", "remark",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const productionTypeRepository = {
    findByCode: async (production_type_code: string) => {
        return prisma.ms_production_type.findUnique({
            where: { production_type_code: production_type_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_production_typeWhereInput = {
            ...(searchText && {
                OR: [
                    { production_type_code: { contains: searchText, mode: 'insensitive' } },
                    { production_type_name: { contains: searchText, mode: 'insensitive' } },
                ],
            }),
            AND: [
                ...(payload?.operator && payload.searchCol && payload.searchField
                    ? [{
                        [payload.searchField]: {
                            [payload.operator]: payload.searchCol,
                            mode: 'insensitive'
                        }
                    }]
                    : [])
            ]
        };
        return await prisma.ms_production_type.count({ where });
    },
    findById: async <Key extends keyof ms_production_type>(
        production_type_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_production_type.findUnique({
            where: { production_type_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_production_type, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_production_typeWhereInput = {
            ...(searchText && {
                OR: [
                    { production_type_code: { contains: searchText, mode: 'insensitive' } },
                    { production_type_name: { contains: searchText, mode: 'insensitive' } },
                ],
            }),
            AND: [
                ...(payload?.operator && payload.searchCol && payload.searchField
                    ? [{
                        [payload.searchField]: {
                            [payload.operator]: payload.searchCol,
                            mode: 'insensitive'
                        }
                    }]
                    : [])
            ]
        };
        return await prisma.ms_production_type.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadProductionType, employee_id: string) => {
        return await prisma.ms_production_type.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (production_type_id: string, payload: Partial<TypePayloadProductionType>, employee_id: string) => {
        return await prisma.ms_production_type.update({
            where: { production_type_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (production_type_id: string) => {
        return await prisma.ms_production_type.delete({
            where: { production_type_id },
        });
    }
};