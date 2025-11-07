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
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { z } from "zod"; // Import z
import upload from '@common/utils/upload';

// ===== Router หลักสำหรับ /v1/orders (ส่วนใหญ่สำหรับ Buyer) =====
export const orderRouter = (() => {
    const router = express.Router();

    // --- Static Paths (อยู่บน) ---
    // GET /v1/orders/my-orders
    router.get(
        "/my-orders",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const { page, pageSize } = GetOrdersQuerySchema.shape.query.parse(req.query);
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.findMyOrders(userForService, page, pageSize);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // POST /v1/orders
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(CreateOrderSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.createOrder(req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // --- Dynamic Paths (อยู่ล่าง) ---
    // ✨ (ใหม่) POST /v1/orders/:orderId/slip - สำหรับ Buyer อัปโหลดสลิป
    router.post(
        "/:orderId/slip",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(OrderIdParamSchema), // ใช้ Schema เดิมเพื่อ validate orderId
        upload.single('slip'), // Middleware ของ Multer สำหรับรับไฟล์เดียวชื่อ 'slip'
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            if (!req.file) {
                res.status(StatusCodes.BAD_REQUEST).json({ message: "Payment slip image is required." });
                return;
            }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            // เรียก Service ใหม่ที่เราจะสร้าง
            const serviceResponse = await orderService.uploadPaymentSlip(orderId, userForService, req.file);
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    // PATCH /v1/orders/:orderId/cancel
    router.patch(
        "/:orderId/cancel",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(OrderIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.cancelMyOrder(orderId, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // GET /v1/orders/:orderId
    router.get(
        "/:orderId",
        authenticateToken,
        authorizeRoles([Role.BUYER]),
        validateRequest(OrderIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
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

    // ====================================================================
    // 1. STATIC PATHS (Path ที่ตายตัวและไม่มี Parameter) - ต้องอยู่ก่อน
    // ====================================================================

    // GET / (ดึงรายการ)
    router.get(
        "/",
        validateRequest(GetOrdersQuerySchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            try {
                const { page, pageSize, status } = GetOrdersQuerySchema.shape.query.parse(req.query);
                const filterStatus = status ? (Array.isArray(status) ? status : [status]) : undefined;
                const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
                const serviceResponse = await orderService.findMyStoreOrders(userForService, page, pageSize, filterStatus);
                handleServiceResponse(serviceResponse, res);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid query parameters", errors: error.errors });
                    return;
                }
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
            }
        }
    );

    // PATCH /reorder (จัดลำดับทั้งหน้า)
    router.patch(
        "/reorder",
        validateRequest(ReorderQueueSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const { orderedIds } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.reorderQueue(orderedIds, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // =====================================================================
    // 2. DYNAMIC PATHS (Path ที่มี Parameter) - ต้องอยู่หลังจาก Static Paths
    //    เรียงจากยาวและเฉพาะเจาะจงที่สุด ไปหาสั้นและทั่วไปที่สุด
    // =====================================================================

    // PATCH /:orderId/move (ยาวและเฉพาะเจาะจงกว่า)
    router.patch(
        "/:orderId/move",
        validateRequest(MoveOrderSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const { orderId } = req.params;
            const { newPosition } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };

            // 🔧 แก้ไขลำดับ parameters ให้ตรงกับ service
            const serviceResponse = await orderService.moveOrder(userForService, orderId, newPosition);

            handleServiceResponse(serviceResponse, res);
        }
    );

    // GET /:orderId (สั้นและทั่วไปกว่า)
    router.get(
        "/:orderId",
        validateRequest(OrderIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const { orderId } = req.params;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.findOrderDetails(orderId, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /:orderId (สั้นและทั่วไปที่สุด)
    router.patch(
        "/:orderId",
        validateRequest(SellerUpdateOrderStatusSchema),
        async (req: Request, res: Response) => {
            if (!req.token) { res.sendStatus(StatusCodes.UNAUTHORIZED); return; }
            const { orderId } = req.params;
            const { action } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await orderService.reviewOrder(orderId, action, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();