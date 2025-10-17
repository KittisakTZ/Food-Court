import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { provinceService } from "@modules/ms_province/provinceService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_province/provinceModel";

export const provinceRouter = (() => {
    const router = express.Router();
    const permissionName = "Province";

    router.post("/create", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const serviceResponse = await provinceService.create(req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const countryId = req.query.countryId as string | undefined;
        const serviceResponse = await provinceService.findAll(page, limit, search, countryId);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:province_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { province_id } = req.params;
        const serviceResponse = await provinceService.findById(province_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:province_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { province_id } = req.params;
        const serviceResponse = await provinceService.update(province_id, req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:province_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { province_id } = req.params;
        const serviceResponse = await provinceService.delete(province_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const countryId = req.query.countryId as string | undefined;
        const serviceResponse = await provinceService.select(search, countryId);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();