import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { salepersonRepository } from '@modules/ms_salesperson/salepersonRepository';
import { TypePayloadSaleperson, Filter } from '@modules/ms_salesperson/salepersonModel';
import { select } from '@common/models/selectData';

export const salepersonService = {
    create: async (payload: TypePayloadSaleperson, employee_id: string) => {
        try {
            const existing = await salepersonRepository.findByCode(payload.saleperson_code);
            if (existing) {
                return new ServiceResponse(ResponseStatus.Failed, "Saleperson code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await salepersonRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Saleperson created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating saleperson: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const data = await salepersonRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await salepersonRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all salepersons success", {
                data,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all salepersons: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    findById: async (id: string) => {
        try {
            const data = await salepersonRepository.findById(id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Saleperson not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get saleperson by id success", data, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding saleperson by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    update: async (id: string, payload: Partial<TypePayloadSaleperson>, employee_id: string) => {
        try {
            const saleperson = await salepersonRepository.findById(id);
            if (!saleperson) {
                return new ServiceResponse(ResponseStatus.Failed, "Saleperson not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.saleperson_code && payload.saleperson_code !== saleperson.saleperson_code) {
                const existing = await salepersonRepository.findByCode(payload.saleperson_code);
                if (existing) {
                    return new ServiceResponse(ResponseStatus.Failed, "New saleperson code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await salepersonRepository.update(id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Saleperson updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating saleperson: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    delete: async (id: string) => {
        try {
            const data = await salepersonRepository.findById(id);
            if (!data) {
                return new ServiceResponse(ResponseStatus.Failed, "Saleperson not found.", null, StatusCodes.NOT_FOUND);
            }
            await salepersonRepository.delete(id);
            return new ServiceResponse(ResponseStatus.Success, "Saleperson deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting saleperson: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    select: async (search: string) => {
        try {
            // ปรับแก้การเรียกใช้ฟังก์ชัน select ให้ถูกต้อง
            const data = await select(
                "ms_saleperson",
                ["saleperson_code", "first_name", "last_name"], 
                ["saleperson_id", "first_name", "last_name"],   
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get saleperson selection success", { data }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting saleperson selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};