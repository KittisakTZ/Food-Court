import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { storageLocationService } from "@modules/ms_storage_location/storageLocationService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_storage_location/storageLocationModel";

export const storageLocationRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await storageLocationService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const warehouseId = req.query.warehouseId as string | undefined;
        const payload = req.body; 
        const serviceResponse = await storageLocationService.findAll(page, limit, search, warehouseId, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:storage_location_id", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { storage_location_id } = req.params;
        const serviceResponse = await storageLocationService.findById(storage_location_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:storage_location_id", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { storage_location_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await storageLocationService.update(storage_location_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:storage_location_id", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { storage_location_id } = req.params;
        const serviceResponse = await storageLocationService.delete(storage_location_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/select", authenticateToken, authorizeByName("สถานที่จัดเก็บ", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const warehouseId = req.query.warehouseId as string | undefined;
        const serviceResponse = await storageLocationService.select(search, warehouseId);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();