// @modules/order/orderRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { orderService } from "./orderService";
import {
    CreateOrderSchema,
    GetOrdersQuerySchema,
    SellerUpdateOrderStatusSchema,
    OrderIdParamSchema,
    ReorderQueueSchema,
    MoveOrderSchema,
} from "./orderModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { OrderStatus, Role } from "@prisma/client";
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
            // **แก้ไข:** ดึงข้อมูลจาก req.query
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

    // PATCH /v1/orders/:orderId/cancel - Buyer ยกเลิก Order ของตัวเอง
    router.patch(
        "/:orderId/cancel",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(OrderIdParamSchema),
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

    // GET /v1/orders/:orderId - Buyer ดูรายละเอียด Order เดียว
    router.get(
        "/:orderId",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
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

    // GET /v1/stores/my-store/orders - Seller ดู Order ทั้งหมดของร้าน (คิว หรือ ประวัติ)
    router.get(
        "/",
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            // --- 🔴 START FIX ---

            // 1. ใช้ Schema ในการ Parse ตัว req.query เพื่อให้ได้ค่า Default และ Type ที่ถูกต้อง
            // Zod จะจัดการ .coerce.number() และ .default() ให้เรา
            const validatedQuery = GetOrdersQuerySchema.shape.query.parse(req.query);

            // 2. ดึงค่าที่ Parse แล้วออกมา
            //    ณ จุดนี้ page และ pageSize จะเป็น number (เช่น 1 และ 10)
            //    status จะเป็น array (ถ้าส่งมา) หรือ undefined
            const { page, pageSize, status } = validatedQuery;

            // --- 🔴 END FIX ---

            // 3. (แก้ไข) ใช้ status ที่ได้จาก Zod โดยตรง
            const filterStatus = status ? (Array.isArray(status) ? status : [status]) : undefined;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            // 4. (แก้ไข) ส่ง page และ pageSize (ที่เป็น number อยู่แล้ว) เข้า Service โดยตรง
            const serviceResponse = await orderService.findMyStoreOrders(userForService, page, pageSize, filterStatus as OrderStatus[]);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // GET /v1/stores/my-store/orders/:orderId - Seller ดูรายละเอียด Order เดียว
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

    // PATCH /v1/stores/my-store/orders/reorder - Seller เรียงลำดับคิวใหม่
    router.patch(
        "/reorder",
        validateRequest(ReorderQueueSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderedIds } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            const serviceResponse = await orderService.reorderQueue(orderedIds, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /v1/stores/my-store/orders/:orderId - Seller จัดการสถานะ Order
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

    // (ใหม่) PATCH /v1/stores/my-store/orders/:orderId/move
    router.patch(
        "/my-store/orders/:orderId/move",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        async (req: Request, res: Response): Promise<void> => {
            try {
                const { orderId } = req.params;
                const { newPosition } = req.body;

                if (typeof newPosition !== "number") {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid request: 'newPosition' must be a number.",
                    });
                    return;
                }

                const serviceResponse = await orderService.moveOrder(
                    req.token?.payload,
                    orderId,
                    newPosition
                );

                handleServiceResponse(serviceResponse, res);
            } catch (error) {
                console.error("Error in PATCH /my-store/orders/:orderId/move:", error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: "Internal server error while moving order.",
                });
            }
        }
    );

    return router;
})();