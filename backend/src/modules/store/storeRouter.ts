// @modules/store/storeRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { storeService } from "./storeService";
import { CreateStoreSchema, StoreIdParamSchema, ToggleStoreStatusSchema } from "./storeModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "./storeRepository";
import { z } from "zod";

// --- Nested Routers ---
import { menuCategoryRouter } from "@modules/menu-category/menuCategoryRouter";
import { menuRouter } from "@modules/menu/menuRouter";
import { sellerOrderRouter } from "@modules/order/orderRouter";

// --- Schemas for this Router ---
const MyStoreUpdateBodySchema = z.object({
    name: z.string().min(1, "Name is required").max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    location: z.string().max(255).optional().nullable(),
});

const GetStoresQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
        searchText: z.string().optional(),
    }),
});


export const storeRouter = (() => {
    const router = express.Router();
    
    // ====================================================================
    // 1. NESTED ROUTERS - การ "ส่งต่อ" Request ไปยัง Router อื่น
    // ====================================================================
    router.use("/:storeId/categories", menuCategoryRouter);
    router.use("/:storeId/menus", menuRouter);
    router.use("/my-store/orders", authenticateToken, authorizeRoles([Role.SELLER]), sellerOrderRouter);
    
    // ====================================================================
    // 2. STATIC PATHS - Route ที่มี Path ตายตัว ต้องอยู่ก่อน Dynamic Paths
    // ====================================================================

    // --- Public Route (Static) ---
    // GET /v1/stores - ดึงร้านค้าทั้งหมด (Public)
    router.get("/", validateRequest(GetStoresQuerySchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string);
        const pageSize = parseInt(req.query.pageSize as string);
        const searchText = req.query.searchText as string | undefined;
        const serviceResponse = await storeService.findAllPublic(page, pageSize, searchText);
        handleServiceResponse(serviceResponse, res);
    });

    // --- Seller Routes (Static) ---
    // GET /v1/stores/my-store - ดึงข้อมูลร้านของ Seller ที่ Login อยู่
    router.get("/my-store", authenticateToken, authorizeRoles([Role.SELLER]), async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
        const serviceResponse = await storeService.findMyStore(userForService);
        handleServiceResponse(serviceResponse, res);
    });
    
    // PATCH /v1/stores/my-store - Seller อัปเดตข้อมูลร้านของตัวเอง
    router.patch(
        "/my-store",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(z.object({ body: MyStoreUpdateBodySchema })),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);
            if (!userStore) {
                res.status(StatusCodes.NOT_FOUND).json({ message: "You do not own a store." });
                return;
            }
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await storeService.update(userStore.id, req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    // PATCH /v1/stores/my-store/status - Seller เปิด/ปิดร้าน
    router.patch(
        "/my-store/status",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(ToggleStoreStatusSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);
            if (!userStore) {
                res.status(StatusCodes.NOT_FOUND).json({ message: "You do not own a store yet." });
                return;
            }
            const { isOpen } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await storeService.toggleStoreStatus(userStore.id, isOpen, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // --- Admin Routes (Static) ---
    // GET /v1/stores/admin/all - Admin ดึงร้านค้าทั้งหมด
    router.get("/admin/all", authenticateToken, authorizeRoles([Role.ADMIN]), async (req: Request, res: Response) => {
        const serviceResponse = await storeService.findAllAdmin();
        handleServiceResponse(serviceResponse, res);
    });

    // --- Create Route (Static) ---
    // POST /v1/stores - Seller สร้างร้านค้าใหม่
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(CreateStoreSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await storeService.create(req.body, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // =====================================================================
    // 3. DYNAMIC PATHS - Route ที่มี Parameters ต้องอยู่ล่างสุดเพื่อไม่ให้ "ดัก" Route อื่น
    // =====================================================================
    
    // --- Public Route (Dynamic) ---
    // GET /v1/stores/:storeId - ดึงข้อมูลร้านค้าเดียว (Public)
    router.get("/:storeId", validateRequest(StoreIdParamSchema), async (req: Request, res: Response) => {
        const { storeId } = req.params;
        const serviceResponse = await storeService.findById(storeId);
        handleServiceResponse(serviceResponse, res);
    });
    
    // --- Admin Routes (Dynamic) ---
    // PATCH /v1/stores/admin/approve/:storeId - Admin อนุมัติร้านค้า
    router.patch(
        "/admin/approve/:storeId",
        authenticateToken,
        authorizeRoles([Role.ADMIN]),
        validateRequest(StoreIdParamSchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;
            const serviceResponse = await storeService.approveStore(storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );
    
    // PATCH /v1/stores/admin/reject/:storeId - Admin ยกเลิกการอนุมัติ
    router.patch(
        "/admin/reject/:storeId",
        authenticateToken,
        authorizeRoles([Role.ADMIN]),
        validateRequest(StoreIdParamSchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;
            const serviceResponse = await storeService.rejectStore(storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();