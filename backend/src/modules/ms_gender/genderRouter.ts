import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { genderService } from "@modules/ms_gender/genderService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_gender/genderModel";

export const genderRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await genderService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body;
        const serviceResponse = await genderService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:gender_id", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { gender_id } = req.params;
        const serviceResponse = await genderService.findById(gender_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:gender_id", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { gender_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await genderService.update(gender_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:gender_id", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { gender_id } = req.params;
        const serviceResponse = await genderService.delete(gender_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/select", authenticateToken, authorizeByName("เพศ", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await genderService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();