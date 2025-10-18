// @modules/store/storeRouter.ts (ฉบับแก้ไข Error ล่าสุด)

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { storeService } from "./storeService";
import { CreateStoreSchema, UpdateStoreSchema, StoreIdParamSchema } from "./storeModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

export const storeRouter = (() => {
    
    const router = express.Router();
    // --- Public Routes ---
    // GET /v1/stores - (แก้ไข) ดึงข้อมูลร้านค้าที่อนุมัติแล้วสำหรับทุกคน
    router.get("/", async (_req: Request, res: Response) => {
        const serviceResponse = await storeService.findAllPublic();
        handleServiceResponse(serviceResponse, res);
    });

    // (ใหม่) GET /v1/stores/seller/mystore - ดึงข้อมูลร้านค้าของ Seller ที่ login อยู่
    router.get(
        "/my-store", // Endpoint ใหม่
        authenticateToken,
        authorizeRoles([Role.SELLER]), // *** ป้องกันให้เฉพาะ SELLER เท่านั้น ***
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication token is missing." });
                return;
            }

            const userPayload = req.token.payload;
            
            // เราต้องการแค่ id จาก payload
            const userForService = {
                id: userPayload.uuid
            };

            const serviceResponse = await storeService.findMyStore(userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

     // (ใหม่) GET /v1/stores/admin/all - ดึงร้านค้าทั้งหมดสำหรับ Admin
    router.get(
        "/admin/all",
        authenticateToken,
        authorizeRoles([Role.ADMIN]), // *** ป้องกันให้เฉพาะ ADMIN ***
        async (req: Request, res: Response) => {
            const serviceResponse = await storeService.findAllAdmin();
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    // GET /v1/stores/:storeId - ดึงข้อมูลร้านค้าเดียว (เหมือนเดิม)
    router.get("/:storeId", validateRequest(StoreIdParamSchema), async (req: Request, res: Response) => {
        const { storeId } = req.params;
        const serviceResponse = await storeService.findById(storeId);
        handleServiceResponse(serviceResponse, res);
    });

    // --- Seller Routes ---
    // POST /v1/stores - สร้างร้านค้าใหม่ (เหมือนเดิม)
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(CreateStoreSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication token is missing." });
                return; 
            }
            
            const userPayload = req.token.payload;
            const userForService = {
                id: userPayload.uuid,
                role: userPayload.role
            };

            const serviceResponse = await storeService.create(req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    router.patch(
        "/:storeId",
        authenticateToken,
        validateRequest(UpdateStoreSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication token is missing." });
                return; 
            }

            const { storeId } = req.params;
            const userPayload = req.token.payload;
            const userForService = {
                id: userPayload.uuid,
                role: userPayload.role
            };

            const serviceResponse = await storeService.update(storeId, req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) PATCH /v1/stores/admin/approve/:storeId - อนุมัติร้านค้า
    router.patch(
        "/admin/approve/:storeId",
        authenticateToken,
        authorizeRoles([Role.ADMIN]), // *** ป้องกันให้เฉพาะ ADMIN ***
        validateRequest(StoreIdParamSchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;
            const serviceResponse = await storeService.approveStore(storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) PATCH /v1/stores/admin/reject/:storeId - ยกเลิกการอนุมัติ
    router.patch(
        "/admin/reject/:storeId",
        authenticateToken,
        authorizeRoles([Role.ADMIN]), // *** ป้องกันให้เฉพาะ ADMIN ***
        validateRequest(StoreIdParamSchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;
            const serviceResponse = await storeService.rejectStore(storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();