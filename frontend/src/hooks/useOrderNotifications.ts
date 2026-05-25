// @/hooks/useOrderNotifications.ts
// Buyer-side: subscribes to order status socket events and shows toast notifications.

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toastService } from "@/services/toast.service";
import { useAuthStore } from "@/zustand/useAuthStore";

const STATUS_TOASTS: Record<string, { msg: string; type: 'success' | 'error' | 'warning' }> = {
  AWAITING_PAYMENT:      { type: 'success', msg: "Store confirmed your order. Please complete your PromptPay payment." },
  AWAITING_CONFIRMATION: { type: 'success', msg: "Payment slip received. The store is verifying your payment." },
  COOKING:               { type: 'success', msg: "The store has confirmed your order and is now preparing your food!" },
  READY_FOR_PICKUP:      { type: 'success', msg: "Your order is ready for pickup! Please collect it at the store." },
  COMPLETED:             { type: 'success', msg: "Order completed. Thank you for your order!" },
  REJECTED:              { type: 'error',   msg: "Your order was rejected by the store." },
  CANCELLED:             { type: 'error',   msg: "Your order has been cancelled." },
};

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

        socketRef.current.on("order:status_update", (data: { status: string }) => {
            const toast = STATUS_TOASTS[data.status];
            if (!toast) return;
            toastService[toast.type](toast.msg);
        });

        return () => { socketRef.current?.disconnect(); };
    }, [user?.role]);
};
