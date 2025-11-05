// @/features/home/components/DraggableOrderCard.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FiCheck, FiX, FiDollarSign, FiPackage, FiClock, FiUser } from "react-icons/fi";
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
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleUpdate('APPROVE')}
                        disabled={isPending}
                        className="px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 transition-all font-bold shadow-sm"
                    >
                        ✓ อนุมัติ
                    </button>
                    <button
                        onClick={() => handleUpdate('REJECT')}
                        disabled={isPending}
                        className="px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 transition-all font-bold shadow-sm"
                    >
                        ✕ ปฏิเสธ
                    </button>
                </div>
            );
        case 'AWAITING_PAYMENT':
            return (
                <button
                    onClick={() => handleUpdate('CONFIRM_PAYMENT')}
                    disabled={isPending}
                    className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 transition-all font-bold shadow-sm"
                >
                    💳 ยืนยันชำระเงิน
                </button>
            );
        case 'COOKING':
            return (
                <button
                    onClick={() => handleUpdate('PREPARE_COMPLETE')}
                    disabled={isPending}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition-all font-bold shadow-sm"
                >
                    ✓ อาหารพร้อม
                </button>
            );
        case 'READY_FOR_PICKUP':
            return (
                <button
                    onClick={() => handleUpdate('CUSTOMER_PICKED_UP')}
                    disabled={isPending}
                    className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:bg-gray-300 transition-all font-bold shadow-sm"
                >
                    ✓ ลูกค้ารับแล้ว
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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
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

    // คำนวณจำนวนชิ้นทั้งหมด
    const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div ref={setNodeRef} style={style}>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all overflow-hidden">

                {/* HEADER - Queue Number & Customer */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4">
                    <div className="flex items-start justify-between gap-3">
                        {/* Left Side - Drag + Queue */}
                        <div className="flex items-center gap-3">
                            <div
                                {...attributes}
                                {...listeners}
                                className="text-orange-200 cursor-grab active:cursor-grabbing hover:text-white transition-colors"
                            >
                                <FaGripVertical className="w-6 h-6" />
                            </div>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-orange-300">
                                <span className="text-orange-600 font-black text-4xl">{queueDisplayNumber}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-white mb-1">
                                    <FiUser className="w-5 h-5" />
                                    <span className="font-bold text-lg">{order.buyer?.username ?? 'ลูกค้า'}</span>
                                </div>
                                {order.scheduledPickup && (
                                    <div className="flex items-center gap-2 text-orange-100">
                                        <FiClock className="w-4 h-4" />
                                        <span className="font-bold text-sm">
                                            {new Date(order.scheduledPickup).toLocaleString('th-TH', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Status & Time */}
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-2 ${getStatusColor(order.status)} shadow-sm`}>
                                {getStatusName(order.status)}
                            </div>
                            {order.scheduledPickup && (
                                <div className="flex items-center justify-end gap-1.5 text-white">
                                    <FiClock className="w-4 h-4" />
                                    <span className="font-bold text-sm">
                                        {new Date(order.scheduledPickup).toLocaleString('th-TH', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="p-4 bg-orange-50">
                    <div className="space-y-3"> {/* เพิ่ม space-y เล็กน้อย */}
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* รูปภาพอาหาร */}
                                    <img
                                        // สมมติว่า URL รูปภาพอยู่ที่ item.menu.image
                                        src={item.menu.image || 'https://via.placeholder.com/150'}
                                        alt={item.menu.name}
                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border-2 border-gray-100"
                                        onError={(e) => {
                                            // Fallback image หากรูปภาพหลักโหลดไม่สำเร็จ
                                            e.currentTarget.src = 'https://via.placeholder.com/150';
                                        }}
                                    />

                                    {/* ชื่อเมนู + ราคา */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate mb-1">{item.menu.name}</p>
                                        <p className="text-sm text-gray-500 font-medium">
                                            ราคา: <span className="text-teal-600 font-bold">฿{item.menu.price.toFixed(0)}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* จำนวน */}
                                <div className="text-right flex-shrink-0">
                                    <span className="text-gray-500 text-sm">จำนวน:</span>
                                    <p className="text-gray-800 font-bold text-lg">{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <div className="text-sm font-semibold opacity-90">รวมทั้งหมด {totalItems} ชิ้น</div>
                            <div className="text-xs opacity-75">ยอดชำระ</div>
                        </div>
                        <div className="text-white font-black text-3xl">
                            ฿{order.totalAmount.toFixed(0)}
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="p-4 bg-white border-t-2 border-orange-100">
                    <OrderActions order={order} />
                </div>

                {/* QUEUE MANAGEMENT */}
                <div className="bg-orange-50 px-4 py-3 border-t-2 border-orange-100">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleMove(order.position - 1)}
                            disabled={isFirst || isPending}
                            className="w-10 h-10 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
                            title="เลื่อนขึ้น"
                        >
                            <FaArrowUp className="w-4 h-4 text-orange-600" />
                        </button>

                        <div className="text-orange-400 font-bold">|</div>

                        <button
                            onClick={() => handleMove(order.position + 1)}
                            disabled={isLast || isPending}
                            className="w-10 h-10 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
                            title="เลื่อนลง"
                        >
                            <FaArrowDown className="w-4 h-4 text-orange-600" />
                        </button>

                        <div className="text-orange-400 font-bold">|</div>

                        <div className="flex items-center gap-2">
                            <span className="text-orange-700 text-sm font-bold">ไปคิว:</span>
                            <input
                                type="number"
                                value={jumpPosition}
                                onChange={(e) => setJumpPosition(e.target.value)}
                                onKeyDown={handleJump}
                                onBlur={() => setJumpPosition("")}
                                disabled={isPending}
                                placeholder={`${order.position}`}
                                className="w-16 text-center px-2 py-2 bg-white border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-bold text-sm shadow-sm"
                                min="1"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};