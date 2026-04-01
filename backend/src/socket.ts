import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "@common/utils/envConfig";
import { pino } from "pino";
import { chatRepository } from "./modules/chat/chatRepository";

const logger = pino({ name: "socket.io" });

export let io: SocketIOServer;

// ── KDS Helper ──────────────────────────────────────────────────────────────
export const emitKdsUpdate = (storeId: string, event: string, data: unknown) => {
    if (io) io.to(`kds:${storeId}`).emit(event, data);
};

// ── Buyer Order Helper ───────────────────────────────────────────────────────
// แจ้ง buyer ว่าสถานะ order ของตัวเองเปลี่ยนแปลง
export const emitOrderUpdate = (orderId: string, data: unknown) => {
    if (io) io.to(`order:${orderId}`).emit("order:status_update", data);
};

export const initializeSocket = (server: HttpServer) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: env.CORS_ORIGIN,
            credentials: true,
            methods: ["GET", "POST"],
        },
    });

    // 1. Authentication Middleware
    io.use((socket: Socket, next) => {
        // ดึง Cookie จาก connection header แทน (เพราะ Frontend ส่งมาพร้อมกับ withCredentials: true)
        const cookieHeader = socket.request.headers.cookie || "";
        
        // แตก string ของ cookie ออกมาหา token (ใช้การจับคู่ที่ทนทานกว่า)
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.split('=');
            if (name && rest.length > 0) {
                cookies[name.trim()] = rest.join('=').trim();
            }
        });
        const token = cookies.token;
        
        if (!token) {
            return next(new Error("Authentication error: No token provided in cookie"));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as any;
            console.info(`[Socket Middleware] Token verified for user: ${decoded.uuid || decoded.id}`);
            socket.data.user = decoded; // เก็บข้อมูล User (จาก JWT Payload) ไว้ที่ตัว socket
            next();
        } catch (err) {
            console.error(`[Socket Middleware] Auth Error: ${err}`);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    // 2. Connection Handling
    io.on("connection", (socket: Socket) => {
        const userId = socket.data.user.uuid || socket.data.user.id; // ดึงทั้ง uuid หรือ id
        if (!userId) {
            console.warn(`[Socket] Connected without userId! Data:`, socket.data.user);
        }
        logger.info(`✅ User connected: ${userId} (Socket ID: ${socket.id})`);

        // กรณีการ Join ห้องแชท
        socket.on("join_room", (roomId: string) => {
            socket.join(roomId);
            logger.info(`User ${userId} joined room ${roomId}`);
        });

        // KDS: Seller เข้าร่วมห้อง KDS ของร้านตัวเอง
        socket.on("join_kds", (storeId: string) => {
            socket.join(`kds:${storeId}`);
            logger.info(`User ${userId} joined KDS room kds:${storeId}`);
        });

        // Buyer ติดตามสถานะ order ของตัวเอง
        socket.on("join_order", (orderId: string) => {
            socket.join(`order:${orderId}`);
            logger.info(`User ${userId} joined order room order:${orderId}`);
        });

        // เมื่อมีการส่งข้อความ
        socket.on("send_message", async (data: { roomId: string, content: string }) => {
            console.info(`[Socket] Received send_message from ${userId} for room ${data.roomId}`);
            try {
                // บันทึกลง Database
                const savedMessage = await chatRepository.createMessage(
                    data.roomId,
                    userId,
                    data.content
                );
                console.info(`[Socket] Message saved to DB: ${savedMessage.id}. Broadcasting...`);

                // ส่งไปให้ทุกคนในห้องนั้นๆ (รวมถึงตัวเองเพื่อให้ได้รับการยืนยันว่าบันทึกสำเร็จ)
                io.to(data.roomId).emit("receive_message", savedMessage);
            } catch (error) {
                console.error(`[Socket] Error saving message: ${error}`);
                logger.error(`Error saving message: ${error}`);
            }
        });

        socket.on("disconnect", () => {
            logger.info(`❌ User disconnected: ${userId} (Socket ID: ${socket.id})`);
        });
    });

    return io;
};
