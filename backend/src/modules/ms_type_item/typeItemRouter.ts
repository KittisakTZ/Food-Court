import express , {Request, Response, Router} from "express";

import { 
    handleServiceResponse, 
    validateRequest 
} from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import { typeItemService } from "@modules/ms_type_item/typeItemService";
import { CreateSchema , UpdateSchema , DeleteSchema ,GetByIdSchema , GetAllSchema , SelectSchema } from "@modules/ms_type_item/typeItemModel";
import authenticateToken from "@common/middleware/authenticateToken";

export const typeItemRouter = (() => {
    const router = express.Router();

    router.post("/create" , authenticateToken , authorizeByName("ประเภทสินค้า", ["A"]),validateRequest(CreateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await typeItemService.create(payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/select" , authenticateToken , authorizeByName("ประเภทสินค้า" , ["A"]) ,validateRequest(SelectSchema) , async (req: Request, res: Response) => {
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await typeItemService.select(searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get" , authenticateToken , authorizeByName("ประเภทสินค้า" , ["A"]) ,validateRequest(GetAllSchema) , async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await typeItemService.fineAll(page, limit, searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get/:type_item_id?" , authenticateToken , authorizeByName("ประเภทสินค้า" , ["A"]) ,validateRequest(GetByIdSchema) , async (req: Request, res: Response) => {
        const type_item_id = req.params.type_item_id;
        const ServiceResponse = await typeItemService.findById(type_item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.put("/update/:type_item_id?" , authenticateToken , authorizeByName("ประเภทสินค้า" , ["A"]) , validateRequest(UpdateSchema), async (req: Request, res: Response) => {
        const payload = req.body;
        const type_item_id = req.params.type_item_id;
        const employee_id = req.token.payload.uuid;
        const ServiceResponse = await typeItemService.update(type_item_id, payload, employee_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.delete("/delete/:type_item_id?" , authenticateToken , authorizeByName("ประเภทสินค้า" , ["A"]) , validateRequest(DeleteSchema) , async (req: Request, res: Response) => {
        const type_item_id = req.params.type_item_id;
        const ServiceResponse = await typeItemService.delete(type_item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    return router;
})();