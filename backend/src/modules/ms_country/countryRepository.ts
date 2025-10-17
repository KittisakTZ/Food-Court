import { ms_country, Prisma } from "@prisma/client";
import prisma from "@src/db";
import { TypePayloadCountry } from "@modules/ms_country/countryModel";

export const countryRepository = {
    findByCode: async (country_code: string) => {
        return prisma.ms_country.findUnique({ where: { country_code: country_code.trim() } });
    },
    findById: async (country_id: string) => {
        return prisma.ms_country.findUnique({ where: { country_id } });
    },
    count: async (searchText?: string) => {
        const where: Prisma.ms_countryWhereInput = {};
        if (searchText) {
            where.OR = [
                { country_code: { contains: searchText, mode: 'insensitive' } },
                { country_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_country.count({ where });
    },
    // ฟังก์ชันตรวจสอบข้อมูลที่เกี่ยวข้อง
    countRelatedRecords: async (country_id: string) => {
        const provinceCount = await prisma.ms_province.count({ where: { country_id } });
        const customerCount = await prisma.ms_customer.count({ where: { country_id } });
        return provinceCount + customerCount;
    },
    findAllAsync: async (skip: number, take: number, searchText?: string) => {
        const where: Prisma.ms_countryWhereInput = {};
        if (searchText) {
            where.OR = [
                { country_code: { contains: searchText, mode: 'insensitive' } },
                { country_name: { contains: searchText, mode: 'insensitive' } },
            ];
        }
        return await prisma.ms_country.findMany({ where, skip: (skip - 1) * take, take, orderBy: { country_name: 'asc' } });
    },
    create: async (payload: TypePayloadCountry) => {
        return await prisma.ms_country.create({ data: payload });
    },
    update: async (country_id: string, payload: Partial<TypePayloadCountry>) => {
        return await prisma.ms_country.update({ where: { country_id }, data: payload });
    },
    delete: async (country_id: string) => {
        return await prisma.ms_country.delete({ where: { country_id } });
    }
};