import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { wasteProductService } from "@modules/ms_waste_product/wasteProductService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_waste_product/wasteProductModel";

export const wasteProductRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await wasteProductService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body; 
        const serviceResponse = await wasteProductService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:waste_product_id", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { waste_product_id } = req.params;
        const serviceResponse = await wasteProductService.findById(waste_product_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:waste_product_id", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { waste_product_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await wasteProductService.update(waste_product_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:waste_product_id", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { waste_product_id } = req.params;
        const serviceResponse = await wasteProductService.delete(waste_product_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/select", authenticateToken, authorizeByName("สาเหตุของเสีย", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await wasteProductService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();