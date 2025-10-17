import { ms_customer } from "@prisma/client";
import prisma from "@src/db";
import { Prisma } from "@prisma/client";
import { TypePayloadCustomer, Filter} from "@modules/ms_customer/customerModel";

export const Keys: (keyof ms_customer)[] = [
    "customer_id", "customer_code", "customer_name", "email", "phone", 
    "address", "country_id", "province_id", "district_id", "postal_code", 
    "remark", "created_at", "created_by", "updated_at", "updated_by"
];

export const customerRepository = {
    findByCode: async (customer_code: string) => {
        return prisma.ms_customer.findUnique({
            where: { customer_code: customer_code.trim() },
        });
    },

    count: async (searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_customerWhereInput = {
            ...(searchText && {
                OR: [
                    { customer_code: { contains: searchText, mode: Prisma.QueryMode.insensitive } },
                    { customer_name: { contains: searchText, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: searchText, mode: Prisma.QueryMode.insensitive } },
                    { phone: { contains: searchText, mode: Prisma.QueryMode.insensitive } },
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
        return await prisma.ms_customer.count({ where });
    },

    findById: async <Key extends keyof ms_customer>(
        customer_id: string,
        keys: Key[] = Keys as Key[],
    ) => {
        return await prisma.ms_customer.findUnique({
            where: { customer_id },
            select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
        }) as Promise<Pick<ms_customer, Key> | null>;
    },

    findAllAsync: async (skip: number, take: number, searchText?: string, payload?: Filter) => {
        const where: Prisma.ms_customerWhereInput = {
            ...(searchText && {
                OR: [
                    { customer_code: { contains: searchText, mode: 'insensitive' } },
                    { customer_name: { contains: searchText, mode: 'insensitive' } },
                    { email: { contains: searchText, mode: 'insensitive' } },
                    { phone: { contains: searchText, mode: 'insensitive' } },
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
        return await prisma.ms_customer.findMany({
            where,
            skip: (skip - 1) * take,
            take: take,
            orderBy: { created_at: 'asc' },
        });
    },

    create: async (payload: TypePayloadCustomer, employee_id: string) => {
        return await prisma.ms_customer.create({
            data: { ...payload, created_by: employee_id, updated_by: employee_id }
        });
    },

    update: async (customer_id: string, payload: Partial<TypePayloadCustomer>, employee_id: string) => {
        return await prisma.ms_customer.update({
            where: { customer_id },
            data: { ...payload, updated_by: employee_id }
        });
    },

    delete: async (customer_id: string) => {
        return await prisma.ms_customer.delete({
            where: { customer_id },
        });
    }
};