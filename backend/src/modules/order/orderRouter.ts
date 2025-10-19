// @modules/order/orderRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { orderService } from "./orderService";
import { CreateOrderSchema, GetOrdersQuerySchema, SellerUpdateOrderStatusSchema, OrderIdParamSchema } from "./orderModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// ===== Router หลักสำหรับ /v1/orders (ส่วนใหญ่สำหรับ Buyer) =====
export const orderRouter = (() => {
    const router = express.Router();
    
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
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            const serviceResponse = await orderService.findMyOrders(userForService, parseInt(page as string), parseInt(pageSize as string));
            handleServiceResponse(serviceResponse, res);
        }
    );
    
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
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.createOrder(req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) PATCH /v1/orders/:orderId/cancel - Buyer ยกเลิก Order ของตัวเอง
    router.patch(
        "/:orderId/cancel", // Endpoint ใหม่
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(OrderIdParamSchema), // ใช้ Schema เดิมเพื่อ validate orderId
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            const serviceResponse = await orderService.cancelMyOrder(orderId, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) GET /v1/orders/:orderId - Buyer ดูรายละเอียด Order เดียว
    router.get(
        "/:orderId",
        authenticateToken,
        authorizeRoles([Role.BUYER]), // เข้าได้เฉพาะ Buyer ก่อน
        validateRequest(OrderIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            
            const serviceResponse = await orderService.findOrderDetails(orderId, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();

// ===== Nested Router สำหรับ /v1/stores/my-store/orders (สำหรับ Seller) =====
export const sellerOrderRouter = (() => {
    const router = express.Router({ mergeParams: true });

    // GET /v1/stores/my-store/orders - Seller ดู Order ทั้งหมดของร้าน
    router.get(
        "/",
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { page, pageSize } = req.query;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.findMyStoreOrders(userForService, parseInt(page as string), parseInt(pageSize as string));
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /v1/stores/my-store/orders/:orderId - Seller จัดการ Order
    router.patch(
        "/:orderId",
        validateRequest(SellerUpdateOrderStatusSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const { action } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            
            const serviceResponse = await orderService.reviewOrder(orderId, action, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) GET /v1/stores/my-store/orders/:orderId - Seller ดูรายละเอียด Order เดียว
    router.get(
        "/:orderId",
        validateRequest(OrderIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            const serviceResponse = await orderService.findOrderDetails(orderId, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();