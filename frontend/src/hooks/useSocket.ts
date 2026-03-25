import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // อ้างอิงจาก VITE_API_BASE_URL (เช่น http://localhost:5080)
        // ต้องตัด /v1 ออกถ้าเซิร์ฟเวอร์ไม่ได้ตั้ง path ไว้ที่ /v1/socket.io
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/v1", "") || "http://localhost:5080";

        socketRef.current = io(baseUrl, {
            withCredentials: true, // เพื่อให้ส่ง Cookie accessToken ไปด้วยสำหรับการ Auth
            transports: ["websocket", "polling"],
        });

        socketRef.current.on("connect", () => {
            setIsConnected(true);
            console.log("Socket connected:", socketRef.current?.id);
        });

        socketRef.current.on("disconnect", () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // ส่งข้อความ
    const sendMessage = (roomId: string, content: string) => {
        if (socketRef.current && isConnected) {
            console.info(`[useSocket] Sending message to room ${roomId}: ${content}`);
            socketRef.current.emit("send_message", { roomId, content });
        } else {
            console.warn("[useSocket] Cannot send message: socket not connected or null", { isConnected, socket: !!socketRef.current });
        }
    };

    // เข้าร่วมห้องแชท
    const joinRoom = (roomId: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit("join_room", roomId);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        sendMessage,
        joinRoom,
    };
};
