import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { provinceRepository } from '@modules/ms_province/provinceRepository';
import { TypePayloadProvince } from '@modules/ms_province/provinceModel';
import { select } from '@common/models/selectData';
import { countryRepository } from '@modules/ms_country/countryRepository';

export const provinceService = {
    create: async (payload: TypePayloadProvince) => {
        try {
            const country = await countryRepository.findById(payload.country_id);
            if (!country) {
                return new ServiceResponse(ResponseStatus.Failed, "Country not found.", null, StatusCodes.NOT_FOUND);
            }

            const existing = await provinceRepository.findByCode(payload.province_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Province code already exists.", null, StatusCodes.BAD_REQUEST);
            }

            await provinceRepository.create(payload);
            return new ServiceResponse(ResponseStatus.Success, "Province created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Province: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, countryId?: string) => {
        try {
            const data = await provinceRepository.findAllAsync(page, limit, search, countryId);
            const totalCount = await provinceRepository.count(search, countryId);
            return new ServiceResponse(ResponseStatus.Success, "Get all Provinces success", {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Provinces: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (id: string) => {
        try {
            const data = await provinceRepository.findById(id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Province not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Province by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Province by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (id: string, payload: Partial<TypePayloadProvince>) => {
        try {
            const province = await provinceRepository.findById(id);
            if (!province) {
                return new ServiceResponse(ResponseStatus.Failed, "Province not found.", null, StatusCodes.NOT_FOUND);
            }

            if (payload.country_id) {
                const country = await countryRepository.findById(payload.country_id);
                if (!country) {
                    return new ServiceResponse(ResponseStatus.Failed, "Country not found.", null, StatusCodes.NOT_FOUND);
                }
            }

            if (payload.province_code && payload.province_code !== province.province_code) {
                const existing = await provinceRepository.findByCode(payload.province_code);
                if (existing) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Province code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await provinceRepository.update(id, payload);
            return new ServiceResponse(ResponseStatus.Success, "Province updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Province: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (id: string) => {
        try {
            const province = await provinceRepository.findById(id);
            if (!province) {
                return new ServiceResponse(ResponseStatus.Failed, "Province not found.", null, StatusCodes.NOT_FOUND);
            }
            
            const relatedCount = await provinceRepository.countRelatedRecords(id);
            if (relatedCount > 0) {
                return new ServiceResponse(ResponseStatus.Failed, "Cannot delete province. It is currently in use by districts or customers.", null, StatusCodes.BAD_REQUEST);
            }

            await provinceRepository.delete(id);
            return new ServiceResponse(ResponseStatus.Success, "Province deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Province: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string, countryId?: string) => {
        try {
            const where: any = {};
            if (countryId) {
                where.country_id = countryId;
            }

            const data = await select(
                "ms_province",
                ["province_code", "province_name"],
                ["province_id", "province_name"],
                { name: "province_name", by: "asc" },
                search,
                where
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Province selection success", { data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Province selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};