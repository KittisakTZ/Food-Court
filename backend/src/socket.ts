import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "@common/utils/envConfig";
import { pino } from "pino";
import { chatRepository } from "./modules/chat/chatRepository";

const logger = pino({ name: "socket.io" });

const MAX_MESSAGE_LENGTH = 2000;

interface SocketJwtPayload {
    uuid: string;
    username: string;
    role: string;
}

export let io: SocketIOServer;

// ── KDS Helper ──────────────────────────────────────────────────────────────
export const emitKdsUpdate = (storeId: string, event: string, data: unknown) => {
    if (io) io.to(`kds:${storeId}`).emit(event, data);
};

// ── Buyer Order Helper ───────────────────────────────────────────────────────
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
        const cookieHeader = socket.request.headers.cookie || "";
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.split('=');
            if (name && rest.length > 0) {
                cookies[name.trim()] = rest.join('=').trim();
            }
        });
        const token = cookies.token;

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as SocketJwtPayload;
            socket.data.user = decoded;
            next();
        } catch (err) {
            logger.warn({ err }, "[Socket] Auth failed: invalid token");
            next(new Error("Authentication error: Invalid token"));
        }
    });

    // 2. Connection Handling
    io.on("connection", (socket: Socket) => {
        const user = socket.data.user as SocketJwtPayload;
        const userId = user?.uuid;

        if (!userId) {
            logger.warn("[Socket] Connected without userId — disconnecting");
            socket.disconnect(true);
            return;
        }

        logger.info(`User connected: ${userId} (Socket: ${socket.id})`);

        socket.on("join_room", (roomId: string) => {
            if (typeof roomId !== "string" || !roomId.trim()) return;
            socket.join(roomId);
            logger.info(`User ${userId} joined room ${roomId}`);
        });

        socket.on("join_kds", (storeId: string) => {
            if (typeof storeId !== "string" || !storeId.trim()) return;
            socket.join(`kds:${storeId}`);
            logger.info(`User ${userId} joined KDS room kds:${storeId}`);
        });

        socket.on("join_order", (orderId: string) => {
            if (typeof orderId !== "string" || !orderId.trim()) return;
            socket.join(`order:${orderId}`);
            logger.info(`User ${userId} joined order room order:${orderId}`);
        });

        socket.on("send_message", async (data: { roomId: string; content: string }) => {
            if (!data || typeof data.roomId !== "string" || typeof data.content !== "string") return;

            const content = data.content.trim();
            if (!content || content.length > MAX_MESSAGE_LENGTH) {
                socket.emit("message_error", { message: "Invalid message content" });
                return;
            }

            try {
                const savedMessage = await chatRepository.createMessage(data.roomId, userId, content);
                io.to(data.roomId).emit("receive_message", savedMessage);
            } catch (error) {
                logger.error({ error }, `Failed to save message from user ${userId}`);
                socket.emit("message_error", { message: "Failed to send message" });
            }
        });

        socket.on("disconnect", () => {
            logger.info(`User disconnected: ${userId} (Socket: ${socket.id})`);
        });
    });

    return io;
};
