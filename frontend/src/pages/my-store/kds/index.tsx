// @/pages/my-store/kds/index.tsx

import { useEffect, useState } from "react";
import { useMyStore } from "@/hooks/useStores";
import { useKDS, type KdsOrder } from "@/hooks/useKDS";
import { useUpdateOrderStatus, useAdjustOrderTime } from "@/hooks/useOrders";
import { MdRestaurant } from "react-icons/md";
import { FiClock, FiPackage, FiWifi, FiWifiOff, FiX, FiSkipForward, FiEdit2 } from "react-icons/fi";
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
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ── Timer Display ─────────────────────────────────────────────────────────────
const ElapsedTimer = ({
    startIso,
    warnAfterMin = 10,
}: {
    startIso: string | null;
    warnAfterMin?: number;
}) => {
    const time = useElapsedTime(startIso);
    const minutes = startIso
        ? Math.floor((Date.now() - new Date(startIso).getTime()) / 60000)
        : 0;
    const isWarn = minutes >= warnAfterMin;
    const isDanger = minutes >= warnAfterMin * 1.5;

    return (
        <span
            className={`font-mono font-bold text-lg tabular-nums ${
                isDanger
                    ? "text-red-600 animate-pulse"
                    : isWarn
                    ? "text-orange-500"
                    : "text-gray-700"
            }`}
        >
            {time}
        </span>
    );
};

