// @modules/auth/authRouter.ts
import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authService } from "@modules/auth/authService";
import { LoginSchema, RegisterSchema, UpdateProfileSchema } from "@modules/auth/authModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { StatusCodes } from "http-status-codes";

export const authRouter = (() => {
    const router = express.Router();

    router.post("/register", validateRequest(RegisterSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const serviceResponse = await authService.register(payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/login", validateRequest(LoginSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const serviceResponse = await authService.login(payload, res);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/logout", async (_req: Request, res: Response) => {
        const serviceResponse = await authService.logout(res);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/auth-status", async (req: Request, res: Response) => {
        const serviceResponse = authService.authStatus(req);
        handleServiceResponse(serviceResponse, res);
    });

    // GET /v1/auth/me - ดึงข้อมูลโปรไฟล์ของฉัน
    router.get(
        "/me",
        authenticateToken,
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const userId = req.token.payload.uuid;
            const serviceResponse = await authService.me(userId);
            handleServiceResponse(serviceResponse, res);
        }
    );

    // (ใหม่) PUT /v1/auth/me - อัปเดตโปรไฟล์ของฉัน
    router.put(
        "/me",
        authenticateToken,
        validateRequest(UpdateProfileSchema),
        async (req: Request, res: Response) => {
            if (!req.token) {
                res.sendStatus(StatusCodes.UNAUTHORIZED);
                return;
            }
            const userId = req.token.payload.uuid;
            const serviceResponse = await authService.updateProfile(userId, req.body);
            handleServiceResponse(serviceResponse, res);
        }
    );

    return router;
})();