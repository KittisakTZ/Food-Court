// @/features/home/components/DraggableOrderCard.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FiCheck, FiX, FiDollarSign, FiPackage, FiUser, FiClock, FiShoppingBag } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";

// Component สำหรับปุ่ม Action
const OrderActions = ({ order }: { order: Order }) => {
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

    const handleUpdate = (action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP") => {
        const actionMessages: Record<typeof action, string> = {
            APPROVE: "อนุมัติออเดอร์นี้",
            REJECT: "ปฏิเสธออเดอร์นี้",
            CONFIRM_PAYMENT: "ยืนยันการชำระเงิน",
            PREPARE_COMPLETE: "อาหารพร้อมแล้ว",
            CUSTOMER_PICKED_UP: "ลูกค้ารับอาหารแล้ว"
        };

        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ '${actionMessages[action]}'?`)) {
            updateStatus({ orderId: order.id, action });
        }
    };

    switch (order.status) {
        case 'PENDING':
            return (
                <div className="flex flex-wrap justify-end gap-2">
                    <button
                        onClick={() => handleUpdate('APPROVE')}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold hover:scale-105 active:scale-95"
                    >
                        <FiCheck className="w-4 h-4" />
                        อนุมัติ
                    </button>
                    <button
                        onClick={() => handleUpdate('REJECT')}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold hover:scale-105 active:scale-95"
                    >
                        <FiX className="w-4 h-4" />
                        ปฏิเสธ
                    </button>
                </div>
            );
        case 'AWAITING_PAYMENT':
            return (
                <button
                    onClick={() => handleUpdate('CONFIRM_PAYMENT')}
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold hover:scale-105 active:scale-95"
                >
                    <FiDollarSign className="w-4 h-4" />
                    ยืนยันการชำระเงิน
                </button>
            );
        case 'COOKING':
            return (
                <button
                    onClick={() => handleUpdate('PREPARE_COMPLETE')}
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold hover:scale-105 active:scale-95"
                >
                    <MdRestaurant className="w-4 h-4" />
                    อาหารพร้อม
                </button>
            );
        case 'READY_FOR_PICKUP':
            return (
                <button
                    onClick={() => handleUpdate('CUSTOMER_PICKED_UP')}
                    disabled={isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold hover:scale-105 active:scale-95"
                >
                    <FiPackage className="w-4 h-4" />
                    ลูกค้ารับแล้ว
                </button>
            );
        default:
            return null;
    }
}

// Component หลัก
export const DraggableOrderCard = ({ order, queueDisplayNumber, isFirst, isLast }: { order: Order, queueDisplayNumber: number, isFirst: boolean, isLast: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
    const { mutate: moveOrder, isPending } = useMoveOrderPosition();
    const [jumpPosition, setJumpPosition] = useState<string>("");

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };

    const handleMove = (newPosition: number) => {
        if (newPosition === order.position) return;
        moveOrder({ orderId: order.id, newPosition });
    };

    const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const newPos = parseInt(jumpPosition);
            if (!isNaN(newPos) && newPos > 0) {
                handleMove(newPos);
                setJumpPosition("");
            }
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-4 sm:top-6 left-2 sm:left-4 text-gray-300 cursor-grab active:cursor-grabbing hover:text-orange-500 transition-colors p-2 hover:bg-orange-50 rounded-lg"
                >
                    <FaGripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Header Section */}
                <div className="pl-10 sm:pl-12 mb-4 sm:mb-5">
                    <div className="flex items-start justify-between flex-wrap gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 ...">
                                    {/* ✨ FIX: ใช้ prop ที่ส่งเข้ามา ✨ */}
                                    {queueDisplayNumber}
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <FiShoppingBag className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                {/* ✨ FIX: ใช้ prop ที่ส่งเข้ามา ✨ */}
                                <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1">คิว {queueDisplayNumber}</h3>
                                {/* (แนะนำ) อาจจะแสดง queueNumber จริงไว้ด้วยก็ได้ */}
                                <p className="text-[10px] sm:text-xs text-gray-500 ...">
                                    Order No: {order.queueNumber} ({order.id.substring(0, 4)}...)
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl ${getStatusColor(order.status)} shadow-md whitespace-nowrap`}>
                            {getStatusName(order.status)}
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-blue-600 mb-0.5 sm:mb-1">ลูกค้า</p>
                            <p className="text-sm sm:text-base font-bold text-gray-800 truncate">{order.buyer?.username ?? 'ไม่ระบุ'}</p>
                        </div>
                    </div>
                </div>

                {/* Scheduled Pickup - ถ้ามี */}
                {order.scheduledPickup && (
                    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-purple-100">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-xs font-semibold text-purple-600 mb-0.5 sm:mb-1">เวลานัดรับ</p>
                                <p className="text-sm sm:text-base font-bold text-gray-800">
                                    {new Date(order.scheduledPickup).toLocaleString('th-TH', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: 'short'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b-2 border-orange-100">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MdRestaurant className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-xs sm:text-sm">รายการอาหาร</h4>
                        <span className="ml-auto text-[10px] sm:text-xs font-semibold text-gray-500 bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                            {order.orderItems.length} รายการ
                        </span>
                    </div>
                    <div className="space-y-2">
                        {order.orderItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-orange-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-100 hover:border-orange-200 transition-all gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md flex-shrink-0">
                                        {item.quantity}
                                    </div>
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{item.menu.name}</span>
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-orange-600 bg-white px-2 sm:px-3 py-1 rounded-lg shadow-sm flex-shrink-0">
                                    ฿{(item.menu.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 border-2 border-green-200">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-700">ยอดรวม</span>
                        </div>
                        <span className="text-lg sm:text-2xl font-bold text-green-600 flex-shrink-0">
                            ฿{order.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-5 border-t-2 border-gray-100">
                    {/* Queue Controls - แสดงแบบ compact */}
                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2 sm:p-3 border border-gray-200">
                        <button
                            onClick={() => handleMove(order.position - 1)}
                            disabled={isFirst || isPending}
                            className="p-2 rounded-lg bg-white hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md border border-gray-200 hover:border-orange-300 flex-1 sm:flex-none"
                            title="เลื่อนขึ้น"
                        >
                            <FaArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mx-auto" />
                        </button>
                        <button
                            onClick={() => handleMove(order.position + 1)}
                            disabled={isLast || isPending}
                            className="p-2 rounded-lg bg-white hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md border border-gray-200 hover:border-orange-300 flex-1 sm:flex-none"
                            title="เลื่อนลง"
                        >
                            <FaArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mx-auto" />
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l-2 border-gray-300">
                            <label className="text-[10px] sm:text-xs font-bold text-gray-600 whitespace-nowrap">ไป:</label>
                            <input
                                type="number"
                                value={jumpPosition}
                                onChange={(e) => setJumpPosition(e.target.value)}
                                onKeyDown={handleJump}
                                onBlur={() => setJumpPosition("")}
                                disabled={isPending}
                                placeholder={`${order.position}`}
                                className="w-12 sm:w-16 text-center p-1.5 sm:p-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-bold text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 hover:border-orange-300 transition-all"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Action Buttons - Stack vertically on small screens */}
                    <div className="flex flex-col sm:flex-row justify-center gap-2 w-full">
                        <OrderActions order={order} />
                    </div>
                </div>
            </div>
        </div>
    );
};