// ── Cancel Modal ──────────────────────────────────────────────────────────────
const CancelModal = ({
    orderId,
    queueNumber,
    onClose,
    onConfirm,
    isPending,
}: {
    orderId: string;
    queueNumber: number;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}) => {
    const [reason, setReason] = useState("");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">ยกเลิกออเดอร์ #{queueNumber}</h3>
                <p className="text-sm text-gray-500 mb-4">กรุณาระบุเหตุผลในการยกเลิก ลูกค้าจะได้รับการแจ้งเตือน</p>
                <textarea
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                    rows={3}
                    placeholder="เช่น วัตถุดิบหมด, เครื่องครัวขัดข้อง..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => reason.trim() && onConfirm(reason.trim())}
                        disabled={!reason.trim() || isPending}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
    orderId,
    queueNumber,
    onClose,
    onConfirm,
    isPending,
}: {
    orderId: string;
    queueNumber: number;
    onClose: () => void;
    onConfirm: (minutes: number) => void;
    isPending: boolean;
}) => {
    const [minutes, setMinutes] = useState(5);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">ปรับเวลา #{queueNumber}</h3>
                <p className="text-sm text-gray-500 mb-4">ออเดอร์นี้จะเสร็จในอีกกี่นาที?</p>
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => setMinutes(Math.max(1, minutes - 5))}
                        className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200"
                    >−</button>
                    <div className="flex-1 text-center">
                        <span className="text-4xl font-extrabold text-orange-500">{minutes}</span>
                        <span className="text-gray-500 ml-1">นาที</span>
                    </div>
                    <button
                        onClick={() => setMinutes(Math.min(180, minutes + 5))}
                        className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold text-lg hover:bg-gray-200"
                    >+</button>
                </div>
                <div className="flex gap-2 items-center flex-wrap mb-4">
                    {[5, 10, 15, 20, 30].map(m => (
                        <button
                            key={m}
                            onClick={() => setMinutes(m)}
                            className={`px-3 py-1 rounded-xl text-sm font-semibold border ${minutes === m ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                        >
                            {m} นาที
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => onConfirm(minutes)}
                        disabled={isPending}
                        className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {isPending ? "กำลังบันทึก..." : "บันทึก"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Order Card ────────────────────────────────────────────────────────────────
const KdsCard = ({
    order,
    timerStart,
    colorClass,
    warnAfterMin,
    showSkip,
    showAdjustTime,
    onCancel,
    onSkip,
    onAdjustTime,
}: {
    order: KdsOrder;
    timerStart: string | null;
    colorClass: string;
    warnAfterMin?: number;
    showSkip?: boolean;
    showAdjustTime?: boolean;
    onCancel: () => void;
    onSkip?: () => void;
    onAdjustTime?: () => void;
}) => (
    <div
        className={`rounded-2xl border-2 ${colorClass} bg-white shadow-md p-4 flex flex-col gap-3`}
    >
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-gray-900">
                    #{order.queueNumber}
                </span>
                <span className="text-xs text-gray-400 font-mono truncate max-w-[80px]">
                    {order.id.slice(-6)}
                </span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-3 py-1 border border-gray-200">
                <FiClock className="w-4 h-4 text-gray-500" />
                <ElapsedTimer startIso={timerStart} warnAfterMin={warnAfterMin} />
            </div>
        </div>

        {/* Items */}
        <ul className="space-y-1">
            {order.orderItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                        {item.quantity}
                    </span>
                    <span className="text-gray-800 font-medium truncate">{item.menu.name}</span>
                </li>
            ))}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-400">
                เข้าคิว {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-sm font-semibold text-gray-700">
                ฿{order.totalAmount.toLocaleString()}
            </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
            {showSkip && onSkip && ["AWAITING_PAYMENT", "AWAITING_CONFIRMATION"].includes(order.status) && (
                <button
                    onClick={onSkip}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                    <FiSkipForward className="w-3 h-3" />
                    ข้ามขั้นตอน
                </button>
            )}
            {showAdjustTime && onAdjustTime && (
                <button
                    onClick={onAdjustTime}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200 hover:bg-orange-100 transition-colors"
                >
                    <FiEdit2 className="w-3 h-3" />
                    ปรับเวลา
                </button>
            )}
            <button
                onClick={onCancel}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors"
            >
                <FiX className="w-3 h-3" />
                ยกเลิก
            </button>
        </div>
    </div>
);

// ── Column ────────────────────────────────────────────────────────────────────
const KdsColumn = ({
    title,
    icon,
    orders,
    headerColor,
    cardBorder,
    timerKey,
    warnAfterMin,
    emptyText,
    showSkip,
    showAdjustTime,
    onCancel,
    onSkip,
    onAdjustTime,
}: {
    title: string;
    icon: React.ReactNode;
    orders: KdsOrder[];
    headerColor: string;
    cardBorder: string;
    timerKey: "createdAt" | "startCookingAt";
    warnAfterMin?: number;
    emptyText: string;
    showSkip?: boolean;
    showAdjustTime?: boolean;
    onCancel: (order: KdsOrder) => void;
    onSkip?: (order: KdsOrder) => void;
    onAdjustTime?: (order: KdsOrder) => void;
}) => (
    <div className="flex flex-col h-full">
        {/* Column Header */}
        <div className={`${headerColor} rounded-2xl p-4 mb-4 text-white shadow-lg`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="text-sm text-white/80">{orders.length} รายการ</p>
                </div>
            </div>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {orders.length === 0 ? (
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">{emptyText}</p>
                </div>
            ) : (
                orders.map((order) => (
                    <KdsCard
                        key={order.id}
                        order={order}
                        timerStart={timerKey === "startCookingAt" ? order.startCookingAt : order.createdAt}
                        colorClass={cardBorder}
                        warnAfterMin={warnAfterMin}
                        showSkip={showSkip}
                        showAdjustTime={showAdjustTime}
                        onCancel={() => onCancel(order)}
                        onSkip={onSkip ? () => onSkip(order) : undefined}
                        onAdjustTime={onAdjustTime ? () => onAdjustTime(order) : undefined}
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

    const handleSkip = (order: KdsOrder) => {
        if (!confirm(`ข้ามขั้นตอนการชำระเงินสำหรับออเดอร์ #${order.queueNumber}?`)) return;
        updateStatus.mutate({ orderId: order.id, action: "FORCE_COOKING" });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500" />
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
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* Modals */}
            {cancelTarget && (
                <CancelModal
                    orderId={cancelTarget.id}
                    queueNumber={cancelTarget.queueNumber}
                    onClose={() => setCancelTarget(null)}
                    onConfirm={handleCancelConfirm}
                    isPending={updateStatus.isPending}
                />
            )}
            {adjustTarget && (
                <AdjustTimeModal
                    orderId={adjustTarget.id}
                    queueNumber={adjustTarget.queueNumber}
                    onClose={() => setAdjustTarget(null)}
                    onConfirm={handleAdjustConfirm}
                    isPending={adjustTime.isPending}
                />
            )}

            {/* Header */}
            <div className="mb-6 bg-gradient-to-r from-gray-900 to-gray-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <IoFastFoodOutline className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">KDS</h1>
                            <p className="text-gray-300 text-sm">
                                ร้าน <span className="font-semibold text-white">{myStore.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                        {isConnected ? (
                            <>
                                <FiWifi className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-sm font-semibold">เชื่อมต่อแล้ว</span>
                            </>
                        ) : (
                            <>
                                <FiWifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                                <span className="text-red-400 text-sm font-semibold">ไม่ได้เชื่อมต่อ</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">{pendingOrders.length}</p>
                        <p className="text-xs text-gray-300">รอคิว</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-orange-300">{cookingOrders.length}</p>
                        <p className="text-xs text-gray-300">กำลังทำ</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-300">{readyOrders.length}</p>
                        <p className="text-xs text-gray-300">พร้อมรับ</p>
                    </div>
                </div>
            </div>

            {/* KDS Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                <KdsColumn
                    title="รอคิว"
                    icon={<FiClock className="w-6 h-6" />}
                    orders={pendingOrders}
                    headerColor="bg-gradient-to-r from-yellow-500 to-orange-400"
                    cardBorder="border-yellow-300"
                    timerKey="createdAt"
                    warnAfterMin={15}
                    emptyText="ไม่มีออเดอร์รอคิว"
                    showSkip={true}
                    onCancel={setCancelTarget}
                    onSkip={handleSkip}
                />
                <KdsColumn
                    title="กำลังทำอาหาร"
                    icon={<MdRestaurant className="w-6 h-6" />}
                    orders={cookingOrders}
                    headerColor="bg-gradient-to-r from-orange-500 to-red-500"
                    cardBorder="border-orange-400"
                    timerKey="startCookingAt"
                    warnAfterMin={10}
                    emptyText="ยังไม่มีออเดอร์ที่กำลังทำ"
                    showAdjustTime={true}
                    onCancel={setCancelTarget}
                    onAdjustTime={setAdjustTarget}
                />
                <KdsColumn
                    title="พร้อมรับ"
                    icon={<FiPackage className="w-6 h-6" />}
                    orders={readyOrders}
                    headerColor="bg-gradient-to-r from-green-500 to-emerald-500"
                    cardBorder="border-green-400"
                    timerKey="startCookingAt"
                    warnAfterMin={999}
                    emptyText="ยังไม่มีออเดอร์พร้อมรับ"
                    onCancel={setCancelTarget}
                />
            </div>
        </div>
    );
}
