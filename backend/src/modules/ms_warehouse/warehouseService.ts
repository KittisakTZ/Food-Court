import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { warehouseRepository } from '@modules/ms_warehouse/warehouseRepository';
import { TypePayloadWarehouse, Filter } from '@modules/ms_warehouse/warehouseModel';
import { select } from '@common/models/selectData';

export const warehouseService = {
    create: async (payload: TypePayloadWarehouse, employee_id: string) => {
        try {
            const existing = await warehouseRepository.findByCode(payload.warehouse_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Warehouse code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await warehouseRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Warehouse created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Warehouse: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await warehouseRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await warehouseRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Warehouses success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Warehouses: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (warehouse_id: string) => {
        try {
            const data = await warehouseRepository.findById(warehouse_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Warehouse not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Warehouse by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Warehouse by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (warehouse_id: string, payload: Partial<TypePayloadWarehouse>, employee_id: string) => {
        try {
            const existingWarehouse = await warehouseRepository.findById(warehouse_id);
            if (!existingWarehouse) {
                return new ServiceResponse(ResponseStatus.Failed, "Warehouse not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.warehouse_code && payload.warehouse_code !== existingWarehouse.warehouse_code) {
                const existingWithNewCode = await warehouseRepository.findByCode(payload.warehouse_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Warehouse code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await warehouseRepository.update(warehouse_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Warehouse updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Warehouse: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (warehouse_id: string) => {
        try {
            const existingWarehouse = await warehouseRepository.findById(warehouse_id);
            if (!existingWarehouse) {
                return new ServiceResponse(ResponseStatus.Failed, "Warehouse not found.", null, StatusCodes.NOT_FOUND);
            }

            // --- เงื่อนไขเพิ่มเติม ---
            const relatedLocationsCount = await warehouseRepository.countRelatedStorageLocations(warehouse_id);
            if (relatedLocationsCount > 0) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Cannot delete this warehouse because it has associated storage locations.",
                    null,
                    StatusCodes.BAD_REQUEST
                );
            }
            
            await warehouseRepository.delete(warehouse_id);
            return new ServiceResponse(ResponseStatus.Success, "Warehouse deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Warehouse: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string) => {
        try {
            const data = await select(
                "ms_warehouse",
                ["warehouse_code", "name_th", "name_en"],
                ["warehouse_id", "name_th"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Warehouse selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Warehouse selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};