import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { countryRepository } from '@modules/ms_country/countryRepository';
import { TypePayloadCountry } from '@modules/ms_country/countryModel';
import { select } from '@common/models/selectData';

export const countryService = {
    create: async (payload: TypePayloadCountry) => {
        try {
            const existing = await countryRepository.findByCode(payload.country_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Country code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await countryRepository.create(payload);
            return new ServiceResponse(ResponseStatus.Success, "Country created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Country: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    findAll: async (page: number, limit: number, search: string) => {
        try {
            const data = await countryRepository.findAllAsync(page, limit, search);
            const totalCount = await countryRepository.count(search);
            return new ServiceResponse(ResponseStatus.Success, "Get all Countries success", { data, totalCount, totalPages: Math.ceil(totalCount / limit) }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Countries: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    findById: async (id: string) => {
        try {
            const data = await countryRepository.findById(id);
            if (!data) return new ServiceResponse(ResponseStatus.Failed, "Country not found.", null, StatusCodes.NOT_FOUND);
            return new ServiceResponse(ResponseStatus.Success, "Get Country by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Country by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    update: async (id: string, payload: Partial<TypePayloadCountry>) => {
        try {
            const country = await countryRepository.findById(id);
            if (!country) return new ServiceResponse(ResponseStatus.Failed, "Country not found.", null, StatusCodes.NOT_FOUND);
            if (payload.country_code && payload.country_code !== country.country_code) {
                const existing = await countryRepository.findByCode(payload.country_code);
                if (existing) return new ServiceResponse(ResponseStatus.Failed, "New Country code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await countryRepository.update(id, payload);
            return new ServiceResponse(ResponseStatus.Success, "Country updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Country: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    delete: async (id: string) => {
        try {
            const country = await countryRepository.findById(id);
            if (!country) return new ServiceResponse(ResponseStatus.Failed, "Country not found.", null, StatusCodes.NOT_FOUND);
            
            const relatedCount = await countryRepository.countRelatedRecords(id);
            if (relatedCount > 0) {
                return new ServiceResponse(ResponseStatus.Failed, "Cannot delete country. It is currently in use by provinces or customers.", null, StatusCodes.BAD_REQUEST);
            }

            await countryRepository.delete(id);
            return new ServiceResponse(ResponseStatus.Success, "Country deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Country: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    select: async (search: string) => {
        try {
            const data = await select("ms_country", ["country_code", "country_name"], ["country_id", "country_name"], { name: "country_name", by: "asc" }, search);
            return new ServiceResponse(ResponseStatus.Success, "Get Country selection success", { data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Country selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};