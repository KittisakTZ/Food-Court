// @modules/menu/menuRouter.ts

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { menuService } from "./menuService";
import { CreateMenuSchema, UpdateMenuSchema, MenuIdParamSchema, GetMenusQuerySchema } from "./menuModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { authorizeRoles } from "@common/middleware/authorizeRoles";
import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { storeRepository } from "@modules/store/storeRepository";
import upload from '@common/utils/upload';
import { z } from "zod";

export const menuRouter = (() => {
    const router = express.Router({ mergeParams: true });

    // GET /v1/stores/:storeId/menus - ดูเมนูทั้งหมดของร้าน (Public)
    router.get(
        "/",
        validateRequest(GetMenusQuerySchema),
        async (req: Request, res: Response) => {
            const { storeId } = req.params;

            // **** แก้ไขตรงนี้ ****
            // Zod ได้ Validate และกำหนด Default ให้แล้ว เราจึงมั่นใจได้ว่าค่าเป็น String ที่แปลงเป็นตัวเลขได้
            const page = parseInt(req.query.page as string);
            const pageSize = parseInt(req.query.pageSize as string);
            // searchText เป็น optional และเป็น string อยู่แล้ว
            const searchText = req.query.searchText as string | undefined;

            // ส่งค่าที่แปลงแล้วและมี Type ถูกต้องเข้าไปใน Service
            const serviceResponse = await menuService.findByStoreId(storeId, page, pageSize, searchText);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // POST /v1/stores/:storeId/menus
    router.post(
        "/",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        upload.single('image'),
        async (req: Request, res: Response) => {
            try {
                const validatedBody = CreateMenuSchema.shape.body.parse(req.body);

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

                const serviceResponse = await menuService.create(validatedBody, storeId, req.file);
                handleServiceResponse(serviceResponse, res);

            } catch (error) {
                if (error instanceof z.ZodError) {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid input",
                        errors: error.errors,
                    });
                    return;
                }
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
                return;
            }
        }
    );

    // PATCH /v1/stores/:storeId/menus/:menuId
    router.patch(
        "/:menuId",
        authenticateToken,
        authorizeRoles([Role.SELLER]),
        upload.single('image'),
        async (req: Request, res: Response) => {
            try {
                const { menuId } = MenuIdParamSchema.shape.params.parse(req.params);
                const validatedBody = UpdateMenuSchema.shape.body.parse(req.body);

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

                const serviceResponse = await menuService.update(menuId, validatedBody, storeId, req.file);
                handleServiceResponse(serviceResponse, res);

            } catch (error) {
                if (error instanceof z.ZodError) {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Invalid input",
                        errors: error.errors,
                    });
                    return;
                }
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred." });
                return;
            }
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