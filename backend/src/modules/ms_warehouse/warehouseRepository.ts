import { ms_warehouse, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadWarehouse, Filter } from "@modules/ms_warehouse/warehouseModel";

export const Keys: (keyof ms_warehouse)[] = [
    "warehouse_id", "warehouse_code", "name_th", "name_en", "remark",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const warehouseRepository = {
    findByCode: async (warehouse_code: string) => {
        return prisma.ms_warehouse.findUnique({
            where: { warehouse_code: warehouse_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_warehouseWhereInput = {
            ...(searchText && {
                OR: [
                    { warehouse_code: { contains: searchText, mode: 'insensitive' } },
                    { name_th: { contains: searchText, mode: 'insensitive' } },
                    { name_en: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_warehouse.count({ where });
    },

    // เพิ่มฟังก์ชันสำหรับนับ storage location ที่ผูกกับ warehouse
    countRelatedStorageLocations: async (warehouse_id: string) => {
        return prisma.ms_storage_location.count({
            where: { warehouse_id }
        });
    },

    findById: async <Key extends keyof ms_warehouse>(
        warehouse_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_warehouse.findUnique({
            where: { warehouse_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_warehouse, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_warehouseWhereInput = {
            ...(searchText && {
                OR: [
                    { warehouse_code: { contains: searchText, mode: 'insensitive' } },
                    { name_th: { contains: searchText, mode: 'insensitive' } },
                    { name_en: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_warehouse.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadWarehouse, employee_id: string) => {
        return await prisma.ms_warehouse.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (warehouse_id: string, payload: Partial<TypePayloadWarehouse>, employee_id: string) => {
        return await prisma.ms_warehouse.update({
            where: { warehouse_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (warehouse_id: string) => {
        return await prisma.ms_warehouse.delete({
            where: { warehouse_id },
        });
    }
};