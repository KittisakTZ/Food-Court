// @/features/home/components/DraggableOrderCard.tsx

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { FaGripVertical } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

// Component ย่อยสำหรับปุ่ม Action
const OrderActions = ({ order }: { order: Order }) => {
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

    const handleUpdate = (action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP") => {
        if (window.confirm(`Are you sure you want to perform the action: '${action.replace('_', ' ')}'?`)) {
            updateStatus({ orderId: order.id, action });
        }
    };

    switch (order.status) {
        case 'PENDING':
            return (
                <div className="flex space-x-2">
                    <button onClick={() => handleUpdate('APPROVE')} disabled={isPending} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                    <button onClick={() => handleUpdate('REJECT')} disabled={isPending} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                </div>
            );
        case 'AWAITING_PAYMENT':
            return <button onClick={() => handleUpdate('CONFIRM_PAYMENT')} disabled={isPending} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Confirm Payment</button>;
        case 'COOKING':
            return <button onClick={() => handleUpdate('PREPARE_COMPLETE')} disabled={isPending} className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600">Food Ready</button>;
        case 'READY_FOR_PICKUP':
            return <button onClick={() => handleUpdate('CUSTOMER_PICKED_UP')} disabled={isPending} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Customer Picked Up</button>;
        default:
            return null;
    }
}

// Component หลักที่ทำให้ลากได้
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
        <div ref={setNodeRef} style={style} className="relative">
            <div className="bg-white p-4 rounded-lg shadow-md border flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="absolute top-1/2 -translate-y-1/2 left-2 text-gray-400 cursor-grab active:cursor-grabbing">
                    <FaGripVertical />
                </div>

                <div className="flex-grow pl-6"> {/* เพิ่ม Padding ด้านซ้ายสำหรับ Handle */}
                    <div className="flex items-center justify-between sm:justify-start mb-2 sm:mb-0">
                        <span className="font-bold text-lg mr-4">Queue #{order.position}</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusName(order.status)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">From: {order.buyer?.username ?? 'N/A'}</p>
                    <div className="mt-2 pl-4 border-l-2">
                        {order.orderItems.map(item => (
                            <p key={item.id} className="text-sm text-gray-700">- {item.menu.name} x {item.quantity}</p>
                        ))}
                    </div>
                    {order.scheduledPickup && (
                        <p className="text-sm text-blue-600 font-semibold mt-2">
                            Scheduled for: {new Date(order.scheduledPickup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
                {/* ส่วนจัดการคิว และปุ่ม Actions */}
                <div className="flex-shrink-0 ml-0 sm:ml-4 mt-4 sm:mt-0 flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                        {/* ปุ่มเลื่อนขึ้น/ลง */}
                        <button onClick={() => handleMove(order.position - 1)} disabled={isFirst || isPending} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"><FaArrowUp /></button>
                        <button onClick={() => handleMove(order.position + 1)} disabled={isLast || isPending} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"><FaArrowDown /></button>
                        {/* ช่อง Input สำหรับ Jump */}
                        <input
                            type="number"
                            value={jumpPosition}
                            onChange={(e) => setJumpPosition(e.target.value)}
                            onKeyDown={handleJump}
                            disabled={isPending}
                            className="w-16 text-center p-1 border rounded-md"
                        />
                    </div>
                    <div className="pt-2">
                        <OrderActions order={order} />
                    </div>
                </div>
            </div>
        </div>
    );
};