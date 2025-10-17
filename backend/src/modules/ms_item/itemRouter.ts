import express , {Request, Response, Router} from "express";

import { 
    handleServiceResponse, 
    validateRequest 
} from "@common/utils/httpHandlers";
import { authorizeByName } from "@common/middleware/permissions";
import { itemService } from "@modules/ms_item/itemService";
import { CreateSchema , UpdateSchema , DeleteSchema ,GetByIdSchema , GetAllSchema , SelectSchema } from "@modules/ms_item/itemModel";
import authenticateToken from "@common/middleware/authenticateToken";
import { upload , handleMulter } from '@common/middleware/multerConfig';

export const itemRouter = (() => {
    const router = express.Router();

    router.post("/create", authenticateToken, authorizeByName("สินค้า", ["A"]), handleMulter(upload.array("item", 30)), async (req: Request, res: Response) => {
      try {
        const raw = req.body.payload; // raw = JSON string
        // console.log("raw", raw);
        let parsedData;
        parsedData = JSON.parse(raw);

        const validation = CreateSchema.safeParse({ body: parsedData });
        const payloadData = parsedData; // ใช้ค่า raw ที่ Parse มาโดยตรง
        // console.log("result check", validation.success);
        // console.log("result Data", payloadData);

        const files = req.files as Express.Multer.File[];
        const employee_id = req.token.payload.uuid;
        // console.log("files", files);
        const resultService = await itemService.create(payloadData, employee_id, files);
        // console.log("resultService", resultService);
        handleServiceResponse(resultService, res);
      } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    router.get("/select" , authenticateToken , authorizeByName("สินค้า" , ["A"]) ,validateRequest(SelectSchema) , async (req: Request, res: Response) => {
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await itemService.select(searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get" , authenticateToken , authorizeByName("สินค้า" , ["A"]) ,validateRequest(GetAllSchema) , async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const searchText = (req.query.search as string) || "";
        const ServiceResponse = await itemService.fineAll(page, limit, searchText);
        handleServiceResponse(ServiceResponse, res);
    })

    router.get("/get/:item_id?" , authenticateToken , authorizeByName("สินค้า" , ["A"]) ,validateRequest(GetByIdSchema) , async (req: Request, res: Response) => {
        const item_id = req.params.item_id;
        const ServiceResponse = await itemService.findById(item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    router.put("/update/:item_id?", authenticateToken, authorizeByName("สินค้า", ["A"]), handleMulter(upload.array("item", 20)), async (req: Request, res: Response) => {
      try {
        const raw = req.body.payload; // raw = JSON string
        // console.log("raw", raw);
        let parsedData;
        parsedData = JSON.parse(raw);

        const validation = UpdateSchema.safeParse({ body: parsedData });
        const payloadData = parsedData; // ใช้ค่า raw ที่ Parse มาโดยตรง
        // console.log("result check", validation.success);
        // console.log("result Data", payloadData);

        const files = req.files as Express.Multer.File[];
        const employee_id = req.token.payload.uuid;
        // console.log("files", files);
        const resultService = await itemService.create(payloadData, employee_id, files);
        // console.log("resultService", resultService);
        handleServiceResponse(resultService, res);
      } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    router.delete("/delete/:item_id?" , authenticateToken , authorizeByName("สินค้า" , ["A"]) , validateRequest(DeleteSchema) , async (req: Request, res: Response) => {
        const item_id = req.params.item_id;
        const ServiceResponse = await itemService.delete(item_id);
        handleServiceResponse(ServiceResponse, res);
    })

    return router;
})();