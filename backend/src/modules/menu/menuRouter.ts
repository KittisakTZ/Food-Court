// @modules/menu/menuRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { menuService } from "./menuService";
import { CreateMenuSchema, UpdateMenuSchema, MenuIdParamSchema } from "./menuModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "@modules/store/storeRepository";

export const menuRouter = (() => {
    const router = express.Router({ mergeParams: true });

    // GET /v1/stores/:storeId/menus - ดูเมนูทั้งหมดของร้าน (Public)
    router.get("/", async (req: Request, res: Response) => {
        const { storeId } = req.params;
        const serviceResponse = await menuService.findByStoreId(storeId);
        handleServiceResponse(serviceResponse, res);
    });

    // POST /v1/stores/:storeId/menus - สร้างเมนูใหม่ (Seller เจ้าของร้าน)
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(CreateMenuSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const { storeId } = req.params;
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);

            if (!userStore || userStore.id !== storeId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this store." });
                return;
            }

            const serviceResponse = await menuService.create(req.body, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /v1/stores/:storeId/menus/:menuId - อัปเดตเมนู (Seller เจ้าของร้าน)
    router.patch(
        "/:menuId",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(UpdateMenuSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const { storeId, menuId } = req.params;
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);

            if (!userStore || userStore.id !== storeId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this store." });
                return;
            }

            const serviceResponse = await menuService.update(menuId, req.body, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // DELETE /v1/stores/:storeId/menus/:menuId - ลบเมนู (Seller เจ้าของร้าน)
    router.delete(
        "/:menuId",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(MenuIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const { storeId, menuId } = req.params;
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);

            if (!userStore || userStore.id !== storeId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this store." });
                return;
            }

            const serviceResponse = await menuService.delete(menuId, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();