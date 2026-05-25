import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock, AlertTriangle, Package, CheckCircle, XCircle,
    ExternalLink, ChevronRight, CreditCard,
} from 'lucide-react';
import { MdRestaurant } from 'react-icons/md';
import { Order } from '@/types/response/order.response';

// ── Shared config ──────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<Order['status'], {
    text: string; color: string; bg: string; border: string; dot: string; badgeBg: string;
}> = {
    PENDING:               { text: 'Pending',       color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-300',  dot: 'bg-amber-500',  badgeBg: 'bg-amber-100' },
    AWAITING_PAYMENT:      { text: 'Awaiting Payment', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-300',   dot: 'bg-blue-500',   badgeBg: 'bg-blue-100' },
    AWAITING_CONFIRMATION: { text: 'Awaiting Confirmation', color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-300', dot: 'bg-purple-500', badgeBg: 'bg-purple-100' },
    COOKING:               { text: 'Cooking',       color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-300', dot: 'bg-orange-500', badgeBg: 'bg-orange-100' },
    READY_FOR_PICKUP:      { text: 'Ready for Pickup!', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-400',dot: 'bg-emerald-500',badgeBg: 'bg-emerald-100' },
    COMPLETED:             { text: 'Completed',     color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200',  dot: 'bg-slate-400',  badgeBg: 'bg-slate-100' },
    CANCELLED:             { text: 'Cancelled',    color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-400',    dot: 'bg-red-500',    badgeBg: 'bg-red-100' },
    REJECTED:              { text: 'Rejected',     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-400',    dot: 'bg-red-500',    badgeBg: 'bg-red-100' },
};

const STEPS = ['Confirm', 'Payment', 'Cooking', 'Pickup', 'Complete'];
const getStep = (status: Order['status']): number => ({
    PENDING: 0, AWAITING_PAYMENT: 1, AWAITING_CONFIRMATION: 1,
    COOKING: 2, READY_FOR_PICKUP: 3, COMPLETED: 4,
    REJECTED: -1, CANCELLED: -1,
}[status] ?? -1);

const ACTIVE: Order['status'][] = ['PENDING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION', 'COOKING', 'READY_FOR_PICKUP'];

// ── Countdown (shared) ────────────────────────────────────────────────────────
export const Countdown = ({ estimatedReadyAt, large = false }: { estimatedReadyAt: string; large?: boolean }) => {
    const [rem, setRem] = useState(0);
    useEffect(() => {
        const tick = () => setRem(Math.max(0, Math.floor((new Date(estimatedReadyAt).getTime() - Date.now()) / 1000)));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [estimatedReadyAt]);
    const m = Math.floor(rem / 60), s = rem % 60;
    const done = rem === 0, almost = !done && rem <= 120;
    const cls = done ? 'text-green-600' : almost ? 'text-amber-500 animate-pulse' : 'text-orange-500';
    return (
        <span className={`font-mono font-black tabular-nums ${large ? 'text-3xl' : 'text-sm'} ${cls}`}>
            {done ? 'Almost ready' : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}
        </span>
    );
};

// ── ProgressBar (for detail view) ─────────────────────────────────────────────
const ProgressBar = ({ status }: { status: Order['status'] }) => {
    const cur = getStep(status);
    if (cur < 0) return null;
    return (
        <div className="px-4 py-3">
            <div className="flex items-center">
                {STEPS.map((_, i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all
                            ${i < cur  ? 'bg-orange-500 text-white shadow-sm' :
                              i === cur ? 'bg-orange-500 text-white ring-[3px] ring-orange-200 ring-offset-1 shadow-md' :
                                          'bg-slate-200 text-slate-400'}`}>
                            {i < cur ? '✓' : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-0.5 rounded-full transition-all ${i < cur ? 'bg-orange-400' : 'bg-slate-200'}`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                {STEPS.map((step, i) => (
                    <span key={step} className={`text-[9px] font-semibold text-center flex-1 ${i <= cur ? 'text-orange-600' : 'text-slate-400'}`}>
                        {step}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// OrderChatCard — compact clickable card shown at top of chat room
// ══════════════════════════════════════════════════════════════════════════════
interface CardProps { 
    order: Order; 
    onSelect?: () => void; 
    onViewDetail: () => void; 
    isSelected?: boolean;
}

export const OrderChatCard = ({ order, onSelect, onViewDetail, isSelected }: CardProps) => {
    const cfg = STATUS_CFG[order.status];
    const isActive = ACTIVE.includes(order.status);
    const showCountdown = ['COOKING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION'].includes(order.status) && !!order.estimatedReadyAt;
    const isReady = order.status === 'READY_FOR_PICKUP';
    const isRejected = ['REJECTED', 'CANCELLED'].includes(order.status);

    const handleClick = () => {
        if (onSelect) {
            onSelect();
        } else {
            onViewDetail();
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 border-b cursor-pointer ${cfg.border} ${cfg.bg}
                hover:brightness-95 active:brightness-90 transition-all flex-shrink-0 text-left
                ${isSelected ? 'ring-2 ring-orange-500 border-orange-500 z-10' : ''}`}
        >
            {/* Store image */}
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 shadow-sm">
                {order.store?.image ? (
                    <img src={order.store.image} alt={order.store?.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MdRestaurant size={20} className="text-slate-400" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                    <span className="text-xs font-black text-slate-700">Q{order.queueNumber}</span>
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.text}</span>
                    {order.hasIssue && (
                        <AlertTriangle size={12} className="text-red-500 animate-pulse flex-shrink-0" />
                    )}
                    {isSelected && (
                        <span className="text-[9px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Selected
                        </span>
                    )}
                </div>

                {/* Second line */}
                <div className="flex items-center gap-1.5 mt-0.5">
                    {showCountdown && order.estimatedReadyAt ? (
                        <span className="flex items-center gap-1">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500">Remaining </span>
                            <Countdown estimatedReadyAt={order.estimatedReadyAt} />
                        </span>
                    ) : isReady ? (
                        <span className="text-xs font-bold text-emerald-600 animate-pulse">Pick up food now!</span>
                    ) : isRejected ? (
                        <span className="text-xs text-red-500 font-medium">Order failed</span>
                    ) : (
                        <span className="text-xs text-slate-400">Order success</span>
                    )}
                </div>
            </div>

            {/* View Details specific button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onViewDetail();
                }}
                className="p-2 hover:bg-black/5 rounded-lg text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 flex items-center justify-center"
                title="View details"
            >
                <ExternalLink size={15} />
            </button>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// OrderDetailView — full detail panel (replaces chat body)
// ══════════════════════════════════════════════════════════════════════════════
interface DetailProps { order: Order; isStore?: boolean; }

export const OrderDetailView = ({ order, isStore = false }: DetailProps) => {
    const cfg = STATUS_CFG[order.status];
    const isActive = ACTIVE.includes(order.status);
    const isReady = order.status === 'READY_FOR_PICKUP';
    const isRejected = order.status === 'REJECTED';
    const isCancelled = order.status === 'CANCELLED';
    const isDone = order.status === 'COMPLETED';
    const isBad = isRejected || isCancelled;
    const showCountdown = ['COOKING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION'].includes(order.status) && !!order.estimatedReadyAt;
    const isPaid = !!order.paidAt;

    return (
        <div className="flex-1 overflow-y-auto min-h-0">

            {/* ── Store Banner ─────────────────────────────────────────── */}
            <div className="relative h-28 bg-gradient-to-br from-slate-300 to-slate-400 flex-shrink-0 overflow-hidden">
                {order.store?.image ? (
                    <img src={order.store.image} alt={order.store?.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MdRestaurant size={48} className="text-white/40" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Store info overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
                    <div>
                        <p className="text-white font-black text-base drop-shadow leading-tight">{order.store?.name}</p>
                        <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
                            {cfg.text}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-[10px]">Queue</p>
                        <p className="text-white font-black text-2xl drop-shadow">Q{order.queueNumber}</p>
                    </div>
                </div>
            </div>

            {/* ── REJECTED banner ──────────────────────────────────────── */}
            {isRejected && (
                <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-red-300">
                    <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
                        <XCircle size={18} className="text-white flex-shrink-0" />
                        <p className="text-white font-bold text-sm">Order Rejected</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2.5">
                        <p className="text-red-700 text-xs">The store cannot accept your order.</p>
                        <p className="text-red-500 text-xs mt-1">You can try ordering again or choose another store.</p>
                    </div>
                </div>
            )}

            {/* ── CANCELLED banner ─────────────────────────────────────── */}
            {isCancelled && (
                <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-red-300">
                    <div className="bg-red-500 px-4 py-2.5 flex items-center gap-2">
                        <XCircle size={18} className="text-white flex-shrink-0" />
                        <p className="text-white font-bold text-sm">Order Cancelled</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2.5">
                        <p className="text-red-700 text-xs">This order has been cancelled.</p>
                    </div>
                </div>
            )}

            {/* ── READY banner ─────────────────────────────────────────── */}
            {isReady && (
                <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-emerald-300">
                    <div className="bg-emerald-500 px-4 py-3 flex items-center gap-3">
                        <Package size={20} className="text-white flex-shrink-0 animate-bounce" />
                        <div>
                            <p className="text-white font-black text-sm">Food ready for pickup!</p>
                            <p className="text-emerald-100 text-xs">Please pick up your food at the store.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── COMPLETED banner ─────────────────────────────────────── */}
            {isDone && (
                <div className="mx-3 mt-3 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <CheckCircle size={18} className="text-slate-500 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-slate-700">Food Picked Up</p>
                        <p className="text-xs text-slate-400">Thank you for using our service</p>
                    </div>
                </div>
            )}

            {/* ── Progress Bar ─────────────────────────────────────────── */}
            {!isBad && (
                <div className="bg-white mx-3 mt-3 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <ProgressBar status={order.status} />
                </div>
            )}

            {/* ── Countdown ────────────────────────────────────────────── */}
            {showCountdown && order.estimatedReadyAt && (
                <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-orange-200 bg-orange-50">
                    <div className="px-4 py-2 bg-orange-500 flex items-center gap-2">
                        <Clock size={14} className="text-white" />
                        <p className="text-white text-xs font-bold">Time remaining before pickup</p>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-orange-600 font-medium mb-0.5">Countdown</p>
                            <Countdown estimatedReadyAt={order.estimatedReadyAt} large />
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <Clock size={24} className="text-orange-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Issue Alert ──────────────────────────────────────────── */}
            {order.hasIssue && order.issueReason && (
                <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-red-300">
                    <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-white flex-shrink-0" />
                        <p className="text-white text-xs font-bold">Store reported an issue</p>
                    </div>
                    <div className="bg-red-50 px-4 py-2.5">
                        <p className="text-red-700 text-sm">{order.issueReason}</p>
                    </div>
                </div>
            )}

            {/* ── Order Items ──────────────────────────────────────────── */}
            <div className="mx-3 mt-3">
                <p className="text-xs font-bold text-slate-500 mb-2">
                    Food Items ({order.orderItems.length} items)
                </p>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {order.orderItems.map((item, i) => (
                        <div key={item.id}
                            className={`flex items-center gap-3 px-3 py-2.5 ${i < order.orderItems.length - 1 ? 'border-b border-slate-100' : ''}`}>
                            {/* Item image */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                {item.menu.image ? (
                                    <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <MdRestaurant size={16} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.menu.name}</p>
                                <p className="text-xs text-slate-400">฿{item.menu.price.toFixed(0)} × {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-800 flex-shrink-0">฿{item.subtotal.toFixed(0)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Payment Summary ──────────────────────────────────────── */}
            <div className="mx-3 mt-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <CreditCard size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">
                            {order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'Cash'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                            ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                    </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* ── Order ID ─────────────────────────────────────────────── */}
            <div className="mx-3 mt-2 mb-1">
                <p className="text-[10px] text-slate-400 text-center font-mono">
                    #{order.id.substring(0, 20)}...
                </p>
            </div>

            {/* ── CTA ──────────────────────────────────────────────────── */}
            <div className="px-3 pt-1 pb-4">
                <Link to={isStore ? `/my-store/orders/${order.id}` : `/my-orders/${order.id}`}>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
                        {isBad ? 'Reorder / View Details' : 'View Details'}
                        <ExternalLink size={15} />
                    </button>
                </Link>
            </div>
        </div>
    );
};
