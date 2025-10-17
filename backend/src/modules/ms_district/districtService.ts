import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { districtRepository } from '@modules/ms_district/districtRepository';
import { TypePayloadDistrict } from '@modules/ms_district/districtModel';
import { select } from '@common/models/selectData';
import { provinceRepository } from '@modules/ms_province/provinceRepository';

export const districtService = {
    create: async (payload: TypePayloadDistrict) => {
        try {
            const province = await provinceRepository.findById(payload.province_id);
            if (!province) {
                return new ServiceResponse(ResponseStatus.Failed, "Province not found.", null, StatusCodes.NOT_FOUND);
            }

            const existing = await districtRepository.findByCode(payload.district_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "District code already exists.", null, StatusCodes.BAD_REQUEST);
            }

            await districtRepository.create(payload);
            return new ServiceResponse(ResponseStatus.Success, "District created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating District: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, provinceId?: string) => {
        try {
            const data = await districtRepository.findAllAsync(page, limit, search, provinceId);
            const totalCount = await districtRepository.count(search, provinceId);
            return new ServiceResponse(ResponseStatus.Success, "Get all Districts success", {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Districts: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (id: string) => {
        try {
            const data = await districtRepository.findById(id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "District not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get District by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding District by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (id: string, payload: Partial<TypePayloadDistrict>) => {
        try {
            const district = await districtRepository.findById(id);
            if (!district) {
                return new ServiceResponse(ResponseStatus.Failed, "District not found.", null, StatusCodes.NOT_FOUND);
            }

            if (payload.province_id) {
                const province = await provinceRepository.findById(payload.province_id);
                if (!province) {
                    return new ServiceResponse(ResponseStatus.Failed, "Province not found.", null, StatusCodes.NOT_FOUND);
                }
            }

            if (payload.district_code && payload.district_code !== district.district_code) {
                const existing = await districtRepository.findByCode(payload.district_code);
                if (existing) {
                    return new ServiceResponse(ResponseStatus.Failed, "New District code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await districtRepository.update(id, payload);
            return new ServiceResponse(ResponseStatus.Success, "District updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating District: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (id: string) => {
        try {
            const district = await districtRepository.findById(id);
            if (!district) {
                return new ServiceResponse(ResponseStatus.Failed, "District not found.", null, StatusCodes.NOT_FOUND);
            }
            
            const relatedCount = await districtRepository.countRelatedRecords(id);
            if (relatedCount > 0) {
                return new ServiceResponse(ResponseStatus.Failed, "Cannot delete district. It is currently in use by customers.", null, StatusCodes.BAD_REQUEST);
            }

            await districtRepository.delete(id);
            return new ServiceResponse(ResponseStatus.Success, "District deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting District: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string, provinceId?: string) => {
        try {
            const where: any = {};
            if (provinceId) {
                where.province_id = provinceId;
            }

            const data = await select(
                "ms_district",
                ["district_code", "district_name"],
                ["district_id", "district_name"],
                { name: "district_name", by: "asc" },
                search,
                where
            );
            return new ServiceResponse(ResponseStatus.Success, "Get District selection success", { data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting District selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};