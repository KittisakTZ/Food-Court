import { ms_production_step, Prisma } from "@prisma/client"; 
import prisma from "@src/db";
import { TypePayloadProductionStep, Filter } from "@modules/ms_production_step/productionStepModel";

export const Keys: (keyof ms_production_step)[] = [
    "step_id", "step_code", "step_name", "description", "remark",
    "created_at", "created_by", "updated_at", "updated_by"
];

export const productionStepRepository = {
    findByCode: async (step_code: string) => {
        return prisma.ms_production_step.findUnique({
            where: { step_code: step_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_production_stepWhereInput = {
            ...(searchText && {
                OR: [
                    { step_code: { contains: searchText, mode: 'insensitive' } },
                    { step_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_production_step.count({ where });
    },

    findById: async <Key extends keyof ms_production_step>(
        step_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_production_step.findUnique({
            where: { step_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_production_step, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_production_stepWhereInput = {
            ...(searchText && {
                OR: [
                    { step_code: { contains: searchText, mode: 'insensitive' } },
                    { step_name: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_production_step.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadProductionStep, employee_id: string) => {
        return await prisma.ms_production_step.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (step_id: string, payload: Partial<TypePayloadProductionStep>, employee_id: string) => {
        return await prisma.ms_production_step.update({
            where: { step_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (step_id: string) => {
        return await prisma.ms_production_step.delete({
            where: { step_id },
        });
    }
};