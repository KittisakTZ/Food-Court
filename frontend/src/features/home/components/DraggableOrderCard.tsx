// @/features/home/components/DraggableOrderCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FiCheck, FiX, FiPackage, FiClock, FiUser } from "react-icons/fi";
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

    const commonButtonClass = "px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all font-bold shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed";

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
export const DraggableOrderCard = ({ order, queueDisplayNumber, isFirst, isLast, highlightMenuId }: { order: Order, queueDisplayNumber: number, isFirst: boolean, isLast: boolean, highlightMenuId?: string }) => {
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

                {/* HEADER - Queue Number & Customer (Responsive) */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                        {/* Left Side - Drag + Queue */}
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div
                                {...attributes}
                                {...listeners}
                                className="text-orange-200 cursor-grab active:cursor-grabbing hover:text-white transition-colors hidden sm:block"
                            >
                                <FaGripVertical className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            {/* [คิว] */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center shadow-lg border-3 sm:border-4 border-orange-300 flex-shrink-0">
                                <span className="text-orange-600 font-black text-3xl sm:text-4xl">{queueDisplayNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-white mb-1">
                                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                    <span className="font-semibold text-sm sm:text-base truncate">{order.buyer?.username ?? 'ลูกค้า'}</span>
                                </div>
                                {order.scheduledPickup && (
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-orange-100">
                                        <FiClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="font-bold text-xs sm:text-sm">
                                            {new Date(order.scheduledPickup).toLocaleString('th-TH', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Status (Responsive) */}
                        <div className="w-full sm:w-auto">
                            <div className={`inline-block px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold ${getStatusColor(order.status)} shadow-sm`}>
                                {getStatusName(order.status)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✨ (เพิ่ม) ส่วนแสดงผลพิเศษสำหรับ Payment */}
                {(order.status === 'AWAITING_CONFIRMATION' && order.paymentSlip) && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-dashed border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                            ตรวจสอบสลิปการโอนเงิน
                        </h4>

                        {/* Preview Image */}
                        <div className="relative group mb-3">
                            <img
                                src={order.paymentSlip}
                                alt="Payment Slip"
                                className="w-full max-w-md mx-auto rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer hover:border-yellow-500 transition-all"
                                onClick={() => window.open(order.paymentSlip, '_blank')}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                }}
                            />
                            {/* Fallback if image fails to load */}
                            <div className="hidden w-full max-w-md mx-auto p-8 bg-red-50 rounded-xl border-2 border-red-300 items-center justify-center">
                                <p className="text-red-600 font-semibold text-center">ไม่สามารถโหลดรูปสลีปได้</p>
                            </div>

                            {/* Hover Overlay */}
                            <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer max-w-md mx-auto"
                                onClick={() => window.open(order.paymentSlip, '_blank')}
                            >
                                <div className="text-white text-center">
                                    <p className="font-bold text-lg mb-1">🔍 คลิกเพื่อดูขนาดเต็ม</p>
                                    <p className="text-sm">เปิดในแท็บใหม่</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.open(order.paymentSlip, '_blank')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold py-2.5 px-5 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                        >
                            🔍 ดูสลิปแบบขยาย
                        </button>
                    </div>
                )}

                {/* ORDER ITEMS - Responsive */}
                <div className="p-3 sm:p-4 bg-neutral-50">
                    <div className="space-y-2 sm:space-y-3">
                        {order.orderItems.map((item) => {
                            const isHighlighted = highlightMenuId === item.menuId;
                            return (
                                <div
                                    key={item.id}
                                    className={`rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-4 shadow-sm border transition-all ${isHighlighted
                                        ? "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-200 shadow-md"
                                        : "bg-white border-orange-100 hover:shadow-lg hover:border-orange-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                        {/* [รูปอาหาร] - Responsive */}
                                        <img
                                            src={item.menu.image || ''}
                                            alt={item.menu.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 shadow-md ring-2 ring-orange-100"
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                            }}
                                        />

                                        {/* [ชื่อเมนู + ราคา] */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate mb-0.5 text-base sm:text-lg ${isHighlighted ? "text-yellow-800" : "text-gray-800"}`}>{item.menu.name}</p>
                                            <p className="text-sm sm:text-base text-gray-600 font-medium">
                                                ราคา: <span className="text-teal-600 font-bold">฿{item.menu.price.toFixed(0)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* [จำนวน] - Responsive */}
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-gray-500 text-xs sm:text-sm block">จำนวน:</span>
                                        <p className={`font-black text-xl sm:text-2xl ${isHighlighted ? "text-yellow-600" : "text-gray-900"}`}>{item.quantity}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {order.description && (
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t-2 border-dashed border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            💬 หมายเหตุจากลูกค้า:
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 italic bg-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-l-4 border-amber-400 shadow-sm">
                            "{order.description}"
                        </p>
                    </div>
                )}

                {/* [TOTAL] - ยอดรวมเป็นบาท (Responsive) */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-3 sm:px-4 py-3 border-t-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-gray-700">
                            <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
                                <MdRestaurant className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                                <span>รวมทั้งหมด {totalItems} ชิ้น</span>
                            </div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">ยอดชำระทั้งสิ้น</div>
                        </div>
                        <div className="text-orange-600 font-black text-xl sm:text-2xl flex items-center gap-1">
                            <span className="text-lg sm:text-xl">฿</span>
                            <span>{order.totalAmount.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                    <OrderActions order={order} />
                </div>

                {/* QUEUE MANAGEMENT - Responsive */}
                <div className="bg-neutral-50 px-3 sm:px-4 py-2.5 sm:py-3 border-t-2 border-orange-100">
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                        <button
                            onClick={() => handleMove(order.position - 1)}
                            disabled={isFirst || isPending}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm active:scale-95"
                            title="เลื่อนขึ้น"
                        >
                            <FaArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                        </button>

                        <div className="text-orange-400 font-bold text-sm sm:text-base">|</div>

                        <button
                            onClick={() => handleMove(order.position + 1)}
                            disabled={isLast || isPending}
                            className="w-9 h-9 sm:w-10 sm:h-10 bg-white border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm active:scale-95"
                            title="เลื่อนลง"
                        >
                            <FaArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                        </button>

                        <div className="text-orange-400 font-bold text-sm sm:text-base">|</div>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-orange-700 text-xs sm:text-sm font-bold">ไปคิว:</span>
                            <input
                                type="number"
                                value={jumpPosition}
                                onChange={(e) => setJumpPosition(e.target.value)}
                                onKeyDown={handleJump}
                                onBlur={() => setJumpPosition("")}
                                disabled={isPending}
                                placeholder={`${order.position}`}
                                className="w-14 sm:w-16 text-center px-1.5 sm:px-2 py-1.5 sm:py-2 bg-white border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-bold text-xs sm:text-sm shadow-sm"
                                min="1"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};