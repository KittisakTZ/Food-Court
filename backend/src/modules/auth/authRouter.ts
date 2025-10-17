// @modules/auth/authRouter.ts
import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authService } from "@modules/auth/authService";
import { LoginSchema, RegisterSchema } from "@modules/auth/authModel"; 

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

    return router;
})();