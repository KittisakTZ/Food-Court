import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { productionTypeRepository } from '@modules/ms_production_type/productionTypeRepository';
import { TypePayloadProductionType, Filter } from '@modules/ms_production_type/productionTypeModel';
import { select } from '@common/models/selectData';

export const productionTypeService = {
    create: async (payload: TypePayloadProductionType, employee_id: string) => {
        try {
            const existing = await productionTypeRepository.findByCode(payload.production_type_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Type code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await productionTypeRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Type created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Production Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await productionTypeRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await productionTypeRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Production Types success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Production Types: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (production_type_id: string) => {
        try {
            const data = await productionTypeRepository.findById(production_type_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Type not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Production Type by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Production Type by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (production_type_id: string, payload: Partial<TypePayloadProductionType>, employee_id: string) => {
        try {
            const existingType = await productionTypeRepository.findById(production_type_id);
            if (!existingType) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Type not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.production_type_code && payload.production_type_code !== existingType.production_type_code) {
                const existingWithNewCode = await productionTypeRepository.findByCode(payload.production_type_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Production Type code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await productionTypeRepository.update(production_type_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Type updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Production Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (production_type_id: string) => {
        try {
            const existingType = await productionTypeRepository.findById(production_type_id);
            if (!existingType) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Type not found.", null, StatusCodes.NOT_FOUND);
            }
            await productionTypeRepository.delete(production_type_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Type deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Production Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    
    select: async (search: string) => {
        try {
            const data = await select(
                "ms_production_type",
                ["production_type_code", "production_type_name"],
                ["production_type_id", "production_type_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Production Type selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Production Type selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};