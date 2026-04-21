// @/pages/my-store/kds/index.tsx

import { useEffect, useState } from "react";
import { useMyStore } from "@/hooks/useStores";
import { useKDS, type KdsOrder } from "@/hooks/useKDS";
import { useUpdateOrderStatus, useAdjustOrderTime } from "@/hooks/useOrders";
import { MdRestaurant } from "react-icons/md";
import {
    FiClock, FiPackage, FiWifi, FiWifiOff, FiX, FiEdit2,
    FiCheck, FiAlertCircle, FiDollarSign, FiZap
} from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";

// ── Timer Hook ────────────────────────────────────────────────────────────────
const useElapsedTime = (startIso: string | null) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startIso) return;
        const update = () => {
            const diff = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
            setElapsed(Math.max(0, diff));
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [startIso]);

    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return { time: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, minutes: m };
};

const ElapsedTimer = ({
    startIso,
    warnAfterMin = 10,
}: {
    startIso: string | null;
    warnAfterMin?: number;
}) => {
    const { time, minutes } = useElapsedTime(startIso);
    const isWarn = minutes >= warnAfterMin;
    const isDanger = minutes >= warnAfterMin * 1.5;

    return (
        <span
            className={`font-mono font-bold text-base tabular-nums ${
                isDanger
                    ? "text-red-500 animate-pulse"
                    : isWarn
                    ? "text-amber-500"
                    : "text-slate-600"
            }`}
        >
            {time}
        </span>
    );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDING:               { label: "รอยืนยัน",     className: "bg-slate-100 text-slate-600" },
    AWAITING_PAYMENT:      { label: "รอชำระ",         className: "bg-blue-50 text-blue-600" },
    AWAITING_CONFIRMATION: { label: "รอตรวจสลิป",    className: "bg-violet-50 text-violet-600" },
    COOKING:               { label: "กำลังทำ",        className: "bg-orange-50 text-orange-600" },
    READY_FOR_PICKUP:      { label: "พร้อมรับ",       className: "bg-green-50 text-green-700" },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
};

