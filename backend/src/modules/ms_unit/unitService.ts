import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { unitRepository } from '@modules/ms_unit/unitRepository';
import { TypePayloadUnit , Filter } from '@modules/ms_unit/unitModel';
import { select  } from '@common/models/selectData';

export const unitService = {
    
    create: async (payload: TypePayloadUnit, employee_id : string ) => {
        try{
            const check = await unitRepository.findByname(payload.unit_name);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Unit name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await unitRepository.create(
                payload,
                employee_id
            );
            return new ServiceResponse(
                ResponseStatus.Success,
                "Create success",
                null,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = "Error create unit :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    select: async (search : string ) => {
        try{
            const data = await select(
                "ms_unit", 
                ["unit_name"],
                ["unit_id", "unit_name"],
                { name: "created_at" , by: "asc"},
                search
            );
            
            return new ServiceResponse(
                ResponseStatus.Success,
                "Select all success",
                {
                    data : data,
                },
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error select unit :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    fineAll: async (page : number , limit : number , search : string , payload: Filter ) => {
        try{
            const data = await unitRepository.fineAllAsync(page , limit , search , payload);
            const totalCount = await unitRepository.count(payload,search);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all success",
                {
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    data : data,
                },
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error get all unit :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (unit_id: string ) => {
        try{
            const data = await unitRepository.findById(unit_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get by id success",
                data,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error get by id :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (unit_id : string , payload : TypePayloadUnit , employee_id : string ) => {
        try{
            const check = await unitRepository.findById(unit_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Unit not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                unit_name,
            } = { ...check , ...payload } ;

            const data = await unitRepository.update(    
                unit_id , 
                {
                    unit_name,
                },
                employee_id
            );
            return new ServiceResponse(
                ResponseStatus.Success,
                "Update success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error update unit :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );

        }
    },

    delete: async (unit_id: string) => {
        try{
            const check = await unitRepository.findById(unit_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Unit not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await unitRepository.delete(unit_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error delete unit :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}