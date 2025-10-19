// @modules/order/orderRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { orderService } from "./orderService";
import { CreateOrderSchema, UpdateOrderStatusSchema, GetOrdersQuerySchema } from "./orderModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "@modules/store/storeRepository";

export const orderRouter = (() => {
    const router = express.Router();

    // --- Buyer Routes ---

    // GET /v1/orders/my-orders - ดูประวัติการสั่งซื้อของ Buyer
    router.get(
        "/my-orders",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { page, pageSize } = req.query;
            const userForService = { id: req.token.payload.uuid };

            const serviceResponse = await orderService.findMyOrders(userForService, parseInt(page as string), parseInt(pageSize as string));
            handleServiceResponse(serviceResponse, res);
        }
    );

    // POST /v1/orders - สร้าง Order ใหม่ (ของเดิม)
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

    // --- Seller Routes ---
    // เนื่องจาก Endpoint ของ Seller เกี่ยวข้องกับร้านของตัวเอง เราจะสร้าง Nested Router ภายใต้ Store

    // GET /v1/stores/my-store/orders - Seller ดู Order ของร้านตัวเอง
    // PATCH /v1/stores/my-store/orders/:orderId - Seller อัปเดตสถานะ Order
    // เราจะเพิ่ม 2 เส้นทางนี้เข้าไปใน storeRouter.ts เพื่อให้ URL สื่อความหมาย

    return router;
})();

// (สร้าง Seller Order Router แยกเพื่อความสะอาด)
export const sellerOrderRouter = (() => {
    const router = express.Router({ mergeParams: true });

    // GET /v1/stores/my-store/orders
    router.get(
        "/",
        authorizeRoles([Role.SELLER]),
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { page, pageSize } = req.query;
            const userForService = { id: req.token.payload.uuid };
            const serviceResponse = await orderService.findMyStoreOrders(userForService, parseInt(page as string), parseInt(pageSize as string));
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /v1/stores/my-store/orders/:orderId
    router.patch(
        "/:orderId",
        authorizeRoles([Role.SELLER]),
        validateRequest(UpdateOrderStatusSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const { status } = req.body;
            const userForService = { id: req.token.payload.uuid };
            const serviceResponse = await orderService.updateOrderStatus(orderId, status, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();