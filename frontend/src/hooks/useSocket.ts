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
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") || "http://localhost:5080";

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socketRef.current.on("connect", () => setIsConnected(true));
        socketRef.current.on("disconnect", () => setIsConnected(false));

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    const sendMessage = (roomId: string, content: string) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit("send_message", { roomId, content });
        }
    };

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
