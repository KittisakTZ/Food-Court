import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { productTypeService } from "@modules/ms_product_type/productTypeService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_product_type/productTypeModel";

export const productTypeRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productTypeService.create(payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.post("/get", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const payload = req.body;
        const serviceResponse = await productTypeService.findAll(page, limit, search, payload);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:product_type_id", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { product_type_id } = req.params;
        const serviceResponse = await productTypeService.findById(product_type_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:product_type_id", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { product_type_id } = req.params;
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const serviceResponse = await productTypeService.update(product_type_id, payload, employee_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:product_type_id", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { product_type_id } = req.params;
        const serviceResponse = await productTypeService.delete(product_type_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/select", authenticateToken, authorizeByName("หมวดหมู่สินค้า", ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await productTypeService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();