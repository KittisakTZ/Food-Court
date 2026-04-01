import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ServiceResponse, ResponseStatus } from '@common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';
import { pino } from 'pino';

const logger = pino({ name: 'error-handler' });

const errorHandler = (): ErrorRequestHandler => {
    return (err: Error, req: Request, res: Response, _next: NextFunction) => {
        logger.error({ err, path: req.path }, 'Unhandled error');

        // จัดการ ZodError โดยเฉพาะ
        if (err instanceof ZodError) {
            res.status(StatusCodes.BAD_REQUEST).json({
                status: ResponseStatus.Failed,
                message: 'Invalid input data.',
                errors: err.flatten().fieldErrors,
            });
            return;
        }

        // จัดการ Error ทั่วไป
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Failed,
            'An unexpected error occurred on the server.',
            null,
            StatusCodes.INTERNAL_SERVER_ERROR
        );
        res.status(serviceResponse.statusCode).json(serviceResponse);
    };
};

export default errorHandler;