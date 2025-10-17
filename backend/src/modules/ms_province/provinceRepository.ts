import { ms_province, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadProvince } from "@modules/ms_province/provinceModel";

export const provinceRepository = {
    findByCode: async (province_code: string) => {  
        return prisma.ms_province.findUnique({ where: { province_code: province_code.trim() } });
    },
    findById: async (province_id: string) => {
        return prisma.ms_province.findUnique({
            where: { province_id },
            include: { country: { select: { country_name: true } } }
        });
    },
    count: async (searchText?: string, countryId?: string) => {
        const where: Prisma.ms_provinceWhereInput = {};
        if (countryId) {
            where.country_id = countryId;
        }
        if (searchText) {
            where.OR = [
                { province_code: { contains: searchText, mode: 'insensitive' } },
                { province_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_province.count({ where });
    },
    countRelatedRecords: async (province_id: string) => {
        const districtCount = await prisma.ms_district.count({ where: { province_id } });
        const customerCount = await prisma.ms_customer.count({ where: { province_id } });
        return districtCount + customerCount;
    },
    findAllAsync: async (skip: number, take: number, searchText?: string, countryId?: string) => {
        const where: Prisma.ms_provinceWhereInput = {};
        if (countryId) {
            where.country_id = countryId;
        }
        if (searchText) {
            where.OR = [
                { province_code: { contains: searchText, mode: 'insensitive' } },
                { province_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_province.findMany({
            where,
            include: { country: { select: { country_name: true } } }, // Include country name
            skip: (skip - 1) * take,
            take: take,
            orderBy: { province_name: 'asc' }
        });
    },
    create: async (payload: TypePayloadProvince) => {
        return await prisma.ms_province.create({ data: payload });
    },
    update: async (province_id: string, payload: Partial<TypePayloadProvince>) => {
        return await prisma.ms_province.update({ where: { province_id }, data: payload });
    },
    delete: async (province_id: string) => {
        return await prisma.ms_province.delete({ where: { province_id } });
    }
};