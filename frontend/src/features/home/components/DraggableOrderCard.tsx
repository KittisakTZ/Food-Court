// @/features/home/components/DraggableOrderCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Order } from '@/types/response/order.response';
import { getStatusColor, getStatusName } from '@/utils/statusUtils';
import { useUpdateOrderStatus, useReportOrderIssue } from '@/hooks/useOrders';
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from '@/hooks/useOrders';
import { useState } from 'react';
import { FiCheck, FiX, FiPackage, FiClock, FiUser, FiAlertTriangle, FiEye } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { ConfirmationDialog } from '@/components/customs/ConfirmationDialog';
import { NO_FOOD_IMAGE, onImgError } from '@/utils/imageUtils';

// Modal สำหรับรายงานปัญหาออเดอร์
const IssueReportModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
    const { mutate: reportIssue, isPending } = useReportOrderIssue();
    const [selectedReason, setSelectedReason] = useState<string>(order.issueReason || '');
    const [customReason, setCustomReason] = useState('');

    const presetReasons = [
        'วัตถุดิบไม่พอ',
        'สินค้าหมด',
        'ร้านปิด',
        'เมนูหยุดให้บริการชั่วคราว',
        'ไม่สามารถรับออเดอร์ได้',
    ];

    const handleSubmit = () => {
        const reason = selectedReason === '__custom__' ? customReason.trim() : selectedReason;
        if (!reason) return;
        reportIssue({ orderId: order.id, action: 'REPORT_ISSUE', issueReason: reason }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-5 rounded-t-2xl text-white">
                    <div className="flex items-center gap-3">
                        <FiAlertTriangle className="w-7 h-7" />
                        <div>
                            <h3 className="text-lg font-bold">แจ้งปัญหาออเดอร์</h3>
                            <p className="text-red-100 text-sm">ลูกค้า: {order.buyer?.username} · คิว #{order.queueNumber}</p>
                        </div>
                        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600">เลือกเหตุผลที่ทำให้ออเดอร์นี้มีปัญหา:</p>

                    <div className="space-y-2">
                        {presetReasons.map((reason) => (
                            <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedReason === reason ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input
                                    type="radio"
                                    name="issueReason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={() => setSelectedReason(reason)}
                                    className="accent-red-500"
                                />
                                <span className="text-sm font-medium text-slate-800">{reason}</span>
                            </label>
                        ))}

                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedReason === '__custom__' ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input
                                type="radio"
                                name="issueReason"
                                value="__custom__"
                                checked={selectedReason === '__custom__'}
                                onChange={() => setSelectedReason('__custom__')}
                                className="accent-red-500"
                            />
                            <span className="text-sm font-medium text-slate-800">อื่นๆ (ระบุเอง)</span>
                        </label>

                        {selectedReason === '__custom__' && (
                            <input
                                type="text"
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="ระบุเหตุผล..."
                                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-xl text-sm focus:outline-none focus:border-red-400"
                                autoFocus
                            />
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isPending || !selectedReason || (selectedReason === '__custom__' && !customReason.trim())}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <FiAlertTriangle className="w-4 h-4" />}
                            แจ้งปัญหา
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal สำหรับดูรายละเอียดออเดอร์ (Seller)
const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-t-2xl text-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <FiEye className="w-6 h-6" />
                        <div>
                            <h3 className="text-lg font-bold">รายละเอียดออเดอร์</h3>
                            <p className="text-orange-100 text-sm">คิว #{order.queueNumber} · {order.buyer?.username}</p>
                        </div>
                        <button onClick={onClose} className="ml-auto text-white/80 hover:text-white">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-4">
                    {/* Issue Banner */}
                    {order.hasIssue && order.issueReason && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
                            <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-red-800 text-sm">ออเดอร์มีปัญหา</p>
                                <p className="text-red-700 text-sm mt-0.5">{order.issueReason}</p>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3 text-sm">รายการอาหาร ({order.orderItems.length} รายการ)</h4>
                        <div className="space-y-2">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <img src={item.menu.image || NO_FOOD_IMAGE} alt={item.menu.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={onImgError(NO_FOOD_IMAGE)} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{item.menu.name}</p>
                                        <p className="text-xs text-slate-500">฿{item.menu.price.toFixed(0)} × {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm">฿{item.subtotal.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    {order.description && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="font-semibold text-amber-800 text-sm mb-1">หมายเหตุจากลูกค้า</p>
                            <p className="text-sm text-slate-700 italic">"{order.description}"</p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="bg-orange-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">ยอดรวมทั้งหมด</p>
                            <p className="text-xs text-slate-500">{order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'เงินสด'}</p>
                        </div>
                        <p className="text-2xl font-black text-orange-600">฿{order.totalAmount.toFixed(0)}</p>
                    </div>

                    {/* Payment Slip */}
                    {order.paymentSlip && (
                        <div>
                            <p className="font-semibold text-slate-700 text-sm mb-2">สลิปการโอนเงิน</p>
                            <img src={order.paymentSlip} alt="Payment Slip" className="w-full rounded-xl border border-slate-200 cursor-pointer" onClick={() => window.open(order.paymentSlip!, '_blank')} />
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 flex-shrink-0">
                    <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component สำหรับปุ่ม Action (ปรับปรุง Icon)
const OrderActions = ({ order }: { order: Order }) => {
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
    const { mutate: reportIssue, isPending: isReportingIssue } = useReportOrderIssue();
    const [showIssueModal, setShowIssueModal] = useState(false);
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

    const handleClearIssue = () => {
        reportIssue({ orderId: order.id, action: 'CLEAR_ISSUE' });
    };

    const closeDialog = () => {
        setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    const commonButtonClass = "px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all font-bold shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed";

    // ปุ่มแจ้งปัญหา — แสดงเฉพาะ PENDING เท่านั้น (ก่อนกดอนุมัติ)
    const showIssueButton = order.status === 'PENDING';

    return (
        <>
            {showIssueModal && <IssueReportModal order={order} onClose={() => setShowIssueModal(false)} />}
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm!}
                title={dialogState.title}
                description={dialogState.description}
            />
            <div className="space-y-2">
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
                        case 'AWAITING_PAYMENT':
                            return (
                                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg border-2 border-blue-300 shadow-sm">
                                    <p className="font-bold">⏳ รอการชำระเงินจากลูกค้า</p>
                                </div>
                            );
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

                {/* ปุ่มแจ้งปัญหา / ล้างปัญหา */}
                {showIssueButton && (
                    order.hasIssue ? (
                        <button
                            onClick={handleClearIssue}
                            disabled={isReportingIssue}
                            className={`w-full ${commonButtonClass} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300`}
                        >
                            <FiCheck className="w-4 h-4" />
                            <span>ล้างปัญหาออเดอร์</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowIssueModal(true)}
                            disabled={isPending}
                            className={`w-full ${commonButtonClass} bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200`}
                        >
                            <FiAlertTriangle className="w-4 h-4" />
                            <span>แจ้งปัญหาออเดอร์</span>
                        </button>
                    )
                )}
            </div>
        </>
    );
}

// Component หลัก
export const DraggableOrderCard = ({ order, queueDisplayNumber, isFirst, isLast, highlightMenuId }: { order: Order, queueDisplayNumber: number, isFirst: boolean, isLast: boolean, highlightMenuId?: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: order.id });
    const { mutate: moveOrder, isPending } = useMoveOrderPosition();
    const [jumpPosition, setJumpPosition] = useState<string>("");
    const [showDetailModal, setShowDetailModal] = useState(false);

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
            {showDetailModal && <OrderDetailModal order={order} onClose={() => setShowDetailModal(false)} />}
            {/* ปรับเงา และขอบเล็กน้อย */}
            <div className={`bg-white rounded-xl shadow-md border-2 hover:shadow-lg transition-all overflow-hidden ${order.hasIssue ? 'border-red-400' : 'border-orange-200 hover:border-orange-400'}`}>

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

                {/* ✨ แบนเนอร์แจ้งปัญหาออเดอร์ */}
                {order.hasIssue && order.issueReason && (
                    <div className="px-4 py-3 bg-red-50 border-b-2 border-red-200 flex items-center gap-3">
                        <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-800 uppercase tracking-wide">มีปัญหาในออเดอร์</p>
                            <p className="text-sm text-red-700 font-medium">{order.issueReason}</p>
                        </div>
                    </div>
                )}

                {/* ✨ (เพิ่ม) ส่วนแสดงผลพิเศษสำหรับ Payment */}
                {(order.status === 'AWAITING_CONFIRMATION' && order.paymentSlip) && (() => {
                    // normalize URL — ตัด double slash ที่อาจเกิดจาก APP_URL มี trailing slash
                    const slipUrl = order.paymentSlip!.replace(/([^:])\/\/+/g, '$1/');
                    return (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-b-2 border-dashed border-yellow-300">
                        <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                            ตรวจสอบสลิปการโอนเงิน
                        </h4>

                        {/* Preview Image */}
                        <div className="relative group mb-3">
                            <img
                                src={slipUrl}
                                alt="Payment Slip"
                                className="w-full max-w-md mx-auto rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer hover:border-yellow-500 transition-all"
                                onClick={() => window.open(slipUrl, '_blank')}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallbackDiv) fallbackDiv.style.display = 'flex';
                                }}
                            />
                            {/* Fallback if image fails to load */}
                            <div className="hidden w-full max-w-md mx-auto p-8 bg-red-50 rounded-xl border-2 border-red-300 items-center justify-center">
                                <p className="text-red-600 font-semibold text-center">ไม่สามารถโหลดรูปสลิปได้</p>
                            </div>

                            {/* Hover Overlay */}
                            <div
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center cursor-pointer max-w-md mx-auto"
                                onClick={() => window.open(slipUrl, '_blank')}
                            >
                                <div className="text-white text-center">
                                    <p className="font-bold text-lg mb-1">🔍 คลิกเพื่อดูขนาดเต็ม</p>
                                    <p className="text-sm">เปิดในแท็บใหม่</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => window.open(slipUrl, '_blank')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold py-2.5 px-5 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                        >
                            🔍 ดูสลิปแบบขยาย
                        </button>
                    </div>
                    );
                })()}

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
                                            src={item.menu.image || NO_FOOD_IMAGE}
                                            alt={item.menu.name}
                                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 shadow-md ring-2 ring-orange-100"
                                            onError={onImgError(NO_FOOD_IMAGE)}
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
                <div className="p-3 sm:p-4 bg-white border-t border-gray-100 space-y-2">
                    <OrderActions order={order} />
                    <button
                        onClick={() => setShowDetailModal(true)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <FiEye className="w-4 h-4" />
                        ดูรายละเอียดออเดอร์
                    </button>
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