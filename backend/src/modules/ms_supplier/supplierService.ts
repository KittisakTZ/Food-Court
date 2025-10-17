import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { supplierRepository } from '@modules/ms_supplier/supplierRepository';
import { TypePayloadSupplier } from '@modules/ms_supplier/supplierModel';
import { select  } from '@common/models/selectData';

export const supplierService = {
    
    create: async (payload: TypePayloadSupplier, employee_id : string , files: Express.Multer.File[]) => {
        try{
            const check = await supplierRepository.findByCode(payload.supplier_code);
            if(check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Supplier code already exists",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            };
            const data = await supplierRepository.create(
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
            const errorMessage = "Error create supplier :" + (ex as Error).message;
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
                "ms_supplier", 
                ["supplier_code"],
                ["supplier_id", "supplier_code"],
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
            const errorMessage = "Error select supplier :" + (ex as Error).message;
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
            const data = await supplierRepository.fineAllAsync(page , limit , search);
            const totalCount = await supplierRepository.count(search);
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
            const errorMessage = "Error get all supplier :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (supplier_id: string ) => {
        try{
            const data = await supplierRepository.findById(supplier_id);
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

    update: async (supplier_id : string , payload : TypePayloadSupplier , employee_id : string , files: Express.Multer.File[] ) => {
        try{
            const check = await supplierRepository.findById(supplier_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Supplier not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            const {
                ship_type_name,
            } = { ...check , ...payload }; 

            const data = await supplierRepository.update(    
                supplier_id , 
                {
                    ship_type_name,
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
            const check = await supplierRepository.findById(ship_type_id);
            if(!check){
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Ship type not found.",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            await supplierRepository.delete(ship_type_id);
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