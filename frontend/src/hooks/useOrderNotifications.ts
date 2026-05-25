// @/hooks/useOrderNotifications.ts
// Subscribes to socket order status events and shows in-app toast notifications.

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toastService } from "@/services/toast.service";
import { useAuthStore } from "@/zustand/useAuthStore";

export const useOrderNotifications = () => {
    const { user } = useAuthStore();
    const socketRef = useRef<ReturnType<typeof io> | null>(null);

    useEffect(() => {
        if (user?.role !== "BUYER") return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") || "http://localhost:5080";
        const token = localStorage.getItem("token") || "";

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            auth: { token: token.replace(/['"]+/g, "") },
        });

        socketRef.current.on("order:status_update", (data: { status: string; orderId?: string }) => {
            if (data.status === "COOKING") {
                toastService.success("Your order has been confirmed and is now being prepared!");
            } else if (data.status === "READY_FOR_PICKUP") {
                toastService.success("Your order is ready for pickup! Please collect it at the store.");
            } else if (data.status === "AWAITING_PAYMENT") {
                toastService.success("Order confirmed! Please complete payment.");
            } else if (data.status === "REJECTED") {
                toastService.error("Your order was rejected by the store.");
            } else if (data.status === "CANCELLED") {
                toastService.error("Your order has been cancelled.");
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user?.role]);
};
