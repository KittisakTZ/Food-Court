// @modules/order/orderRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { orderService } from "./orderService";
import { CreateOrderSchema } from "./orderModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

export const orderRouter = (() => {
    const router = express.Router();
    
    // POST /v1/orders - สร้าง Order ใหม่ (สำหรับ BUYER)
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(CreateOrderSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const userForService = { id: req.token.payload.uuid };
            const serviceResponse = await orderService.createOrder(req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    // (Endpoint อื่นๆ จะมาต่อที่นี่ในอนาคต)

    return router;
})();