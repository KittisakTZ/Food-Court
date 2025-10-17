import { ms_product_type, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadProductType, Filter } from "@modules/ms_product_type/productTypeModel";

export const Keys: (keyof ms_product_type)[] = [
    "product_type_id", "product_type_code", "product_type_name", "remark",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const productTypeRepository = {
    findByCode: async (product_type_code: string) => {
        return prisma.ms_product_type.findUnique({
            where: { product_type_code: product_type_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_product_typeWhereInput = {
            ...(searchText && {
                OR: [
                    { product_type_code: { contains: searchText, mode: 'insensitive' } },
                    { product_type_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_product_type.count({ where });
    },

    findById: async <Key extends keyof ms_product_type>(
        product_type_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_product_type.findUnique({
            where: { product_type_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_product_type, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_product_typeWhereInput = {
            ...(searchText && {
                OR: [
                    { product_type_code: { contains: searchText, mode: 'insensitive' } },
                    { product_type_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_product_type.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadProductType, employee_id: string) => {
        return await prisma.ms_product_type.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (product_type_id: string, payload: Partial<TypePayloadProductType>, employee_id: string) => {
        return await prisma.ms_product_type.update({
            where: { product_type_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (product_type_id: string) => {
        return await prisma.ms_product_type.delete({
            where: { product_type_id },
        });
    }
};