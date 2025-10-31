// @/features/home/components/DraggableOrderCard.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FiCheck, FiX, FiDollarSign, FiPackage, FiUser } from "react-icons/fi";
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
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
                    >
                        <FiCheck className="w-4 h-4" />
                        อนุมัติ
                    </button>
                    <button 
                        onClick={() => handleUpdate('REJECT')} 
                        disabled={isPending} 
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
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
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 transition-all shadow-md hover:shadow-lg font-semibold"
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
export const DraggableOrderCard = ({ order, isFirst, isLast }: { order: Order, isFirst: boolean, isLast: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
    const { mutate: moveOrder, isPending } = useMoveOrderPosition();
    const [jumpPosition, setJumpPosition] = useState<string>(String(order.position));

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
            }
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-orange-300 hover:shadow-2xl transition-all duration-300">
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners} 
                    className="absolute top-4 left-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-orange-500 transition-colors"
                >
                    <FaGripVertical className="w-5 h-5" />
                </div>

                {/* Header Section */}
                <div className="pl-10 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                #{order.position}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">คิวที่ {order.position}</h3>
                                <p className="text-sm text-gray-500">รหัส: {order.id.substring(0, 8)}</p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 text-sm font-bold rounded-full ${getStatusColor(order.status)} shadow-md`}>
                            {getStatusName(order.status)}
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FiUser className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-700">ลูกค้า</p>
                    </div>
                    <p className="text-base font-bold text-gray-800">{order.buyer?.username ?? 'ไม่ระบุ'}</p>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MdRestaurant className="w-5 h-5 text-orange-600" />
                        <h4 className="font-bold text-gray-800">รายการอาหาร</h4>
                    </div>
                    <div className="space-y-2 pl-7 border-l-4 border-orange-200">
                        {order.orderItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {item.quantity}×
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{item.menu.name}</span>
                                </div>
                                <span className="text-sm font-bold text-orange-600">
                                    ฿{(item.menu.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scheduled Pickup */}
                {order.scheduledPickup && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-xs text-gray-600">เวลานัดรับ</p>
                                <p className="text-sm font-bold text-purple-600">
                                    {new Date(order.scheduledPickup).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">ยอดรวม</span>
                        <span className="text-2xl font-bold text-green-600">
                            ฿{order.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4 border-t-2 border-gray-100">
                    {/* Queue Controls */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                        <button 
                            onClick={() => handleMove(order.position - 1)} 
                            disabled={isFirst || isPending} 
                            className="p-2 rounded-lg bg-white hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                            title="เลื่อนขึ้น"
                        >
                            <FaArrowUp className="w-4 h-4 text-orange-600" />
                        </button>
                        <button 
                            onClick={() => handleMove(order.position + 1)} 
                            disabled={isLast || isPending} 
                            className="p-2 rounded-lg bg-white hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                            title="เลื่อนลง"
                        >
                            <FaArrowDown className="w-4 h-4 text-orange-600" />
                        </button>
                        <div className="flex items-center gap-2 ml-2">
                            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">ไปที่:</label>
                            <input
                                type="number"
                                value={jumpPosition}
                                onChange={(e) => setJumpPosition(e.target.value)}
                                onKeyDown={handleJump}
                                disabled={isPending}
                                className="w-16 text-center p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-semibold"
                                placeholder="#"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-1 flex justify-end">
                        <OrderActions order={order} />
                    </div>
                </div>
            </div>
        </div>
    );
};