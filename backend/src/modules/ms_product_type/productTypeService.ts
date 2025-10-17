import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { productTypeRepository } from '@modules/ms_product_type/productTypeRepository';
import { TypePayloadProductType, Filter } from '@modules/ms_product_type/productTypeModel';
import { select } from '@common/models/selectData';

export const productTypeService = {
    create: async (payload: TypePayloadProductType, employee_id: string) => {
        try {
            const existing = await productTypeRepository.findByCode(payload.product_type_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Product Type code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await productTypeRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Product Type created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Product Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await productTypeRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await productTypeRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Product Types success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Product Types: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (product_type_id: string) => {
        try {
            const data = await productTypeRepository.findById(product_type_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Product Type not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Product Type by id success", data, StatusCodes.OK);
        } catch (ex)
        {
            const errorMessage = `Error finding Product Type by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (product_type_id: string, payload: Partial<TypePayloadProductType>, employee_id: string) => {
        try {
            const existingType = await productTypeRepository.findById(product_type_id);
            if (!existingType) {
                return new ServiceResponse(ResponseStatus.Failed, "Product Type not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.product_type_code && payload.product_type_code !== existingType.product_type_code) {
                const existingWithNewCode = await productTypeRepository.findByCode(payload.product_type_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Product Type code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await productTypeRepository.update(product_type_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Product Type updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Product Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (product_type_id: string) => {
        try {
            const existingType = await productTypeRepository.findById(product_type_id);
            if (!existingType) {
                return new ServiceResponse(ResponseStatus.Failed, "Product Type not found.", null, StatusCodes.NOT_FOUND);
            }
            await productTypeRepository.delete(product_type_id);
            return new ServiceResponse(ResponseStatus.Success, "Product Type deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Product Type: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string) => {
        try {
            const data = await select(
                "ms_product_type",
                ["product_type_code", "product_type_name"],
                ["product_type_id", "product_type_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Product Type selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Product Type selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};