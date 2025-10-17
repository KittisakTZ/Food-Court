import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { genderRepository } from '@modules/ms_gender/genderRepository';
import { TypePayloadGender, Filter  } from '@modules/ms_gender/genderModel';
import { select } from '@common/models/selectData';

export const genderService = {
    create: async (payload: TypePayloadGender, employee_id: string) => {
        try {
            const existing = await genderRepository.findByCode(payload.gender_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Gender code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await genderRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Gender created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Gender: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await genderRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await genderRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Genders success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Genders: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (gender_id: string) => {
        try {
            const data = await genderRepository.findById(gender_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Gender not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Gender by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Gender by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (gender_id: string, payload: Partial<TypePayloadGender>, employee_id: string) => {
        try {
            const existingGender = await genderRepository.findById(gender_id);
            if (!existingGender) {
                return new ServiceResponse(ResponseStatus.Failed, "Gender not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.gender_code && payload.gender_code !== existingGender.gender_code) {
                const existingWithNewCode = await genderRepository.findByCode(payload.gender_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Gender code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await genderRepository.update(gender_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Gender updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Gender: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (gender_id: string) => {
        try {
            const existingGender = await genderRepository.findById(gender_id);
            if (!existingGender) {
                return new ServiceResponse(ResponseStatus.Failed, "Gender not found.", null, StatusCodes.NOT_FOUND);
            }
            await genderRepository.delete(gender_id);
            return new ServiceResponse(ResponseStatus.Success, "Gender deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Gender: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string) => {
        try {
            const data = await select(
                "ms_gender",
                ["gender_code", "gender_name"],
                ["gender_id", "gender_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Gender selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Gender selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};