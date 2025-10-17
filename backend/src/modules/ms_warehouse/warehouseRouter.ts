import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { warehouseService } from "@modules/ms_warehouse/warehouseService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_warehouse/warehouseModel";

export const warehouseRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await warehouseService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body; 
        const serviceResponse = await warehouseService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:warehouse_id", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { warehouse_id } = req.params;
        const serviceResponse = await warehouseService.findById(warehouse_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:warehouse_id", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { warehouse_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await warehouseService.update(warehouse_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:warehouse_id", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { warehouse_id } = req.params;
        const serviceResponse = await warehouseService.delete(warehouse_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/select", authenticateToken, authorizeByName("คลังสินค้า", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await warehouseService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();