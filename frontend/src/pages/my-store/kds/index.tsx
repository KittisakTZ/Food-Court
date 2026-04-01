// @/pages/my-store/kds/index.tsx

import { useEffect, useState } from "react";
import { useMyStore } from "@/hooks/useStores";
import { useKDS, type KdsOrder } from "@/hooks/useKDS";
import { MdRestaurant } from "react-icons/md";
import { FiClock, FiPackage, FiWifi, FiWifiOff } from "react-icons/fi";
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

// ── Order Card ────────────────────────────────────────────────────────────────
const KdsCard = ({
    order,
    timerStart,
    colorClass,
    warnAfterMin,
}: {
    order: KdsOrder;
    timerStart: string | null;
    colorClass: string;
    warnAfterMin?: number;
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
}: {
    title: string;
    icon: React.ReactNode;
    orders: KdsOrder[];
    headerColor: string;
    cardBorder: string;
    timerKey: "createdAt" | "startCookingAt";
    warnAfterMin?: number;
    emptyText: string;
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
                    />
                ))
            )}
        </div>
    </div>
);

// ── Main KDS Page ─────────────────────────────────────────────────────────────
export default function KDSPage() {
    const { data: myStore, isLoading } = useMyStore();
    const { isConnected, pendingOrders, cookingOrders, readyOrders } = useKDS(
        myStore?.id
    );

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
                />
            </div>
        </div>
    );
}
