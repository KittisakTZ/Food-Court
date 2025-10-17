import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';

export const authorizeRoles = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = req.token?.payload?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden: Insufficient permissions' });
            return;
        }

        next();
    };
};