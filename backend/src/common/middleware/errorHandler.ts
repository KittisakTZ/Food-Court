import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ServiceResponse, ResponseStatus } from '@common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';

const errorHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('💥 UNHANDLED ERROR: ', err);

        // จัดการ ZodError โดยเฉพาะ
        if (err instanceof ZodError) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: ResponseStatus.Failed,
                message: 'Invalid input data.',
                errors: err.flatten().fieldErrors,
            });
        }

        // จัดการ Error ทั่วไป
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Failed,
            'An unexpected error occurred on the server.',
            null,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        
        return res.status(serviceResponse.statusCode).json(serviceResponse);
    };
};

export default errorHandler;