// @/modules/cart/cartRouter.ts (ฉบับแก้ไข)

import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { cartService } from "./cartService";
import { AddToCartSchema, UpdateCartItemSchema, CartItemIdParamSchema } from "./cartModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { StatusCodes } from "http-status-codes";

export const cartRouter = (() => {
    const router = express.Router();
    
    // ใช้ authenticateToken กับทุก Route ใน Router นี้
    router.use(authenticateToken);
    
    // GET /v1/cart - ดึงข้อมูลตะกร้าของฉัน
    router.get("/", async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const serviceResponse = await cartService.getCart(req.token.payload.uuid);
        handleServiceResponse(serviceResponse, res);
    });
    
    // POST /v1/cart/items - เพิ่มของลงตะกร้า
    router.post("/items", validateRequest(AddToCartSchema), async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const { menuId, quantity } = req.body;
        const serviceResponse = await cartService.addItemToCart(req.token.payload.uuid, menuId, quantity);
        handleServiceResponse(serviceResponse, res);
    });

    // PATCH /v1/cart/items/:itemId - อัปเดตจำนวน
    router.patch("/items/:itemId", validateRequest(UpdateCartItemSchema), async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const { itemId } = req.params;
        const { quantity } = req.body;
        const serviceResponse = await cartService.updateItemQuantity(req.token.payload.uuid, itemId, quantity);
        handleServiceResponse(serviceResponse, res);
    });

    // DELETE /v1/cart - ล้างตะกร้า
    router.delete("/", async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const serviceResponse = await cartService.clearCart(req.token.payload.uuid);
        handleServiceResponse(serviceResponse, res);
    });
    
    // DELETE /v1/cart/items/:itemId - ลบของชิ้นเดียว
    router.delete("/items/:itemId", validateRequest(CartItemIdParamSchema), async (req: Request, res: Response) => {
        if (!req.token) {
            res.sendStatus(StatusCodes.UNAUTHORIZED);
            return;
        }
        const serviceResponse = await cartService.updateItemQuantity(req.token.payload.uuid, req.params.itemId, 0);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();