import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { typeItemRepository } from '@modules/ms_type_item/typeItemRepository';
import { TypePayloadTypeItem } from '@modules/ms_type_item/typeItemModel';
import { select  } from '@common/models/selectData';
import { Character } from '@prisma/client';
import { string } from 'zod';

export const typeItemService = {
    
    create: async (payload: TypePayloadTypeItem, employee_id : string ) => {
        try{
            const check = await typeItemRepository.findByname(payload.type_item_name);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Type item name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await typeItemRepository.create(
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
            const errorMessage = "Error create type item :" + (ex as Error).message;
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
                "ms_type_item", 
                ["type_item_name"],
                ["type_item_id", "type_item_name"],
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
            const errorMessage = "Error select type item :" + (ex as Error).message;
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
            const data = await typeItemRepository.fineAllAsync(page , limit , search);
            const totalCount = await typeItemRepository.count(search);
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
            const errorMessage = "Error get all type item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (type_item_id: string ) => {
        try{
            const data = await typeItemRepository.findById(type_item_id);
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

    update: async (type_item_id : string , payload : TypePayloadTypeItem , employee_id : string ) => {
        try{
            const check = await typeItemRepository.findById(type_item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Type item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                group_item_id,
                type_item_name,
                type_item_description 
            } = { ...check , ...payload } ;

            const data = await typeItemRepository.update(    
                type_item_id , 
                {
                    group_item_id,
                    type_item_name,
                    type_item_description
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
            const errorMessage = "Error update type item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );

        }
    },

    delete: async (type_item_id: string) => {
        try{
            const check = await typeItemRepository.findById(type_item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Type item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await typeItemRepository.delete(type_item_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error delete type item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}