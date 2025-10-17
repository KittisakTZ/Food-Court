import express, { Request, Response } from "express";
import { handleServiceResponse, validateRequest } from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import authenticateToken from "@common/middleware/authenticateToken";
import { countryService } from "@modules/ms_country/countryService";
import { CreateSchema, UpdateSchema, DeleteSchema, GetByIdSchema, GetAllSchema, SelectSchema } from "@modules/ms_country/countryModel";

export const countryRouter = (() => {
    const router = express.Router();
    const permissionName = "Country";

    router.post("/create", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const serviceResponse = await countryService.create(req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetAllSchema), async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const search = (req.query.search as string) || "";
        const serviceResponse = await countryService.findAll(page, limit, search);
        handleServiceResponse(serviceResponse, res);
    });

    router.get("/get/:country_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(GetByIdSchema), async (req: Request, res: Response) => {
        const { country_id } = req.params;
        const serviceResponse = await countryService.findById(country_id);
        handleServiceResponse(serviceResponse, res);
    });

    router.put("/update/:country_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const { country_id } = req.params;
        const serviceResponse = await countryService.update(country_id, req.body);
        handleServiceResponse(serviceResponse, res);
    });

    router.delete("/delete/:country_id", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(DeleteSchema), async (req: Request, res: Response) => {
        const { country_id } = req.params;
        const serviceResponse = await countryService.delete(country_id);
        handleServiceResponse(serviceResponse, res);
    });
    
    router.get("/select", authenticateToken, authorizeByName(permissionName, ["A"]), validateRequest(SelectSchema), async (req: Request, res: Response) => {
        const search = (req.query.search as string) || "";
        const serviceResponse = await countryService.select(search);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();