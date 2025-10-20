// @/features/home/components/SellerDashboard.tsx

import { useMyStoreOrders, useUpdateOrderStatus, useMoveOrderPosition } from "@/hooks/useOrders";
import { useMyStore } from "@/hooks/useStores";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DraggableOrderCard } from "./DraggableOrderCard";
import { Order } from "@/types/response/order.response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mainApi from "@/apis/main.api";

// ===== Mutation Hook สำหรับ Reorder (ย้ายมาไว้ในไฟล์เดียวกันเพื่อความสะดวก) =====
const useReorderQueue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderedIds: string[]) =>
            mainApi.patch('/v1/stores/my-store/orders/reorder', { orderedIds }),
        onSuccess: () => {
            // เมื่อสำเร็จ, invalidate query เพื่อดึงลำดับที่ถูกต้องจาก server มาแสดง
            queryClient.invalidateQueries({ queryKey: ['store-orders'] });
        },
        onError: (error: any) => {
            alert(`Failed to reorder queue: ${error.response?.data?.message || error.message}`);
            // ถ้า reorder ล้มเหลว, ควรจะ invalidate เพื่อให้ UI กลับไปเป็นลำดับเดิมที่ถูกต้องจาก server
            queryClient.invalidateQueries({ queryKey: ['store-orders'] });
        }
    });
};


// ===== Component หลัก =====
export const SellerDashboard = () => {
    // ใช้ useMyStore เพื่อตรวจสอบว่า Seller มีร้านค้าแล้วหรือยัง
    const { data: myStore, isLoading: isLoadingStore, isError } = useMyStore();

    // ---- ส่วนแสดงผลสำหรับ Seller ที่ยังไม่มีร้านค้า ----
    if (isLoadingStore) {
        return <div className="text-center p-10">Loading your dashboard...</div>;
    }

    if (isError || !myStore) {
        return (
            <div className="container mx-auto text-center p-10">
                <h1 className="text-3xl font-bold">Welcome, Seller!</h1>
                <p className="mt-4 text-lg text-gray-600">You haven't created a store yet. Create one to start selling!</p>
                <Link to="/my-store/create" className="mt-6 inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
                    Create Your Store
                </Link>
            </div>
        );
    }

    // ---- ถ้ามีร้านค้าแล้ว, ให้แสดงหน้าจัดการคิว ----
    return <StoreOrderQueue storeName={myStore.name} />;
};


// ===== Component สำหรับแสดงคิวออเดอร์ (ส่วนที่ทำงานหลัก) =====
const StoreOrderQueue = ({ storeName }: { storeName: string }) => {
    const [page, setPage] = useState(1); // เพิ่ม State สำหรับ Pagination
    const { data: ordersData, isLoading, isError } = useMyStoreOrders({
        page,
        pageSize: 10, // กำหนด pageSize
        status: ['PENDING', 'AWAITING_PAYMENT', 'COOKING', 'READY_FOR_PICKUP']
    });
    const { mutate: moveOrder } = useMoveOrderPosition(); // Hook สำหรับย้ายตำแหน่ง

    // เราไม่ต้องการ UI State 'orders' อีกต่อไป เพราะจะใช้ข้อมูลจาก React Query โดยตรง
    // const [orders, setOrders] = useState<Order[]>([]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const orders = ordersData?.data ?? [];

        if (over && active.id !== over.id) {
            const oldItem = orders.find(item => item.id === active.id);
            const newItem = orders.find(item => item.id === over.id);

            if (oldItem && newItem) {
                // เมื่อลากเสร็จ, เราจะย้าย 'active' item ไปยังตำแหน่งของ 'over' item
                moveOrder({ orderId: oldItem.id, newPosition: newItem.position });
            }
        }
    };

    if (isLoading) return <div className="text-center p-10">Loading active orders...</div>;
    if (isError) return <div className="text-center p-10 text-red-500">Failed to load orders.</div>;

    const orders = ordersData?.data ?? [];
    const orderIds = orders.map(order => order.id);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Order Queue for <span className="text-blue-600">{storeName}</span></h1>

            {orders.length === 0 ? (
                <div className="text-center p-10 ...">...</div>
            ) : (
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                            {orders.map((order, index) => (
                                <DraggableOrderCard
                                    key={order.id}
                                    order={order}
                                    // ส่ง Props เพื่อบอกว่าเป็นรายการแรก/สุดท้ายของ "หน้าปัจจุบัน" หรือไม่
                                    isFirst={index === 0 && page === 1}
                                    isLast={index === orders.length - 1 && page === (ordersData?.totalPages ?? 1)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* ส่วนของ Pagination */}
            <div className="flex justify-center mt-8 space-x-4">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="...">Previous</button>
                <span>Page {ordersData?.currentPage} of {ordersData?.totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === ordersData?.totalPages} className="...">Next</button>
            </div>
        </div>
    );
};