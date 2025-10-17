import { ms_waste_product, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadWasteProduct, Filter } from "@modules/ms_waste_product/wasteProductModel";

export const Keys: (keyof ms_waste_product)[] = [
    "waste_product_id", "waste_product_code", "waste_product_name", "description",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const wasteProductRepository = {
    findByCode: async (waste_product_code: string) => {
        return prisma.ms_waste_product.findUnique({
            where: { waste_product_code: waste_product_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_waste_productWhereInput = {
            ...(searchText && {
                OR: [
                    { waste_product_code: { contains: searchText, mode: 'insensitive' } },
                    { waste_product_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_waste_product.count({ where });
    },


    findById: async <Key extends keyof ms_waste_product>(
        waste_product_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_waste_product.findUnique({
            where: { waste_product_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_waste_product, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_waste_productWhereInput = {
            ...(searchText && {
                OR: [
                    { waste_product_code: { contains: searchText, mode: 'insensitive' } },
                    { waste_product_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_waste_product.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadWasteProduct, employee_id: string) => {
        return await prisma.ms_waste_product.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (waste_product_id: string, payload: Partial<TypePayloadWasteProduct>, employee_id: string) => {
        return await prisma.ms_waste_product.update({
            where: { waste_product_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (waste_product_id: string) => {
        return await prisma.ms_waste_product.delete({
            where: { waste_product_id },
        });
    }
};