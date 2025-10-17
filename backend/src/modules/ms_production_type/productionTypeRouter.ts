import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { productionTypeService } from "@modules/ms_production_type/productionTypeService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_production_type/productionTypeModel";

export const productionTypeRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productionTypeService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body; 
        const serviceResponse = await productionTypeService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:production_type_id", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { production_type_id } = req.params;
        const serviceResponse = await productionTypeService.findById(production_type_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:production_type_id", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { production_type_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productionTypeService.update(production_type_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:production_type_id", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { production_type_id } = req.params;
        const serviceResponse = await productionTypeService.delete(production_type_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName("ประเภทการผลิต", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await productionTypeService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();