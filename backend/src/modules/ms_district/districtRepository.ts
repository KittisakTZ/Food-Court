import { ms_district, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadDistrict } from "@modules/ms_district/districtModel";

export const districtRepository = {
    findByCode: async (district_code: string) => {
        return prisma.ms_district.findUnique({ where: { district_code: district_code.trim() } });
    },
    findById: async (district_id: string) => {
        return prisma.ms_district.findUnique({
            where: { district_id },
            include: { province: { select: { province_name: true } } }
        });
    },
    count: async (searchText?: string, provinceId?: string) => {
        const where: Prisma.ms_districtWhereInput = {};
        if (provinceId) {
            where.province_id = provinceId;
        }
        if (searchText) {
            where.OR = [
                { district_code: { contains: searchText, mode: 'insensitive' } },
                { district_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_district.count({ where });
    },
    countRelatedRecords: async (district_id: string) => {
        // Only customers are related in this schema
        const customerCount = await prisma.ms_customer.count({ where: { district_id } });
        return customerCount;
    },
    findAllAsync: async (skip: number, take: number, searchText?: string, provinceId?: string) => {
        const where: Prisma.ms_districtWhereInput = {};
        if (provinceId) {
            where.province_id = provinceId;
        }
        if (searchText) {
            where.OR = [
                { district_code: { contains: searchText, mode: 'insensitive' } },
                { district_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_district.findMany({
            where,
            include: { province: { select: { province_name: true } } }, // Include province name
            skip: (skip - 1) * take,
            take: take,
            orderBy: { district_name: 'asc' }
        });
    },
    create: async (payload: TypePayloadDistrict) => {
        return await prisma.ms_district.create({ data: payload });
    },
    update: async (district_id: string, payload: Partial<TypePayloadDistrict>) => {
        return await prisma.ms_district.update({ where: { district_id }, data: payload });
    },
    delete: async (district_id: string) => {
        return await prisma.ms_district.delete({ where: { district_id } });
    }
};