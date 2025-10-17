import express , {Request, Response, Router} from "express";

import { 
    handleServiceResponse, 
    validateRequest 
} from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import { groupItemService } from "@modules/ms_group_item/groupItemService";
import { CreateSchema , UpdateSchema , DeleteSchema ,GetByIdSchema , GetAllSchema , SelectSchema } from "@modules/ms_group_item/groupItemModel";
import authenticateToken from "@common/middleware/authenticateToken";

export const groupItemRouter = (() => {
    const router = express.Router();

    router.post("/create" , authenticateToken , authorizeByName("กลุ่มสินค้า", ["A"]),validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await groupItemService.create(payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/select" , authenticateToken , authorizeByName("กลุ่มสินค้า" , ["A"]) ,validateRequest(SelectSchema) , async (req: Request, res: Response) => {
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await groupItemService.select(searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get" , authenticateToken , authorizeByName("กลุ่มสินค้า" , ["A"]) ,validateRequest(GetAllSchema) , async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await groupItemService.fineAll(page, limit, searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get/:group_item_id?" , authenticateToken , authorizeByName("กลุ่มสินค้า" , ["A"]) ,validateRequest(GetByIdSchema) , async (req: Request, res: Response) => {
        const group_item_id = req.params.group_item_id;
        const ServiceResponse = await groupItemService.findById(group_item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.put("/update/:group_item_id?" , authenticateToken , authorizeByName("กลุ่มสินค้า" , ["A"]) , validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const group_item_id = req.params.group_item_id;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await groupItemService.update(group_item_id, payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.delete("/delete/:group_item_id?" , authenticateToken , authorizeByName("กลุ่มสินค้า" , ["A"]) , validateRequest(DeleteSchema) , async (req: Request, res: Response) => {
        const group_item_id = req.params.group_item_id;
        const ServiceResponse = await groupItemService.delete(group_item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    return router;
})();