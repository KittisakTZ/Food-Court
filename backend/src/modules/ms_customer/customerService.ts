import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { customerRepository } from '@modules/ms_customer/customerRepository';
import { TypePayloadCustomer, Filter } from '@modules/ms_customer/customerModel';
import { select } from '@common/models/selectData';

export const customerService = {
    create: async (payload: TypePayloadCustomer, employee_id: string) => {
        try {
            const existingCustomer = await customerRepository.findByCode(payload.customer_code);
            if (existingCustomer) {
                return new ServiceResponse(ResponseStatus.Failed, "Customer code already exists.", null, StatusCodes.BAD_REQUEST);
            }
            await customerRepository.create(payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Customer created successfully.", null, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating customer: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findAll: async (page: number, limit: number, search: string, payload: Filter) => {
        try {
            const customers = await customerRepository.findAllAsync(page, limit, search, payload);
            const totalCount = await customerRepository.count(search, payload);
            return new ServiceResponse(ResponseStatus.Success, "Get all customers success", {
                data: customers,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding all customers: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    findById: async (customer_id: string) => {
        try {
            const customer = await customerRepository.findById(customer_id);
            if (!customer) {
                return new ServiceResponse(ResponseStatus.Failed, "Customer not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "Get customer by id success", customer, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error finding customer by id: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    update: async (customer_id: string, payload: Partial<TypePayloadCustomer>, employee_id: string) => {
        try {
            const customer = await customerRepository.findById(customer_id);
            if (!customer) {
                return new ServiceResponse(ResponseStatus.Failed, "Customer not found.", null, StatusCodes.NOT_FOUND);
            }
            if (payload.customer_code && payload.customer_code !== customer.customer_code) {
                const existing = await customerRepository.findByCode(payload.customer_code);
                if (existing) {
                    return new ServiceResponse(ResponseStatus.Failed, "New customer code already exists.", null, StatusCodes.BAD_REQUEST);
                }
            }
            await customerRepository.update(customer_id, payload, employee_id);
            return new ServiceResponse(ResponseStatus.Success, "Customer updated successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating customer: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    delete: async (customer_id: string) => {
        try {
            const customer = await customerRepository.findById(customer_id);
            if (!customer) {
                return new ServiceResponse(ResponseStatus.Failed, "Customer not found.", null, StatusCodes.NOT_FOUND);
            }
            await customerRepository.delete(customer_id);
            return new ServiceResponse(ResponseStatus.Success, "Customer deleted successfully.", null, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting customer: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
    
    select: async (search: string) => {
        try {
            const customers = await select(
                "ms_customer",
                ["customer_code", "customer_name"],
                ["customer_id", "customer_name"],
                { name: "created_at", by: "asc" },
                search
            );
            return new ServiceResponse(ResponseStatus.Success, "Get customer selection success", { data: customers }, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error getting customer selection: ${(ex as Error).message}`;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};