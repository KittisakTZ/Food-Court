// @/hooks/useOrderNotifications.ts
// Buyer-side: subscribes to order status socket events and shows toast notifications.

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toastService } from "@/services/toast.service";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getMyOrders } from "@/services/order.service";

const STATUS_TOASTS: Record<string, { msg: string; type: 'success' | 'error' | 'warning' }> = {
  AWAITING_PAYMENT:      { type: 'success', msg: "ร้านค้ายืนยันคำสั่งซื้อแล้ว กรุณาชำระเงิน (Order confirmed, please pay)" },
  AWAITING_CONFIRMATION: { type: 'success', msg: "ระบบได้รับหลักฐานการชำระเงินแล้ว กำลังตรวจสอบ (Payment slip received)" },
  COOKING:               { type: 'success', msg: "ร้านค้ากำลังปรุงอาหารของคุณ (Preparing your food)" },
  READY_FOR_PICKUP:      { type: 'success', msg: "อาหารของคุณเสร็จเรียบร้อยแล้ว กรุณามารับหน้าร้าน (Food is ready for pickup)" },
  COMPLETED:             { type: 'success', msg: "ออร์เดอร์ของคุณเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ (Order completed)" },
  REJECTED:              { type: 'error',   msg: "ขออภัย ออร์เดอร์ของคุณถูกปฏิเสธโดยร้านค้า (Order rejected)" },
  CANCELLED:             { type: 'error',   msg: "ออร์เดอร์ของคุณถูกยกเลิกแล้ว (Order cancelled)" },
};

export const useOrderNotifications = () => {
    const { user } = useAuthStore();
    const socketRef = useRef<ReturnType<typeof io> | null>(null);

    // Fetch buyer's active orders to listen for their status updates
    const { data: ordersData } = useQuery({
        queryKey: ['my-orders-active', user?.id],
        queryFn: () => getMyOrders({ page: 1, pageSize: 50 }),
        enabled: !!user && user.role === "BUYER",
        refetchInterval: 1000 * 30, // Refetch every 30 seconds to capture new orders
    });

    useEffect(() => {
        if (user?.role !== "BUYER") return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") || "http://localhost:5080";
        const token = localStorage.getItem("token") || "";

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            auth: { token: token.replace(/['"]+/g, "") },
        });

        const joinActiveOrderRooms = () => {
            const activeOrders = ordersData?.data?.filter(o =>
                ["PENDING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION", "COOKING", "READY_FOR_PICKUP"].includes(o.status)
            ) || [];
            activeOrders.forEach(o => {
                socketRef.current?.emit("join_order", o.id);
            });
        };

        socketRef.current.on("connect", () => {
            joinActiveOrderRooms();
        });

        socketRef.current.on("order:status_update", (data: { status: string }) => {
            const toast = STATUS_TOASTS[data.status];
            if (!toast) return;
            toastService[toast.type](toast.msg);
        });

        return () => { socketRef.current?.disconnect(); };
    }, [user?.role]);

    // Listen to changes in ordersData to join new order rooms without reconnecting socket
    useEffect(() => {
        if (!socketRef.current || !socketRef.current.connected) return;
        const activeOrders = ordersData?.data?.filter(o =>
            ["PENDING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION", "COOKING", "READY_FOR_PICKUP"].includes(o.status)
        ) || [];
        activeOrders.forEach(o => {
            socketRef.current?.emit("join_order", o.id);
        });
    }, [ordersData]);
};
