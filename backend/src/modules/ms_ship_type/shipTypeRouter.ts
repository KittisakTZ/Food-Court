import express , {Request, Response, Router} from "express";

import { 
    handleServiceResponse, 
    validateRequest 
} from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import { shipTypeService } from "@modules/ms_ship_type/shipTypeService";
import { CreateSchema , UpdateSchema , DeleteSchema ,GetByIdSchema , GetAllSchema , SelectSchema } from "@modules/ms_ship_type/shipTypeModel";
import authenticateToken from "@common/middleware/authenticateToken";

export const shipTypeRouter = (() => {
    const router = express.Router();

    router.post("/create" , authenticateToken , authorizeByName("ประเภทการขนส่ง", ["A"]),validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await shipTypeService.create(payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/select" , authenticateToken , authorizeByName("ประเภทการขนส่ง" , ["A"]) ,validateRequest(SelectSchema) , async (req: Request, res: Response) => {
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await shipTypeService.select(searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get" , authenticateToken , authorizeByName("ประเภทการขนส่ง" , ["A"]) ,validateRequest(GetAllSchema) , async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await shipTypeService.fineAll(page, limit, searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get/:ship_type_id?" , authenticateToken , authorizeByName("ประเภทการขนส่ง" , ["A"]) ,validateRequest(GetByIdSchema) , async (req: Request, res: Response) => {
        const ship_type_id = req.params.ship_type_id;
        const ServiceResponse = await shipTypeService.findById(ship_type_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.put("/update/:ship_type_id?" , authenticateToken , authorizeByName("ประเภทการขนส่ง" , ["A"]) , validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const ship_type_id = req.params.ship_type_id;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await shipTypeService.update(ship_type_id, payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.delete("/delete/:ship_type_id?" , authenticateToken , authorizeByName("ประเภทการขนส่ง" , ["A"]) , validateRequest(DeleteSchema) , async (req: Request, res: Response) => {
        const ship_type_id = req.params.ship_type_id;
        const ServiceResponse = await shipTypeService.delete(ship_type_id);
        handleServiceResponse(ServiceResponse, res);
    })

    return router;
})();