import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { itemRepository } from '@modules/ms_item/itemRepository';
import { TypePayloadItem } from '@modules/ms_item/itemModel';
import { select  } from '@common/models/selectData';

export const itemService = {
    
    create: async (payload: TypePayloadItem, employee_id : string , files: Express.Multer.File[] ) => {
        try{
            const check = await itemRepository.findByname(payload.item_name);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Item name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await itemRepository.create(
                payload,
                employee_id,
                files
            );
            return new ServiceResponse(
                ResponseStatus.Success,
                "Create success",
                null,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = "Error create item :" + (ex as Error).message;
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
                "ms_item", 
                ["item_name"],
                ["item_id", "item_name"],
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
            const errorMessage = "Error select item :" + (ex as Error).message;
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
            const data = await itemRepository.fineAllAsync(page , limit , search);
            const totalCount = await itemRepository.count(search);
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
            const errorMessage = "Error get all item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (item_id: string ) => {
        try{
            const data = await itemRepository.findById(item_id);
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

    update: async (item_id : string , payload : TypePayloadItem , employee_id : string , files: Express.Multer.File[]) => {
        try{
            const check = await itemRepository.findById(item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                item_name,
                item_description,
                additional_note,
                group_item_id,
                type_item_id,
                unit_id,
                item_price,
            } = { ...check , ...payload } ;

            const checkName = await itemRepository.findByname(item_name);
            if(checkName){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Item name already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await itemRepository.update(    
                item_id , 
                {
                    item_name,
                    item_description,
                    additional_note,
                    group_item_id: group_item_id ?? check.group_item.group_item_id,
                    type_item_id: type_item_id ?? check.type_item.type_item_id,
                    unit_id: unit_id ?? check.unit.unit_id,
                    item_price,
                },
                employee_id,
                files
            );
            return new ServiceResponse(
                ResponseStatus.Success,
                "Update success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error update item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );

        }
    },

    delete: async (item_id: string) => {
        try{
            const check = await itemRepository.findById(item_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Item not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await itemRepository.delete(item_id);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Delete success",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = "Error delete item :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
        
    }
}