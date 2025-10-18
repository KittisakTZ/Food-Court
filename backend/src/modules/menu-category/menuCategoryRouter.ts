// @modules/menu-category/menuCategoryRouter.ts (ฉบับแก้ไข)

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { menuCategoryService } from "./menuCategoryService";
import { CreateMenuCategorySchema, UpdateMenuCategorySchema, MenuCategoryIdParamSchema } from "./menuCategoryModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "@modules/store/storeRepository";

export const menuCategoryRouter = (() => {
    const router = express.Router({ mergeParams: true });

    // GET /v1/stores/:storeId/categories
    router.get("/", async (req: Request, res: Response) => {
        const { storeId } = req.params;
        const serviceResponse = await menuCategoryService.findByStoreId(storeId);
        handleServiceResponse(serviceResponse, res);
    });

    // POST /v1/stores/:storeId/categories
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(CreateMenuCategorySchema),
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

            const serviceResponse = await menuCategoryService.create(req.body, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // PATCH /v1/stores/:storeId/categories/:categoryId
    router.patch(
        "/:categoryId",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(UpdateMenuCategorySchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const { storeId, categoryId } = req.params;
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);

            if (!userStore || userStore.id !== storeId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this store." });
                return;
            }

            const serviceResponse = await menuCategoryService.update(categoryId, req.body, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // DELETE /v1/stores/:storeId/categories/:categoryId
    router.delete(
        "/:categoryId",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        validateRequest(MenuCategoryIdParamSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }

            const { storeId, categoryId } = req.params;
            const userStore = await storeRepository.findByOwnerId(req.token.payload.uuid);

            if (!userStore || userStore.id !== storeId) {
                res.status(StatusCodes.FORBIDDEN).json({ message: "You are not the owner of this store." });
                return;
            }

            const serviceResponse = await menuCategoryService.delete(categoryId, storeId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();