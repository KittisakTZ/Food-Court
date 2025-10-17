import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { productionStepRepository } from '@modules/ms_production_step/productionStepRepository';
import { TypePayloadProductionStep, Filter } from '@modules/ms_production_step/productionStepModel';
import { select } from '@common/models/selectData';

export const productionStepService = {
    create: async (payload: TypePayloadProductionStep, employee_id: string) => {
        try {
            const existing = await productionStepRepository.findByCode(payload.step_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Step code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await productionStepRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Step created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Production Step: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await productionStepRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await productionStepRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Production Steps success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Production Steps: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (step_id: string) => {
        try {
            const data = await productionStepRepository.findById(step_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Step not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Production Step by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Production Step by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (step_id: string, payload: Partial<TypePayloadProductionStep>, employee_id: string) => {
        try {
            const existingStep = await productionStepRepository.findById(step_id);
            if (!existingStep) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Step not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.step_code && payload.step_code !== existingStep.step_code) {
                const existingWithNewCode = await productionStepRepository.findByCode(payload.step_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Production Step code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await productionStepRepository.update(step_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Step updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Production Step: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (step_id: string) => {
        try {
            const existingStep = await productionStepRepository.findById(step_id);
            if (!existingStep) {
                return new ServiceResponse(ResponseStatus.Failed, "Production Step not found.", null, StatusCodes.NOT_FOUND);
            }
            await productionStepRepository.delete(step_id);
            return new ServiceResponse(ResponseStatus.Success, "Production Step deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Production Step: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    
    select: async (search: string) => {
        try {
            const data = await select(
                "ms_production_step",
                ["step_code", "step_name"],
                ["step_id", "step_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Production Step selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Production Step selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};