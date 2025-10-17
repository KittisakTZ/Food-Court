import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { customerService } from "@modules/ms_customer/customerService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_customer/customerModel";

export const customerRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await customerService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body;
        const serviceResponse = await customerService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:customer_id", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { customer_id } = req.params;
        const serviceResponse = await customerService.findById(customer_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:customer_id", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { customer_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await customerService.update(customer_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:customer_id", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { customer_id } = req.params;
        const serviceResponse = await customerService.delete(customer_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName("ลูกค้า", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await customerService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();