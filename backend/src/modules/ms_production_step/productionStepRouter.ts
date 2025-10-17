import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { productionStepService } from "@modules/ms_production_step/productionStepService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_production_step/productionStepModel";

export const productionStepRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productionStepService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body; 
        const serviceResponse = await productionStepService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:step_id", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { step_id } = req.params;
        const serviceResponse = await productionStepService.findById(step_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:step_id", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { step_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productionStepService.update(step_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:step_id", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { step_id } = req.params;
        const serviceResponse = await productionStepService.delete(step_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName("ขั้นตอนการผลิต", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await productionStepService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();