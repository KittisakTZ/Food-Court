import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Clock, Package, ShoppingBag,
    RefreshCw, ExternalLink, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react';
import { MdRestaurant } from 'react-icons/md';
import { useMyOrders } from '@/hooks/useOrders';
import { Order } from '@/types/response/order.response';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Order['status'], { text: string; color: string; bgColor: string; dotColor: string }> = {
    PENDING:               { text: 'รอดำเนินการ',    color: 'text-amber-800',   bgColor: 'bg-amber-100',   dotColor: 'bg-amber-500' },
    AWAITING_PAYMENT:      { text: 'รอชำระเงิน',     color: 'text-blue-800',    bgColor: 'bg-blue-100',    dotColor: 'bg-blue-500' },
    AWAITING_CONFIRMATION: { text: 'รอยืนยันสลิป',  color: 'text-purple-800',  bgColor: 'bg-purple-100',  dotColor: 'bg-purple-500' },
    COOKING:               { text: 'กำลังทำอาหาร',  color: 'text-orange-800',  bgColor: 'bg-orange-100',  dotColor: 'bg-orange-500' },
    READY_FOR_PICKUP:      { text: 'พร้อมรับแล้ว!', color: 'text-emerald-800', bgColor: 'bg-emerald-100', dotColor: 'bg-emerald-500' },
    COMPLETED:             { text: 'เสร็จสิ้น',      color: 'text-slate-700',   bgColor: 'bg-slate-100',   dotColor: 'bg-slate-400' },
    CANCELLED:             { text: 'ยกเลิกแล้ว',     color: 'text-red-800',     bgColor: 'bg-red-100',     dotColor: 'bg-red-500' },
    REJECTED:              { text: 'ถูกปฏิเสธ',      color: 'text-red-800',     bgColor: 'bg-red-100',     dotColor: 'bg-red-500' },
};

// ── Progress steps ─────────────────────────────────────────────────────────────
const PROGRESS_STEPS = ['ยืนยัน', 'ชำระเงิน', 'ทำอาหาร', 'พร้อมรับ', 'เสร็จสิ้น'];

const getStepIndex = (status: Order['status']): number => {
    const map: Partial<Record<Order['status'], number>> = {
        PENDING: 0,
        AWAITING_PAYMENT: 1,
        AWAITING_CONFIRMATION: 1,
        COOKING: 2,
        READY_FOR_PICKUP: 3,
        COMPLETED: 4,
    };
    return map[status] ?? -1;
};

// ── Mini Countdown ─────────────────────────────────────────────────────────────
const MiniCountdown = ({ estimatedReadyAt }: { estimatedReadyAt: string }) => {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const update = () =>
            setRemaining(Math.max(0, Math.floor((new Date(estimatedReadyAt).getTime() - Date.now()) / 1000)));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [estimatedReadyAt]);

    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    const isDone = remaining === 0;
    const isAlmostReady = !isDone && remaining <= 120;

    return (
        <span className={`font-mono font-bold ${isDone ? 'text-green-600' : isAlmostReady ? 'text-amber-600 animate-pulse' : 'text-orange-600'}`}>
            {isDone ? 'ใกล้พร้อมแล้ว' : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}
        </span>
    );
};

