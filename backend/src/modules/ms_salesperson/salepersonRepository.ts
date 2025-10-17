import { Prisma, ms_saleperson } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadSaleperson, Filter } from "@modules/ms_salesperson/salepersonModel";

export const Keys: (keyof ms_saleperson)[] = [
    "saleperson_id", "saleperson_code", "first_name", "last_name", "position", 
    "email", "phone", "remark", "created_at", "created_by", "updated_at", "updated_by"
];

export const salepersonRepository = {
    findByCode: async (saleperson_code: string) => {
        return prisma.ms_saleperson.findUnique({ where: { saleperson_code: saleperson_code.trim() } });
    },
    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_salepersonWhereInput = {
            ...(searchText && {
                OR: [
                    { saleperson_code: { contains: searchText, mode: 'insensitive' } },
                    { first_name: { contains: searchText, mode: 'insensitive' } },
                    { last_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_saleperson.count({ where });
    },
    findById: async <Key extends keyof ms_saleperson>(saleperson_id: string, keys: Key[] = Keys as Key[]) => {
        return await prisma.ms_saleperson.findUnique({
            where: { saleperson_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_saleperson, Key> | null>;
    },
    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_salepersonWhereInput = {
            ...(searchText && {
                OR: [
                    { saleperson_code: { contains: searchText, mode: 'insensitive' } },
                    { first_name: { contains: searchText, mode: 'insensitive' } },
                    { last_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_saleperson.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },
    create: async (payload: TypePayloadSaleperson, employee_id: string) => {
        return await prisma.ms_saleperson.create({ data: { ...payload, created_by: employee_id, updated_by: employee_id } });
    },
    update: async (saleperson_id: string, payload: Partial<TypePayloadSaleperson>, employee_id: string) => {
        return await prisma.ms_saleperson.update({ where: { saleperson_id }, data: { ...payload, updated_by: employee_id } });
    },
    delete: async (saleperson_id: string) => {
        return await prisma.ms_saleperson.delete({ where: { saleperson_id } });
    }
};