import express, { Request, Response } from "express";
import { handleServiceResponse } from "@common/utils/httpHandlers";
import { chatService } from "./chatService";
import authenticateToken from "@common/middleware/authenticateToken";

export const chatRouter = (() => {
    const router = express.Router();

    // ต้องล็อกอินทุกเส้นทางสำหรับแชท
    router.use(authenticateToken);

    // 1. GET /v1/chats -> ดึงห้องแชทของฉัน
    router.get("/", async (req: Request, res: Response) => {
        const userId = req.token!.payload.uuid;
        const serviceResponse = await chatService.getMyChatRooms(userId);
        handleServiceResponse(serviceResponse, res);
    });

    // 2. POST /v1/chats/store/:storeId -> เริ่มแชทกับร้าน
    router.post("/store/:storeId", async (req: Request, res: Response) => {
        const buyerId = req.token!.payload.uuid;
        const storeId = req.params.storeId;
        const serviceResponse = await chatService.startChatWithStore(buyerId, storeId);
        handleServiceResponse(serviceResponse, res);
    });

    // 3. GET /v1/chats/:roomId/messages -> โหลดข้อความเก่าๆ 
    router.get("/:roomId/messages", async (req: Request, res: Response) => {
        const roomId = req.params.roomId;
        // (Optional) อาจจะต้องตรวจสอบสิทธิ์ก่อนด้วยว่า req.user อยู่ในห้องนี้จริงไหม
        const serviceResponse = await chatService.getRoomMessages(roomId);
        handleServiceResponse(serviceResponse, res);
    });

    return router;
})();
