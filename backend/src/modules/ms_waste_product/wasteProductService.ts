import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { wasteProductRepository } from '@modules/ms_waste_product/wasteProductRepository';
import { TypePayloadWasteProduct, Filter } from '@modules/ms_waste_product/wasteProductModel';
import { select } from '@common/models/selectData';

export const wasteProductService = {
    create: async (payload: TypePayloadWasteProduct, employee_id: string) => {
        try {
            const existing = await wasteProductRepository.findByCode(payload.waste_product_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Waste Product code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await wasteProductRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Waste Product created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Waste Product: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            // 3. ส่ง payload ไปยัง Repository
            const data = await wasteProductRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await wasteProductRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Waste Products success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Waste Products: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (waste_product_id: string) => {
        try {
            const data = await wasteProductRepository.findById(waste_product_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Waste Product not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Waste Product by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Waste Product by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (waste_product_id: string, payload: Partial<TypePayloadWasteProduct>, employee_id: string) => {
        try {
            const existingWasteProduct = await wasteProductRepository.findById(waste_product_id);
            if (!existingWasteProduct) {
                return new ServiceResponse(ResponseStatus.Failed, "Waste Product not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.waste_product_code && payload.waste_product_code !== existingWasteProduct.waste_product_code) {
                const existingWithNewCode = await wasteProductRepository.findByCode(payload.waste_product_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Waste Product code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await wasteProductRepository.update(waste_product_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Waste Product updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Waste Product: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (waste_product_id: string) => {
        try {
            const existingWasteProduct = await wasteProductRepository.findById(waste_product_id);
            if (!existingWasteProduct) {
                return new ServiceResponse(ResponseStatus.Failed, "Waste Product not found.", null, StatusCodes.NOT_FOUND);
            }
            await wasteProductRepository.delete(waste_product_id);
            return new ServiceResponse(ResponseStatus.Success, "Waste Product deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Waste Product: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string) => {
        try {
            const data = await select(
                "ms_waste_product",
                ["waste_product_code", "waste_product_name"],
                ["waste_product_id", "waste_product_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Waste Product selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Waste Product selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};