import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { groupItemRepository } from '@modules/ms_group_item/groupItemRepository';
import { TypePayloadGroupItem } from '@modules/ms_group_item/groupItemModel';
import { select  } from '@common/models/selectData';
import { Character } from '@prisma/client';
import { string } from 'zod';

export const groupItemService = {
    
    create: async (payload: TypePayloadGroupItem, employee_id : string ) => {
        try{
            const check = await groupItemRepository.findByname(payload.group_item_name);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Group item name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await groupItemRepository.create(
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
            const errorMessage = "Error create group item :" + (ex as Error).message;
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
                "ms_group_item", 
                ["group_item_name"],
                ["group_item_id", "group_item_name"],
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
            const errorMessage = "Error select group item :" + (ex as Error).message;
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
            const data = await groupItemRepository.fineAllAsync(page , limit , search);
            const totalCount = await groupItemRepository.count(search);
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
            const errorMessage = "Error get all group item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (group_item_id: string ) => {
        try{
            const data = await groupItemRepository.findById(group_item_id);
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

    update: async (group_item_id : string , payload : TypePayloadGroupItem , employee_id : string ) => {
        try{
            const check = await groupItemRepository.findById(group_item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "group item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                group_item_name,
                group_item_description 
            } = { ...check , ...payload } ;

            const data = await groupItemRepository.update(    
                group_item_id , 
                {
                    group_item_name,
                    group_item_description
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
            const errorMessage = "Error update group item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );

        }
    },

    delete: async (group_item_id: string) => {
        try{
            const check = await groupItemRepository.findById(group_item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Group item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await groupItemRepository.delete(group_item_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error delete group item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}