import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { districtService } from "@modules/ms_district/districtService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_district/districtModel";

export const districtRouter = (() => {
    const router = express.Router();
    const permissionName = "District";

    router.post("/create", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const serviceResponse = await districtService.create(req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const provinceId = req.query.provinceId as string | undefined;
        const serviceResponse = await districtService.findAll(page, limit, search, provinceId);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:district_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { district_id } = req.params;
        const serviceResponse = await districtService.findById(district_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:district_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { district_id } = req.params;
        const serviceResponse = await districtService.update(district_id, req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:district_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { district_id } = req.params;
        const serviceResponse = await districtService.delete(district_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const provinceId = req.query.provinceId as string | undefined;
        const serviceResponse = await districtService.select(search, provinceId);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();