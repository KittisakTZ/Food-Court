import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { shipTypeRepository } from '@modules/ms_ship_type/shipTypeRepository';
import { TypePayloadShipType } from '@modules/ms_ship_type/shipTypeModel';
import { select  } from '@common/models/selectData';

export const shipTypeService = {
    
    create: async (payload: TypePayloadShipType, employee_id : string ) => {
        try{
            const check = await shipTypeRepository.findByname(payload.ship_type_name);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Ship type name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await shipTypeRepository.create(
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
            const errorMessage = "Error create ship type :" + (ex as Error).message;
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
                "ms_ship_type", 
                ["ms_ship_name"],
                ["ms_ship_id", "ms_ship_name"],
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
            const errorMessage = "Error select ship type :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
    fineAll: async (page : number , limit : number , search : string ) => {
        try{
            const data = await shipTypeRepository.fineAllAsync(page , limit , search);
            const totalCount = await shipTypeRepository.count(search);
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
            const errorMessage = "Error get all ship type :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (ship_type_id: string ) => {
        try{
            const data = await shipTypeRepository.findById(ship_type_id);
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

    update: async (ship_type_id : string , payload : TypePayloadShipType , employee_id : string ) => {
        try{
            const check = await shipTypeRepository.findById(ship_type_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Ship type not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                ship_type_name,
            } = { ...check , ...payload } ;

            const data = await shipTypeRepository.update(    
                ship_type_id , 
                {
                    ship_type_name,
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
            const errorMessage = "Error update ship type :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );

        }
    },

    delete: async (ship_type_id: string) => {
        try{
            const check = await shipTypeRepository.findById(ship_type_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Ship type not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await shipTypeRepository.delete(ship_type_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error delete ship type :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                (ex as any).code === 'P2003' ? "Deletion failed: this data is still in use" : errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}