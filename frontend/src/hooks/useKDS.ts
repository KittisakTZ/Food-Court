// @/hooks/useKDS.ts

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useMyStoreOrders } from "./useOrders";
import { toastService } from "@/services/toast.service";

export interface KdsOrderItem {
    menuId: string;
    quantity: number;
    menu: { name: string; image?: string | null };
}

export interface KdsOrder {
    id: string;
    queueNumber: number;
    status: string;
    totalAmount: number;
    paymentMethod: string | null;
    paidAt: string | null;
    createdAt: string;
    startCookingAt: string | null;
    estimatedReadyAt: string | null;
    orderItems: KdsOrderItem[];
}

export const useKDS = (storeId: string | undefined) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [orders, setOrders] = useState<KdsOrder[]>([]);

    // โหลด active orders ครั้งแรก
    const { data: initialData } = useMyStoreOrders({
        page: 1,
        pageSize: 100,
        status: ["PENDING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION", "COOKING", "READY_FOR_PICKUP"] as any,
    });

    // sync initial data เข้า state
    useEffect(() => {
        if (initialData?.data) {
            setOrders(
                initialData.data.map((o) => ({
                    id: o.id,
                    queueNumber: o.queueNumber,
                    status: o.status,
                    totalAmount: o.totalAmount,
                    paymentMethod: (o as any).paymentMethod ?? null,
                    paidAt: (o as any).paidAt ?? null,
                    createdAt: o.createdAt,
                    startCookingAt: (o as any).startCookingAt ?? null,
                    estimatedReadyAt: (o as any).estimatedReadyAt ?? null,
                    orderItems: o.orderItems.map((item) => ({
                        menuId: item.menuId,
                        quantity: item.quantity,
                        menu: { name: item.menu.name, image: item.menu.image },
                    })),
                }))
            );
        }
    }, [initialData]);

    // WebSocket connection
    useEffect(() => {
        if (!storeId) return;

        const baseUrl =
            import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") ||
            "http://localhost:5080";
        const token = localStorage.getItem("token") || "";

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            auth: {
                token: token.replace(/['"]+/g, "")
            }
        });

        socketRef.current.on("connect", () => {
            setIsConnected(true);
            socketRef.current?.emit("join_kds", storeId);
        });

        socketRef.current.on("disconnect", () => setIsConnected(false));

        // new order in queue
        socketRef.current.on("kds:new_order", (order: KdsOrder) => {
            setOrders((prev) => {
                const exists = prev.find((o) => o.id === order.id);
                if (exists) return prev;
                return [...prev, order];
            });
            toastService.success(`New order #${order.queueNumber} received!`);
        });

        // order status changed
        socketRef.current.on(
            "kds:order_update",
            (update: { id: string; status?: string; startCookingAt?: string; estimatedReadyAt?: string; paidAt?: string }) => {
                setOrders((prev) => {
                    if (update.status && ["COMPLETED", "REJECTED", "CANCELLED"].includes(update.status)) {
                        return prev.filter((o) => o.id !== update.id);
                    }
                    return prev.map((o) =>
                        o.id === update.id
                            ? {
                                  ...o,
                                  ...(update.status && { status: update.status }),
                                  ...(update.startCookingAt && { startCookingAt: update.startCookingAt }),
                                  ...(update.estimatedReadyAt !== undefined && { estimatedReadyAt: update.estimatedReadyAt }),
                                  ...(update.paidAt !== undefined && { paidAt: update.paidAt }),
                              }
                            : o
                    );
                });

                if (update.status === "AWAITING_CONFIRMATION") {
                    toastService.warning("A customer has uploaded a payment slip. Please verify.");
                } else if (update.status === "CANCELLED") {
                    toastService.error("An order was automatically cancelled due to payment timeout.");
                } else if (update.status === "COMPLETED") {
                    toastService.success("Order marked as completed.");
                }
            }
        );

        return () => {
            socketRef.current?.disconnect();
        };
    }, [storeId]);

    // แยก orders ตาม status
    const pendingOrders = orders.filter((o) =>
        ["PENDING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION"].includes(o.status)
    );
    const cookingOrders = orders.filter((o) => o.status === "COOKING");
    const readyOrders = orders.filter((o) => o.status === "READY_FOR_PICKUP");

    return {
        isConnected,
        pendingOrders,
        cookingOrders,
        readyOrders,
        allOrders: orders,
    };
};
