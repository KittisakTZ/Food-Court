import { ms_storage_location, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadStorageLocation, Filter } from "@modules/ms_storage_location/storageLocationModel";

export const Keys: (keyof ms_storage_location)[] = [
    "storage_location_id", "storage_location_code", "warehouse_id", "name_th", "name_en", "remark",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const storageLocationRepository = {
    findByCode: async (storage_location_code: string) => {
        return prisma.ms_storage_location.findUnique({
            where: { storage_location_code: storage_location_code.trim() },
        });
    },

    count: async (searchText?: string, warehouseId?: string, payload?: Filter) => {
        const where: Prisma.ms_storage_locationWhereInput = {
            AND: [
                warehouseId ? { warehouse_id: warehouseId } : {},
                searchText ? {
                    OR: [
                        { storage_location_code: { contains: searchText, mode: 'insensitive' } },
                        { name_th: { contains: searchText, mode: 'insensitive' } },
                        { name_en: { contains: searchText, mode: 'insensitive' } },
                    ]
                } : {},
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
        return await prisma.ms_storage_location.count({ where });
    },

    findById: async <Key extends keyof ms_storage_location>(
        storage_location_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        // The return type of the awaited expression is what we cast.
        // It's not a Promise, it's the resolved value.
        return await prisma.ms_storage_location.findUnique({
            where: { storage_location_id },
            select: {
                ...keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
                warehouse: { select: { warehouse_id: true, name_th: true }} // Include warehouse name
            },
        // --- ส่วนที่แก้ไข: ลบ Promise<> ออกจากการ cast ---
        }) as (Pick<ms_storage_location, Key> & { warehouse: { warehouse_id: string, name_th: string } }) | null;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, warehouseId?: string, payload?: Filter) => {
        const where: Prisma.ms_storage_locationWhereInput = {
            AND: [
                warehouseId ? { warehouse_id: warehouseId } : {},
                searchText ? {
                    OR: [
                        { storage_location_code: { contains: searchText, mode: 'insensitive' } },
                        { name_th: { contains: searchText, mode: 'insensitive' } },
                        { name_en: { contains: searchText, mode: 'insensitive' } },
                    ]
                } : {},
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

        return await prisma.ms_storage_location.findMany({
            where,
            include: {
                warehouse: {
                    select: {
                        name_th: true,
                        warehouse_code: true
                    }
                }
            },
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadStorageLocation, employee_id: string) => {
        return await prisma.ms_storage_location.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (storage_location_id: string, payload: Partial<TypePayloadStorageLocation>, employee_id: string) => {
        return await prisma.ms_storage_location.update({
            where: { storage_location_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (storage_location_id: string) => {
        return await prisma.ms_storage_location.delete({
            where: { storage_location_id },
        });
    }
};