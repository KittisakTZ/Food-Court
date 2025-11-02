// @modules/store/storeRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { storeService } from "./storeService";
import { CreateStoreSchema, StoreIdParamSchema, ToggleStoreStatusSchema, UpdateStoreSchema } from "./storeModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "./storeRepository";
import { z } from "zod";
import upload from '@common/utils/upload';

// --- Nested Routers ---
import { menuCategoryRouter } from "@modules/menu-category/menuCategoryRouter";
import { menuRouter } from "@modules/menu/menuRouter";
import { sellerOrderRouter } from "@modules/order/orderRouter";

// --- Schemas ---
const GetStoresQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().optional().default(1),
        pageSize: z.coerce.number().int().positive().optional().default(10),
        searchText: z.string().optional(),
        filterStatus: z.enum(['all', 'pending', 'approved']).optional(),
    }),
});


export const storeRouter = (() => {
    const router = express.Router();

    // ... (Nested Routers และ Public GET /)
    router.use("/:storeId/categories", menuCategoryRouter);
    router.use("/:storeId/menus", menuRouter);
    router.use("/my-store/orders", authenticateToken, authorizeRoles([Role.SELLER]), sellerOrderRouter);

    router.get(
        "/",
        validateRequest(GetStoresQuerySchema),
        async (req: Request, res: Response) => {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const searchText = req.query.searchText ? String(req.query.searchText) : undefined;
            const serviceResponse = await storeService.findAllPublic(page, pageSize, searchText);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.get("/my-store", authenticateToken, authorizeRoles([Role.SELLER]), async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
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
        upload.single('image'),
        async (req: Request, res: Response) => { // <-- Error เกิดขึ้นที่นี่
            try {
                const validatedBody = UpdateStoreSchema.shape.body.parse(req.body);

                if (!req.token) {
                    // 🔄 CHANGED: ไม่ return res.sendStatus(...)
                    res.sendStatus(StatusCodes.UNAUTHORIZED);
                    return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
                }
                const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);
                if (!userStore) {
                    // 🔄 CHANGED: ไม่ return res.status(...)
                    res.status(StatusCodes.NOT_FOUND).json({ message: "You do not own a store." });
                    return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
                }

                const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
                const serviceResponse = await storeService.update(userStore.id, validatedBody, userForService, req.file);
                handleServiceResponse(serviceResponse, res);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    // 🔄 CHANGED: ไม่ return res.status(...)
                    res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid input",
                        errors: error.errors,
                    });
                    return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
                }
                // 🔄 CHANGED: ไม่ return res.status(...)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
                return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
            }
        }
    );

    router.patch(
        "/my-store/status",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(ToggleStoreStatusSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
            }
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);
            if (!userStore) {
                res.status(StatusCodes.NOT_FOUND).json({ message: "You do not own a store yet." });
                return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
            }
            const { isOpen } = req.body;
            const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
            const serviceResponse = await storeService.toggleStoreStatus(userStore.id, isOpen, userForService);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.get("/admin/all", authenticateToken, authorizeRoles([Role.ADMIN]), async (req: Request, res: Response) => {
        const serviceResponse = await storeService.findAllAdmin();
        handleServiceResponse(serviceResponse, res);
    });

    // POST /v1/stores - Seller สร้างร้านค้าใหม่
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        upload.single('image'),
        async (req: Request, res: Response) => { // <-- Error เกิดขึ้นที่นี่ด้วย
            try {
                const validatedBody = CreateStoreSchema.shape.body.parse(req.body);

                if (!req.token) {
                    // 🔄 CHANGED: ไม่ return res.sendStatus(...)
                    res.sendStatus(StatusCodes.UNAUTHORIZED);
                    return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
                }
                const userForService = { id: req.token.payload.uuid, role: req.token.payload.role };
                const serviceResponse = await storeService.create(validatedBody, userForService, req.file);
                handleServiceResponse(serviceResponse, res);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    // 🔄 CHANGED: ไม่ return res.status(...)
                    res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid input",
                        errors: error.errors,
                    });
                    return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
                }
                // 🔄 CHANGED: ไม่ return res.status(...)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
                return; // ✅ FIX: ใช้ return; เพื่อออกจากฟังก์ชัน
            }
        }
    );


    // ... (ส่วนที่เหลือของ router เหมือนเดิม)

    router.get("/:storeId", validateRequest(StoreIdParamSchema), async (req: Request, res: Response) => {
        const { storeId } = req.params;
        const serviceResponse = await storeService.findById(storeId);
        handleServiceResponse(serviceResponse, res);
    });

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

    router.get(
        "/admin/paginated",
        authenticateToken,
        authorizeRoles([Role.ADMIN]),
        validateRequest(GetStoresQuerySchema),
        async (req: Request, res: Response) => {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 10;
            const searchText = req.query.searchText ? String(req.query.searchText) : undefined;
            const filterStatus = req.query.filterStatus ? String(req.query.filterStatus) : undefined;
            const serviceResponse = await storeService.findAllAdminPaginated(page, pageSize, searchText, filterStatus);
            handleServiceResponse(serviceResponse, res);
        }
    );

    router.get(
        "/admin/stats",
        authenticateToken,
        authorizeRoles([Role.ADMIN]),
        async (req: Request, res: Response) => {
            const serviceResponse = await storeService.getStoreStats();
            handleServiceResponse(serviceResponse, res);
        }
    );


    return router;
})();