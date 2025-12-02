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
import { ConfirmationDialog } from '@/components/customs/ConfirmationDialog';

// Component สำหรับปุ่ม Action (ปรับปรุง Icon)
const OrderActions = ({ order }: { order: Order }) => {
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: (() => void) | null;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
    });

    const handleUpdate = (action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP") => {
        const actionMessages: Record<typeof action, string> = {
            APPROVE: "อนุมัติออเดอร์นี้",
            REJECT: "ปฏิเสธออเดอร์นี้",
            CONFIRM_PAYMENT: "ยืนยันการชำระเงิน",
            PREPARE_COMPLETE: "อาหารพร้อมแล้ว",
            CUSTOMER_PICKED_UP: "ลูกค้ารับอาหารแล้ว"
        };

        setDialogState({
            isOpen: true,
            title: "ยืนยันการดำเนินการ",
            description: `คุณแน่ใจหรือไม่ว่าต้องการ '${actionMessages[action]}'?`,
            onConfirm: () => updateStatus({ orderId: order.id, action }),
        });
    };

    const closeDialog = () => {
        setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    const commonButtonClass = "px-4 py-3 rounded-lg transition-all font-bold shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-300";

    return (
        <>
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm!}
                title={dialogState.title}
                description={dialogState.description}
            />
            {(() => {
                switch (order.status) {
                    case 'PENDING':
                        return (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleUpdate('APPROVE')}
                                    disabled={isPending}
                                    className={`${commonButtonClass} bg-teal-500 text-white hover:bg-teal-600`}
                                >
                                    <FiCheck className="w-5 h-5" />
                                    <span>อนุมัติ</span>
                                </button>
                                <button
                                    onClick={() => handleUpdate('REJECT')}
                                    disabled={isPending}
                                    className={`${commonButtonClass} bg-gray-400 text-white hover:bg-gray-500`}
                                >
                                    <FiX className="w-5 h-5" />
                                    <span>ปฏิเสธ</span>
                                </button>
                            </div>
                        );
                    // ✨ (ปรับปรุง) สถานะนี้ ร้านค้าไม่ต้องทำอะไร รอให้ลูกค้าจ่ายเงิน
                    case 'AWAITING_PAYMENT':
                        return (
                            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg border-2 border-blue-300 shadow-sm">
                                <p className="font-bold">⏳ รอการชำระเงินจากลูกค้า</p>
                            </div>
                        );

                    // ✨ (เพิ่ม) สถานะใหม่สำหรับตรวจสอบสลิป
                    case 'AWAITING_CONFIRMATION':
                        return (
                            <button
                                onClick={() => handleUpdate('CONFIRM_PAYMENT')}
                                disabled={isPending}
                                className={`w-full ${commonButtonClass} bg-teal-500 text-white hover:bg-teal-600`}
                            >
                                <FiCheck className="w-5 h-5" />
                                <span>ยืนยันการชำระเงิน</span>
                            </button>
                        );
                    case 'COOKING':
                        return (
                            <button
                                onClick={() => handleUpdate('PREPARE_COMPLETE')}
                                disabled={isPending}
                                className={`w-full ${commonButtonClass} bg-orange-500 text-white hover:bg-orange-600`}
                            >
                                <FiPackage className="w-5 h-5" />
                                <span>อาหารพร้อม</span>
                            </button>
                        );
                    case 'READY_FOR_PICKUP':
                        return (
                            <button
                                onClick={() => handleUpdate('CUSTOMER_PICKED_UP')}
                                disabled={isPending}
                                className={`w-full ${commonButtonClass} bg-teal-500 text-white hover:bg-teal-600`}
                            >
                                <FiCheck className="w-5 h-5" />
                                <span>ลูกค้ารับแล้ว</span>
                            </button>
                        );
                    default:
                        return null;
                }
            })()}
        </>
    );
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
            {/* ปรับเงา และขอบเล็กน้อย */}
            <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all overflow-hidden">

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
                            {/* [คิว] */}
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border-4 border-orange-300">
                                <span className="text-orange-600 font-black text-4xl">{queueDisplayNumber}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-white mb-1">
                                    <FiUser className="w-5 h-5" />
                                    <span className="font-semibold text-base">{order.buyer?.username ?? 'ลูกค้า'}</span>
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
                            {/* [สถานะ] */}
                            <div className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold mb-2 ${getStatusColor(order.status)} shadow-sm`}>
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

                {/* ✨ (เพิ่ม) ส่วนแสดงผลพิเศษสำหรับ Payment */}
                {(order.status === 'AWAITING_CONFIRMATION' && order.paymentSlip) && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-dashed border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                            <FiDollarSign className="w-5 h-5" />
                            ตรวจสอบสลิปการโอนเงิน
                        </h4>
                        <a
                            href={order.paymentSlip}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold py-2.5 px-5 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                        >
                            📄 ดูสลิปที่แนบมา
                        </a>
                    </div>
                )}

                {/* ORDER ITEMS - ใช้ bg-neutral-50 ให้ดูเหมือนกระดาษ */}
                <div className="p-4 bg-neutral-50">
                    <div className="space-y-3">
                        {order.orderItems.map((item) => (
                            <div
                                key={item.id}
                                // เพิ่ม hover effect ให้รายการอาหารย่อย
                                className="bg-white rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm border border-orange-100 hover:shadow-lg hover:border-orange-200 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* --- [รูปอาหาร] เพิ่มเงาและวงแหวน --- */}
                                    <img
                                        src={item.menu.image || ''}
                                        alt={item.menu.name}
                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0 shadow-md ring-2 ring-orange-100"
                                        onError={(e) => {
                                            e.currentTarget.src = '';
                                        }}
                                    />

                                    {/* [ชื่อเมนู + ราคา] */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate mb-0.5 text-lg">{item.menu.name}</p>
                                        <p className="text-base text-gray-600 font-medium">
                                            ราคา: <span className="text-teal-600 font-bold">฿{item.menu.price.toFixed(0)}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* --- [จำนวน] ปรับขนาด label --- */}
                                <div className="text-right flex-shrink-0 pl-2">
                                    <span className="text-gray-500 text-sm">จำนวน:</span>
                                    <p className="text-gray-900 font-black text-2xl">{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {order.description && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t-2 border-dashed border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                            💬 หมายเหตุจากลูกค้า:
                        </h4>
                        <p className="text-sm text-gray-700 italic bg-white px-4 py-3 rounded-lg border-l-4 border-amber-400 shadow-sm">
                            "{order.description}"
                        </p>
                    </div>
                )}

                {/* --- [TOTAL] - เปลี่ยนเป็นขอบประ (เหมือนใบเสร็จ) --- */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-t-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-700">
                            <div className="text-sm font-bold flex items-center gap-2">
                                <MdRestaurant className="w-4 h-4 text-orange-600" />
                                รวมทั้งหมด {totalItems} ชิ้น
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">ยอดชำระทั้งสิ้น</div>
                        </div>
                        <div className="text-orange-600 font-black text-2xl flex items-center gap-1">
                            <FiDollarSign className="w-6 h-6" />
                            {order.totalAmount.toFixed(0)}
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <OrderActions order={order} />
                </div>

                {/* QUEUE MANAGEMENT */}
                <div className="bg-neutral-50 px-4 py-3 border-t-2 border-orange-100">
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