// ── Cancel Modal ──────────────────────────────────────────────────────────────
const CancelModal = ({
    queueNumber,
    onClose,
    onConfirm,
    isPending,
}: {
    queueNumber: number;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}) => {
    const [reason, setReason] = useState("");

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                        <FiAlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">ยกเลิกออเดอร์ #{queueNumber}</h3>
                        <p className="text-xs text-gray-400">ลูกค้าจะได้รับการแจ้งเตือน</p>
                    </div>
                </div>
                <textarea
                    className="w-full border border-gray-200 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 bg-gray-50"
                    rows={3}
                    placeholder="เช่น วัตถุดิบหมด, เครื่องครัวขัดข้อง..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => reason.trim() && onConfirm(reason.trim())}
                        disabled={!reason.trim() || isPending}
                        className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isPending ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Adjust Time Modal ─────────────────────────────────────────────────────────
const AdjustTimeModal = ({
    queueNumber,
    onClose,
    onConfirm,
    isPending,
}: {
    queueNumber: number;
    onClose: () => void;
    onConfirm: (minutes: number) => void;
    isPending: boolean;
}) => {
    const [minutes, setMinutes] = useState(5);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                        <FiEdit2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">ปรับเวลา #{queueNumber}</h3>
                        <p className="text-xs text-gray-400">ออเดอร์นี้จะเสร็จในอีกกี่นาที?</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 mb-4 bg-orange-50 rounded-2xl p-4">
                    <button
                        onClick={() => setMinutes(Math.max(1, minutes - 5))}
                        className="w-10 h-10 rounded-xl bg-white text-gray-700 font-bold text-lg hover:bg-gray-100 shadow-sm transition-colors"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-5xl font-extrabold text-orange-500">{minutes}</span>
                        <span className="text-gray-500 ml-2 text-sm">นาที</span>
                    </div>
                    <button
                        onClick={() => setMinutes(Math.min(180, minutes + 5))}
                        className="w-10 h-10 rounded-xl bg-white text-gray-700 font-bold text-lg hover:bg-gray-100 shadow-sm transition-colors"
                    >
                        +
                    </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    {[5, 10, 15, 20, 30].map(m => (
                        <button
                            key={m}
                            onClick={() => setMinutes(m)}
                            className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-colors ${
                                minutes === m
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {m} นาที
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => onConfirm(minutes)}
                        disabled={isPending}
                        className="flex-1 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                        {isPending ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Order Card ────────────────────────────────────────────────────────────────
type CardAction = {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant: "primary" | "secondary" | "danger" | "warning" | "info";
    isPending?: boolean;
};

const VARIANT_STYLES: Record<CardAction["variant"], string> = {
    primary:   "bg-green-500 text-white hover:bg-green-600 border-green-500",
    secondary: "bg-violet-500 text-white hover:bg-violet-600 border-violet-500",
    danger:    "bg-red-50 text-red-500 hover:bg-red-100 border-red-200",
    warning:   "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
    info:      "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
};

const KdsCard = ({
    order,
    timerStart,
    accentColor,
    warnAfterMin,
    actions,
}: {
    order: KdsOrder;
    timerStart: string | null;
    accentColor: string;
    warnAfterMin?: number;
    actions: CardAction[];
}) => (
    <div className={`rounded-2xl bg-white shadow-sm border-l-4 ${accentColor} overflow-hidden`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-gray-900 leading-none">
                        #{order.queueNumber}
                    </span>
                    <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-100">
                    <FiClock className="w-3.5 h-3.5 text-gray-400" />
                    <ElapsedTimer startIso={timerStart} warnAfterMin={warnAfterMin} />
                </div>
            </div>

            {/* Items */}
            <ul className="space-y-1.5">
                {order.orderItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {item.quantity}
                        </span>
                        <span className="text-sm text-gray-800 font-medium leading-tight">{item.menu.name}</span>
                    </li>
                ))}
            </ul>
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
            </span>
            <span className="text-sm font-bold text-gray-700">
                ฿{order.totalAmount.toLocaleString()}
            </span>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
            <div className={`px-4 pb-4 pt-2 flex gap-2 ${actions.length > 2 ? "flex-wrap" : ""}`}>
                {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={action.onClick}
                        disabled={action.isPending}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            VARIANT_STYLES[action.variant]
                        } ${actions.length === 1 ? "w-full" : "flex-1"}`}
                    >
                        {action.icon}
                        {action.label}
                    </button>
                ))}
            </div>
        )}
    </div>
);

// ── Column ────────────────────────────────────────────────────────────────────
const KdsColumn = ({
    title,
    icon,
    count,
    orders,
    headerGradient,
    accentBorder,
    timerKey,
    warnAfterMin,
    emptyText,
    renderActions,
}: {
    title: string;
    icon: React.ReactNode;
    count: number;
    orders: KdsOrder[];
    headerGradient: string;
    accentBorder: string;
    timerKey: "createdAt" | "startCookingAt";
    warnAfterMin?: number;
    emptyText: string;
    renderActions: (order: KdsOrder) => CardAction[];
}) => (
    <div className="flex flex-col h-full min-h-0">
        {/* Column Header */}
        <div className={`${headerGradient} rounded-2xl p-4 mb-3 text-white shadow-md flex-shrink-0`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="font-bold text-base">{title}</h3>
                </div>
                <span className="bg-white/25 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {count}
                </span>
            </div>
        </div>

        {/* Cards Scroll */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 pb-2">
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 gap-2">
                    <span className="text-2xl">🍽</span>
                    <p className="text-gray-400 text-sm">{emptyText}</p>
                </div>
            ) : (
                orders.map((order) => (
                    <KdsCard
                        key={order.id}
                        order={order}
                        timerStart={timerKey === "startCookingAt" ? order.startCookingAt : order.createdAt}
                        accentColor={accentBorder}
                        warnAfterMin={warnAfterMin}
                        actions={renderActions(order)}
                    />
                ))
            )}
        </div>
    </div>
);

// ── Main KDS Page ─────────────────────────────────────────────────────────────
export default function KDSPage() {
    const { data: myStore, isLoading } = useMyStore();
    const { isConnected, pendingOrders, cookingOrders, readyOrders } = useKDS(myStore?.id);
    const updateStatus = useUpdateOrderStatus();
    const adjustTime = useAdjustOrderTime();

    const [cancelTarget, setCancelTarget] = useState<KdsOrder | null>(null);
    const [adjustTarget, setAdjustTarget] = useState<KdsOrder | null>(null);

    const handleAction = (orderId: string, action: Parameters<typeof updateStatus.mutate>[0]["action"], extra?: object) => {
        updateStatus.mutate({ orderId, action, ...extra } as any);
    };

    const handleCancelConfirm = (reason: string) => {
        if (!cancelTarget) return;
        updateStatus.mutate(
            { orderId: cancelTarget.id, action: "CANCEL_BY_STORE", cancelReason: reason },
            { onSuccess: () => setCancelTarget(null) }
        );
    };

    const handleAdjustConfirm = (minutes: number) => {
        if (!adjustTarget) return;
        adjustTime.mutate(
            { orderId: adjustTarget.id, estimatedMinutes: minutes },
            { onSuccess: () => setAdjustTarget(null) }
        );
    };

    // Build actions per order based on status
    const getPendingActions = (order: KdsOrder): CardAction[] => {
        const actions: CardAction[] = [];

        if (order.status === "PENDING") {
            actions.push({
                label: "อนุมัติ",
                icon: <FiCheck className="w-4 h-4" />,
                onClick: () => handleAction(order.id, "APPROVE"),
                variant: "primary",
                isPending: updateStatus.isPending,
            });
            actions.push({
                label: "ปฏิเสธ",
                icon: <FiX className="w-4 h-4" />,
                onClick: () => setCancelTarget(order),
                variant: "danger",
            });
        } else if (order.status === "AWAITING_PAYMENT") {
            actions.push({
                label: "ข้ามการชำระ",
                icon: <FiZap className="w-4 h-4" />,
                onClick: () => handleAction(order.id, "FORCE_COOKING"),
                variant: "info",
                isPending: updateStatus.isPending,
            });
            actions.push({
                label: "ยกเลิก",
                icon: <FiX className="w-4 h-4" />,
                onClick: () => setCancelTarget(order),
                variant: "danger",
            });
        } else if (order.status === "AWAITING_CONFIRMATION") {
            actions.push({
                label: "ยืนยันสลิป",
                icon: <FiDollarSign className="w-4 h-4" />,
                onClick: () => handleAction(order.id, "CONFIRM_PAYMENT"),
                variant: "secondary",
                isPending: updateStatus.isPending,
            });
            actions.push({
                label: "ข้ามขั้นตอน",
                icon: <FiZap className="w-4 h-4" />,
                onClick: () => handleAction(order.id, "FORCE_COOKING"),
                variant: "info",
                isPending: updateStatus.isPending,
            });
            actions.push({
                label: "ยกเลิก",
                icon: <FiX className="w-4 h-4" />,
                onClick: () => setCancelTarget(order),
                variant: "danger",
            });
        }

        return actions;
    };

    const getCookingActions = (order: KdsOrder): CardAction[] => [
        {
            label: "ทำเสร็จแล้ว",
            icon: <FiCheck className="w-4 h-4" />,
            onClick: () => handleAction(order.id, "PREPARE_COMPLETE"),
            variant: "primary",
            isPending: updateStatus.isPending,
        },
        {
            label: "ปรับเวลา",
            icon: <FiEdit2 className="w-4 h-4" />,
            onClick: () => setAdjustTarget(order),
            variant: "warning",
        },
        {
            label: "ยกเลิก",
            icon: <FiX className="w-4 h-4" />,
            onClick: () => setCancelTarget(order),
            variant: "danger",
        },
    ];

    const getReadyActions = (order: KdsOrder): CardAction[] => [
        {
            label: "ยกเลิก",
            icon: <FiX className="w-4 h-4" />,
            onClick: () => setCancelTarget(order),
            variant: "danger",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500" />
            </div>
        );
    }

    if (!myStore) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] text-gray-500">
                ไม่พบข้อมูลร้านค้า
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 flex flex-col gap-5">
            {/* Modals */}
            {cancelTarget && (
                <CancelModal
                    queueNumber={cancelTarget.queueNumber}
                    onClose={() => setCancelTarget(null)}
                    onConfirm={handleCancelConfirm}
                    isPending={updateStatus.isPending}
                />
            )}
            {adjustTarget && (
                <AdjustTimeModal
                    queueNumber={adjustTarget.queueNumber}
                    onClose={() => setAdjustTarget(null)}
                    onConfirm={handleAdjustConfirm}
                    isPending={adjustTime.isPending}
                />
            )}

            {/* Header */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200">
                            <IoFastFoodOutline className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">ครัว — {myStore.name}</h1>
                            <p className="text-sm text-gray-400">Kitchen Display System</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${
                        isConnected
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-red-50 text-red-500 border-red-200"
                    }`}>
                        {isConnected ? (
                            <><FiWifi className="w-4 h-4" /> เชื่อมต่อแล้ว</>
                        ) : (
                            <><FiWifiOff className="w-4 h-4 animate-pulse" /> ไม่ได้เชื่อมต่อ</>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                        { label: "รอคิว", count: pendingOrders.length, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
                        { label: "กำลังทำ", count: cookingOrders.length, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
                        { label: "พร้อมรับ", count: readyOrders.length, color: "text-green-600", bg: "bg-green-50 border-green-200" },
                    ].map(({ label, count, color, bg }) => (
                        <div key={label} className={`${bg} border rounded-2xl p-3 text-center`}>
                            <p className={`text-2xl font-extrabold ${color}`}>{count}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* KDS Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 min-h-0" style={{ height: "calc(100vh - 260px)" }}>
                <KdsColumn
                    title="รอคิว"
                    icon={<FiClock className="w-5 h-5" />}
                    count={pendingOrders.length}
                    orders={pendingOrders}
                    headerGradient="bg-gradient-to-r from-slate-600 to-slate-500"
                    accentBorder="border-l-slate-400"
                    timerKey="createdAt"
                    warnAfterMin={15}
                    emptyText="ไม่มีออเดอร์รอคิว"
                    renderActions={getPendingActions}
                />
                <KdsColumn
                    title="กำลังทำอาหาร"
                    icon={<MdRestaurant className="w-5 h-5" />}
                    count={cookingOrders.length}
                    orders={cookingOrders}
                    headerGradient="bg-gradient-to-r from-orange-500 to-amber-400"
                    accentBorder="border-l-orange-400"
                    timerKey="startCookingAt"
                    warnAfterMin={10}
                    emptyText="ยังไม่มีออเดอร์ที่กำลังทำ"
                    renderActions={getCookingActions}
                />
                <KdsColumn
                    title="พร้อมรับ"
                    icon={<FiPackage className="w-5 h-5" />}
                    count={readyOrders.length}
                    orders={readyOrders}
                    headerGradient="bg-gradient-to-r from-emerald-500 to-green-400"
                    accentBorder="border-l-emerald-400"
                    timerKey="startCookingAt"
                    warnAfterMin={999}
                    emptyText="ยังไม่มีออเดอร์พร้อมรับ"
                    renderActions={getReadyActions}
                />
            </div>
        </div>
    );
}
