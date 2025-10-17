import { ms_gender, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadGender, Filter } from "@modules/ms_gender/genderModel";

export const Keys: (keyof ms_gender)[] = [
    "gender_id", "gender_code", "gender_name",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const genderRepository = {
    findByCode: async (gender_code: string) => {
        return prisma.ms_gender.findUnique({
            where: { gender_code: gender_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_genderWhereInput = {
            ...(searchText && {
                OR: [
                    { gender_code: { contains: searchText, mode: 'insensitive' } },
                    { gender_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_gender.count({ where });
    },

    findById: async <Key extends keyof ms_gender>(
        gender_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_gender.findUnique({
            where: { gender_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_gender, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_genderWhereInput = {
            ...(searchText && {
                OR: [
                    { gender_code: { contains: searchText, mode: 'insensitive' } },
                    { gender_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_gender.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadGender, employee_id: string) => {
        return await prisma.ms_gender.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (gender_id: string, payload: Partial<TypePayloadGender>, employee_id: string) => {
        return await prisma.ms_gender.update({
            where: { gender_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (gender_id: string) => {
        return await prisma.ms_gender.delete({
            where: { gender_id },
        });
    }
};