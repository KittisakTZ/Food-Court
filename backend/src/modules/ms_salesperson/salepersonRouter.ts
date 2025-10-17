import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { salepersonService } from "@modules/ms_salesperson/salepersonService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_salesperson/salepersonModel";

export const salepersonRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await salepersonService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body;
        const serviceResponse = await salepersonService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:saleperson_id", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { saleperson_id } = req.params;
        const serviceResponse = await salepersonService.findById(saleperson_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:saleperson_id", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { saleperson_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await salepersonService.update(saleperson_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:saleperson_id", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { saleperson_id } = req.params;
        const serviceResponse = await salepersonService.delete(saleperson_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName("พนักงานขาย", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await salepersonService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();