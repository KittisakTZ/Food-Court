import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { storageLocationRepository } from '@modules/ms_storage_location/storageLocationRepository';
import { TypePayloadStorageLocation, Filter } from '@modules/ms_storage_location/storageLocationModel';
import { select } from '@common/models/selectData';
import { warehouseRepository } from '@modules/ms_warehouse/warehouseRepository';

export const storageLocationService = {
    create: async (payload: TypePayloadStorageLocation, employee_id: string) => {
        try {
            const existing = await storageLocationRepository.findByCode(payload.storage_location_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Storage Location code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            // Check if warehouse_id is valid
            const warehouse = await warehouseRepository.findById(payload.warehouse_id);
            if (!warehouse) {
                return new ServiceResponse(ResponseStatus.Failed, "Warehouse not found.", null, StatusCodes.NOT_FOUND);
            }

            await storageLocationRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Storage Location created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Storage Location: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, warehouseId?: string, payload?: Filter) => {
        try {
            const data = await storageLocationRepository.findAllAsync(page, limit, search, warehouseId, payload);
            const totalCount = await storageLocationRepository.count(search, warehouseId, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all Storage Locations success", {
                data: data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all Storage Locations: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (storage_location_id: string) => {
        try {
            const data = await storageLocationRepository.findById(storage_location_id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Storage Location not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get Storage Location by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding Storage Location by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (storage_location_id: string, payload: Partial<TypePayloadStorageLocation>, employee_id: string) => {
        try {
            const existingLocation = await storageLocationRepository.findById(storage_location_id);
            if (!existingLocation) {
                return new ServiceResponse(ResponseStatus.Failed, "Storage Location not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.storage_location_code && payload.storage_location_code !== existingLocation.storage_location_code) {
                const existingWithNewCode = await storageLocationRepository.findByCode(payload.storage_location_code);
                if (existingWithNewCode) {
                    return new ServiceResponse(ResponseStatus.Failed, "New Storage Location code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
             if (payload.warehouse_id) {
                const warehouse = await warehouseRepository.findById(payload.warehouse_id);
                if (!warehouse) {
                    return new ServiceResponse(ResponseStatus.Failed, "Warehouse not found.", null, StatusCodes.NOT_FOUND);
                }
            }
            await storageLocationRepository.update(storage_location_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Storage Location updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Storage Location: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (storage_location_id: string) => {
        try {
            const existingLocation = await storageLocationRepository.findById(storage_location_id);
            if (!existingLocation) {
                return new ServiceResponse(ResponseStatus.Failed, "Storage Location not found.", null, StatusCodes.NOT_FOUND);
            }
            // Add check for related items if necessary in the future
            // For now, it can be deleted directly.

            await storageLocationRepository.delete(storage_location_id);
            return new ServiceResponse(ResponseStatus.Success, "Storage Location deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Storage Location: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    select: async (search: string, warehouseId?: string) => {
        try {
            const where: any = {};
            if (warehouseId) {
                where.warehouse_id = warehouseId;
            }
            
            const data = await select(
                "ms_storage_location",
                ["storage_location_code", "name_th", "name_en"],
                ["storage_location_id", "name_th"],
                { name: "created_at", by: "asc" },
                search,
                where
            );
            return new ServiceResponse(ResponseStatus.Success, "Get Storage Location selection success", { data: data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting Storage Location selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};