// ── Mini Progress Bar ──────────────────────────────────────────────────────────
const MiniProgressBar = ({ status }: { status: Order['status'] }) => {
    const current = getStepIndex(status);
    if (current < 0) return null;

    return (
        <div className="px-3 py-3 border-b border-slate-100">
            <div className="flex items-center">
                {PROGRESS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 transition-all
                            ${i < current ? 'bg-orange-500 text-white' :
                              i === current ? 'bg-orange-500 text-white ring-2 ring-orange-200 ring-offset-1' :
                              'bg-slate-200 text-slate-400'}`}>
                            {i < current ? '✓' : i + 1}
                        </div>
                        {i < PROGRESS_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-0.5 ${i < current ? 'bg-orange-500' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-1.5">
                {PROGRESS_STEPS.map((step, i) => (
                    <span key={step} className={`text-[9px] font-semibold text-center w-1/5
                        ${i <= current ? 'text-orange-600' : 'text-slate-400'}`}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ── Order Mini Card (list item) ────────────────────────────────────────────────
const OrderMiniCard = ({ order, onClick }: { order: Order; onClick: () => void }) => {
    const cfg = STATUS_CONFIG[order.status];
    const isActive = !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status);
    const showCountdown = ['COOKING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION'].includes(order.status) && !!order.estimatedReadyAt;

    return (
        <div
            onClick={onClick}
            className={`px-3 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-0
                ${order.status === 'READY_FOR_PICKUP' ? 'bg-emerald-50/60 hover:bg-emerald-50' :
                  order.hasIssue ? 'bg-red-50/50 hover:bg-red-50' :
                  'hover:bg-orange-50'}`}
        >
            <div className="flex items-start gap-2.5">
                {/* Store image */}
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                    {order.store.image ? (
                        <img src={order.store.image} alt={order.store.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <MdRestaurant size={18} className="text-slate-400" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-slate-800 text-sm truncate leading-tight">{order.store.name}</p>
                        <span className="text-xs font-black text-orange-500 flex-shrink-0">Q{order.queueNumber}</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotColor} ${isActive ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.text}</span>
                    </div>

                    {showCountdown && order.estimatedReadyAt && (
                        <div className="flex items-center gap-1 mt-1">
                            <Clock size={11} className="text-slate-400 flex-shrink-0" />
                            <span className="text-xs text-slate-500">เหลือ </span>
                            <MiniCountdown estimatedReadyAt={order.estimatedReadyAt} />
                        </div>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                        <p className="text-xs font-bold text-emerald-600 mt-1 animate-pulse">มารับได้เลย!</p>
                    )}

                    {order.hasIssue && (
                        <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={11} className="text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 font-medium truncate">{order.issueReason ?? 'ร้านแจ้งปัญหา'}</p>
                        </div>
                    )}
                </div>

                <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-1" />
            </div>
        </div>
    );
};

// ── Order Mini Detail ──────────────────────────────────────────────────────────
const OrderMiniDetail = ({ order, onBack }: { order: Order; onBack: () => void }) => {
    const cfg = STATUS_CONFIG[order.status];
    const isActive = !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status);
    const showCountdown = ['COOKING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION'].includes(order.status) && !!order.estimatedReadyAt;
    const isCancelled = ['CANCELLED', 'REJECTED'].includes(order.status);

    return (
        <div className="flex flex-col h-full">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0 bg-white">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-slate-500 hover:text-orange-500 text-sm font-semibold transition-colors"
                >
                    <ChevronLeft size={15} />
                    กลับ
                </button>
                <Link
                    to={`/my-orders/${order.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                >
                    ดูทั้งหมด <ExternalLink size={12} />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Store banner */}
                <div className="relative h-24 overflow-hidden flex-shrink-0">
                    {order.store.image ? (
                        <img src={order.store.image} alt={order.store.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <MdRestaurant size={36} className="text-slate-400" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-end justify-between">
                        <div>
                            <p className="text-white font-bold text-sm drop-shadow leading-tight">{order.store.name}</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${cfg.bgColor} ${cfg.color}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${isActive ? 'animate-pulse' : ''}`} />
                                {cfg.text}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/70 text-[10px]">คิว</p>
                            <p className="text-white font-black text-xl drop-shadow">Q{order.queueNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                {!isCancelled && <MiniProgressBar status={order.status} />}

                {/* Cancelled / Rejected */}
                {isCancelled && (
                    <div className="mx-3 mt-3 flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <XCircle size={16} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-700">ออร์เดอร์ถูกยกเลิก</p>
                            <p className="text-xs text-red-500">ไม่สามารถดำเนินการต่อได้</p>
                        </div>
                    </div>
                )}

                {/* Ready for pickup banner */}
                {order.status === 'READY_FOR_PICKUP' && (
                    <div className="mx-3 mt-3 flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-800">อาหารพร้อมรับแล้ว!</p>
                            <p className="text-xs text-emerald-600">กรุณามารับอาหารที่ร้านได้เลย</p>
                        </div>
                    </div>
                )}

                {/* Completed banner */}
                {order.status === 'COMPLETED' && (
                    <div className="mx-3 mt-3 flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={16} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">รับอาหารเสร็จสิ้น</p>
                            <p className="text-xs text-slate-500">ขอบคุณที่ใช้บริการ</p>
                        </div>
                    </div>
                )}

                {/* Countdown */}
                {showCountdown && order.estimatedReadyAt && (
                    <div className="mx-3 mt-3 flex items-center gap-2.5 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-orange-600 font-medium">เวลาที่เหลือ</p>
                            <MiniCountdown estimatedReadyAt={order.estimatedReadyAt} />
                        </div>
                    </div>
                )}

                {/* Issue banner */}
                {order.hasIssue && order.issueReason && (
                    <div className="mx-3 mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-700">ร้านค้าแจ้งปัญหา</p>
                            <p className="text-xs text-red-600 mt-0.5">{order.issueReason}</p>
                        </div>
                    </div>
                )}

                {/* Order items */}
                <div className="mx-3 mt-3 mb-2">
                    <p className="text-xs font-bold text-slate-500 mb-2">รายการอาหาร ({order.orderItems.length})</p>
                    <div className="bg-slate-50 rounded-xl overflow-hidden">
                        {order.orderItems.slice(0, 4).map((item, i) => (
                            <div key={item.id}
                                className={`flex justify-between items-center px-3 py-2 ${i < Math.min(order.orderItems.length, 4) - 1 ? 'border-b border-slate-100' : ''}`}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                                        {item.menu.image ? (
                                            <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdRestaurant size={10} className="text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-700 truncate">
                                        {item.menu.name}
                                        <span className="text-slate-400 ml-1">×{item.quantity}</span>
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-800 flex-shrink-0 ml-2">฿{item.subtotal.toFixed(0)}</span>
                            </div>
                        ))}
                        {order.orderItems.length > 4 && (
                            <div className="px-3 py-2 border-t border-slate-100">
                                <p className="text-xs text-slate-400">+ อีก {order.orderItems.length - 4} รายการ</p>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200">
                        <span className="text-xs text-slate-500">ยอดรวมทั้งหมด</span>
                        <span className="text-base font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <div className="p-3 border-t border-slate-100 flex-shrink-0">
                <Link to={`/my-orders/${order.id}`} className="block">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                        ดูรายละเอียดทั้งหมด
                        <ExternalLink size={14} />
                    </button>
                </Link>
            </div>
        </div>
    );
};

// ── Main TrackOrderPanel ───────────────────────────────────────────────────────
export const TrackOrderPanel = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { data: ordersData, isLoading, refetch, isFetching } = useMyOrders({
        page: 1,
        pageSize: 20,
        refetchInterval: 30000,
    });

    const activeOrders = ordersData?.data?.filter(o =>
        !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status)
    ) ?? [];

    const recentHistory = ordersData?.data?.filter(o =>
        ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status)
    ).slice(0, 5) ?? [];

    // Update selected order data when fresh data arrives
    const freshSelectedOrder = selectedOrder
        ? (ordersData?.data?.find(o => o.id === selectedOrder.id) ?? selectedOrder)
        : null;

    if (freshSelectedOrder && selectedOrder) {
        return <OrderMiniDetail order={freshSelectedOrder} onBack={() => setSelectedOrder(null)} />;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0">
                <p className="text-xs font-bold text-slate-500">ออเดอร์ของคุณ</p>
                <button
                    onClick={() => refetch()}
                    className={`text-slate-400 hover:text-orange-500 transition-colors p-1.5 rounded-lg hover:bg-orange-50 ${isFetching ? 'animate-spin text-orange-400' : ''}`}
                >
                    <RefreshCw size={13} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-28 gap-2">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400">กำลังโหลด...</p>
                    </div>
                ) : activeOrders.length === 0 && recentHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-36 gap-2">
                        <ShoppingBag size={32} className="text-slate-300" />
                        <p className="text-slate-400 text-sm font-medium">ยังไม่มีออเดอร์</p>
                        <p className="text-slate-300 text-xs">สั่งอาหารได้เลย!</p>
                    </div>
                ) : (
                    <>
                        {/* Active orders */}
                        {activeOrders.length > 0 && (
                            <div>
                                <div className="px-3 py-1.5 bg-orange-50 border-b border-orange-100/80 sticky top-0">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <p className="text-xs font-bold text-orange-600">
                                            กำลังดำเนินการ ({activeOrders.length})
                                        </p>
                                    </div>
                                </div>
                                {activeOrders.map(order => (
                                    <OrderMiniCard
                                        key={order.id}
                                        order={order}
                                        onClick={() => setSelectedOrder(order)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* History */}
                        {recentHistory.length > 0 && (
                            <div>
                                <div className="px-3 py-1.5 bg-slate-50 border-y border-slate-100 sticky top-0">
                                    <p className="text-xs font-bold text-slate-500">ล่าสุด</p>
                                </div>
                                {recentHistory.map(order => (
                                    <OrderMiniCard
                                        key={order.id}
                                        order={order}
                                        onClick={() => setSelectedOrder(order)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* View all link */}
                        <div className="p-3">
                            <Link to="/my-orders" className="block">
                                <button className="w-full border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-500 hover:text-orange-600 font-semibold py-2 rounded-xl text-xs transition-all">
                                    ดูออเดอร์ทั้งหมด →
                                </button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
