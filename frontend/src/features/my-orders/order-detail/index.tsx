import { Link, useParams, useLocation } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { Order } from "@/types/response/order.response";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import {
    FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign,
    FiChevronLeft, FiCreditCard, FiUser, FiStar, FiRefreshCw, FiMapPin,
} from "react-icons/fi";
import { MdRestaurant, MdStorefront } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { useAddItemToCart } from "@/hooks/useCart";
import { toastService } from "@/services/toast.service";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

// ── Countdown Timer ────────────────────────────────────────────────────────────
const CountdownTimer = ({ estimatedReadyAt }: { estimatedReadyAt: string }) => {
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
    const readyTime = new Date(estimatedReadyAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`rounded-2xl overflow-hidden shadow-sm ${isDone ? "bg-green-50 border border-green-200" : isAlmostReady ? "bg-amber-50 border border-amber-200" : "bg-orange-50 border border-orange-200"}`}>
            <div className={`px-5 py-3 flex items-center gap-2 ${isDone ? "bg-green-500" : isAlmostReady ? "bg-amber-500" : "bg-orange-500"}`}>
                <MdRestaurant className="w-4 h-4 text-white" />
                <p className="text-sm font-bold text-white">{isDone ? "ใกล้พร้อมแล้ว!" : "เวลาที่คาดว่าจะได้รับอาหาร"}</p>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
                <div>
                    <p className={`text-xs font-medium mb-1 ${isDone ? "text-green-600" : isAlmostReady ? "text-amber-600" : "text-orange-600"}`}>
                        {isDone ? "กำลังจะพร้อม..." : `พร้อมประมาณ ${readyTime} น.`}
                    </p>
                    {isDone ? (
                        <p className="text-2xl font-black text-green-700 animate-pulse">กำลังจะพร้อม...</p>
                    ) : (
                        <p className={`text-5xl font-black font-mono tabular-nums tracking-tight ${isAlmostReady ? "text-amber-700 animate-pulse" : "text-orange-600"}`}>
                            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
                        </p>
                    )}
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDone ? "bg-green-100" : isAlmostReady ? "bg-amber-100" : "bg-orange-100"}`}>
                    <FiClock className={`w-8 h-8 ${isDone ? "text-green-500" : isAlmostReady ? "text-amber-500" : "text-orange-500"}`} />
                </div>
            </div>
        </div>
    );
};

// ── Status Config ──────────────────────────────────────────────────────────────
const getStatusConfig = (status: Order["status"]) => {
    const configs: Record<Order["status"], { color: string; bg: string; dot: string; icon: JSX.Element; text: string }> = {
        PENDING:               { color: "text-amber-800",  bg: "bg-amber-100",  dot: "bg-amber-500",  icon: <FiClock className="w-4 h-4" />,      text: "รอดำเนินการ" },
        AWAITING_PAYMENT:      { color: "text-blue-800",   bg: "bg-blue-100",   dot: "bg-blue-500",   icon: <FiDollarSign className="w-4 h-4" />,  text: "รอชำระเงิน" },
        AWAITING_CONFIRMATION: { color: "text-purple-800", bg: "bg-purple-100", dot: "bg-purple-500", icon: <FiClock className="w-4 h-4" />,      text: "รอตรวจสอบสลิป" },
        COOKING:               { color: "text-orange-800", bg: "bg-orange-100", dot: "bg-orange-500", icon: <MdRestaurant className="w-4 h-4" />,  text: "กำลังเตรียมอาหาร" },
        READY_FOR_PICKUP:      { color: "text-emerald-800",bg: "bg-emerald-100",dot: "bg-emerald-500",icon: <FiPackage className="w-4 h-4" />,    text: "อาหารพร้อมแล้ว!" },
        COMPLETED:             { color: "text-slate-700",  bg: "bg-slate-100",  dot: "bg-slate-400",  icon: <FiCheckCircle className="w-4 h-4" />, text: "เสร็จสิ้น" },
        CANCELLED:             { color: "text-red-800",    bg: "bg-red-100",    dot: "bg-red-500",    icon: <FiXCircle className="w-4 h-4" />,     text: "ยกเลิกแล้ว" },
        REJECTED:              { color: "text-red-800",    bg: "bg-red-100",    dot: "bg-red-500",    icon: <FiXCircle className="w-4 h-4" />,     text: "ถูกปฏิเสธ" },
    };
    return configs[status] ?? configs["PENDING"];
};

const getOrderProgress = (status: Order["status"]) => {
    const steps: Record<Order["status"], number> = {
        PENDING: 0, AWAITING_PAYMENT: 16.6, AWAITING_CONFIRMATION: 33.3,
        COOKING: 50, READY_FOR_PICKUP: 83.3, COMPLETED: 100,
        REJECTED: 0, CANCELLED: 0,
    };
    return steps[status] ?? 0;
};

const progressSteps = ["ยืนยัน", "ชำระเงิน", "ทำอาหาร", "พร้อมรับ", "เสร็จสิ้น"];

const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("th-TH", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }) + " น.";
};

// ── Progress Bar ───────────────────────────────────────────────────────────────
const OrderProgressBar = ({ status }: { status: Order["status"] }) => {
    if (status === "CANCELLED" || status === "REJECTED") {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FiXCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                    <p className="font-bold text-red-700">ออร์เดอร์นี้ถูกยกเลิก / ปฏิเสธ</p>
                    <p className="text-sm text-red-500">ไม่สามารถดำเนินการต่อได้</p>
                </div>
            </div>
        );
    }
    return (
        <div className="px-6 pt-5 pb-6">
            <ProgressBar
                percent={getOrderProgress(status)}
                filledBackground="linear-gradient(to right, #f97316, #fbbf24)"
                height="6px"
            >
                {progressSteps.map((_step, i) => (
                    <Step key={i} transition="scale">
                        {({ accomplished }) => (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ring-2 ring-white ${accomplished ? "bg-orange-500 shadow-md" : "bg-slate-200"}`}>
                                {accomplished && <FiCheckCircle className="w-4 h-4 text-white" />}
                            </div>
                        )}
                    </Step>
                ))}
            </ProgressBar>
            <div className="flex justify-between mt-3 px-0.5">
                {progressSteps.map(step => (
                    <span key={step} className="w-1/5 text-center text-xs font-semibold text-slate-500">{step}</span>
                ))}
            </div>
        </div>
    );
};

// ── Timeline ───────────────────────────────────────────────────────────────────
const OrderTimeline = ({ order }: { order: Order }) => {
    const events = [
        { label: "สั่งอาหาร",     time: order.createdAt,    icon: <FiPackage className="w-4 h-4 text-slate-500" />,   dot: "bg-slate-400" },
        { label: "ร้านค้ายืนยัน", time: order.confirmedAt,  icon: <MdStorefront className="w-4 h-4 text-blue-500" />,  dot: "bg-blue-400" },
        { label: "ชำระเงินแล้ว",  time: order.paidAt,       icon: <FiCreditCard className="w-4 h-4 text-emerald-500" />,dot: "bg-emerald-400" },
        { label: "เริ่มทำอาหาร",  time: order.startCookingAt, icon: <MdRestaurant className="w-4 h-4 text-orange-500" />, dot: "bg-orange-400" },
        { label: "รับอาหารแล้ว",  time: order.completedAt,  icon: <FiUser className="w-4 h-4 text-purple-500" />,    dot: "bg-purple-400" },
    ].filter(e => e.time);

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">ไทม์ไลน์</h3>
            <div className="space-y-4">
                {events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 border border-slate-200`}>
                                {ev.icon}
                            </div>
                            {i < events.length - 1 && <div className="w-px h-4 bg-slate-200 mt-1" />}
                        </div>
                        <div className="pt-1">
                            <p className="text-sm font-semibold text-slate-700">{ev.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatDate(ev.time)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading, isError } = useOrder(orderId);
    const [isReviewing, setIsReviewing] = useState(false);
    const location = useLocation();
    const isSellerView = location.pathname.includes("/my-store/");
    const { mutate: addToCart, isPending: isAddingToCart } = useAddItemToCart();
    const queryClient = useQueryClient();
    const socketRef = useRef<ReturnType<typeof io> | null>(null);

    useEffect(() => {
        if (!orderId || isSellerView) return;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/v1", "") || "http://localhost:5080";
        socketRef.current = io(baseUrl, { withCredentials: true, transports: ["websocket", "polling"] });
        socketRef.current.on("connect", () => socketRef.current?.emit("join_order", orderId));
        socketRef.current.on("order:status_update", () =>
            queryClient.invalidateQueries({ queryKey: ["order", orderId] })
        );
        return () => { socketRef.current?.disconnect(); };
    }, [orderId, isSellerView, queryClient]);

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-3xl p-10 shadow-xl border border-red-100 max-w-sm w-full">
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiXCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <p className="font-bold text-slate-800 mb-1">ไม่พบคำสั่งซื้อ</p>
                    <p className="text-sm text-slate-400">กรุณาลองใหม่อีกครั้ง</p>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const isPaid = !!order.paidAt;
    const isActive = !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status);

    const handleReorder = async () => {
        try {
            let ok = 0;
            for (const item of order.orderItems) {
                await new Promise<void>((res, rej) =>
                    addToCart({ menuId: item.menuId, quantity: item.quantity }, {
                        onSuccess: () => { ok++; res(); },
                        onError: (e) => { console.error(e); rej(e); },
                    })
                );
            }
            if (ok === order.orderItems.length) toastService.success(`เพิ่ม ${ok} รายการลงตะกร้าแล้ว`);
            else if (ok > 0) toastService.warning(`เพิ่มได้ ${ok}/${order.orderItems.length} รายการ`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            toastService.error("ไม่สามารถสั่งซ้ำได้ กรุณาลองใหม่");
        }
    };

    const ReviewSection = () => {
        if (order.status !== "COMPLETED") return null;
        if (order.review) {
            return (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4">
                        {isSellerView ? "รีวิวจากลูกค้า" : "รีวิวของคุณ"}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`w-5 h-5 ${i < order.review!.rating ? "text-amber-400 fill-current" : "text-slate-200"}`} />
                        ))}
                        <span className="text-sm font-bold text-slate-600 ml-1">{order.review.rating}/5</span>
                    </div>
                    {order.review.comment && (
                        <p className="text-slate-600 bg-slate-50 rounded-xl p-4 text-sm italic">"{order.review.comment}"</p>
                    )}
                </div>
            );
        }
        if (isSellerView) {
            return (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl text-center text-sm font-semibold">
                    ลูกค้ายังไม่ได้รีวิวออร์เดอร์นี้
                </div>
            );
        }
        if (isReviewing) {
            return (
                <ReviewForm storeId={order.store.id} orderId={order.id} onCancel={() => setIsReviewing(false)} />
            );
        }
        return (
            <div className="text-center">
                <Button onClick={() => setIsReviewing(true)} size="lg" className="rounded-2xl px-8">
                    <FiStar className="mr-2 w-4 h-4" /> เขียนรีวิว
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">

                {/* ── Back + Status ── */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to={isSellerView ? "/my-store/orders" : "/my-orders"}
                        className="flex items-center gap-2 text-slate-500 hover:text-orange-600 font-semibold text-sm transition-colors"
                    >
                        <FiChevronLeft className="w-4 h-4" />
                        {isSellerView ? "กลับไปรายการออเดอร์" : "กลับไปออเดอร์ของฉัน"}
                    </Link>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot} ${isActive ? "animate-pulse" : ""}`} />
                        {statusConfig.text}
                    </div>
                </div>

                {/* ── Store Hero Banner ── */}
                <div className="relative rounded-2xl overflow-hidden mb-6 shadow-md">
                    <div className="h-36 md:h-44 bg-gradient-to-br from-slate-300 to-slate-400">
                        {order.store.image && (
                            <img src={order.store.image} alt={order.store.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                        <div>
                            <p className="text-white/70 text-xs font-medium mb-1">จากร้าน</p>
                            <h1 className="text-white text-2xl md:text-3xl font-black drop-shadow">{order.store.name}</h1>
                            {order.store.location && (
                                <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                                    <FiMapPin className="w-3 h-3" />
                                    <span>{order.store.location}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-white/70 text-xs">ยอดรวม</p>
                            <p className="text-white text-3xl font-black drop-shadow">฿{order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Order ID + Queue ── */}
                <div className="bg-white rounded-2xl px-5 py-4 mb-4 border border-slate-100 shadow-sm flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-xs text-slate-400 font-medium">หมายเลขออร์เดอร์</p>
                        <p className="font-mono font-bold text-slate-700 text-sm mt-0.5">#{order.id.substring(0, 16)}...</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400">คิววันนี้</p>
                        <p className="text-2xl font-black text-orange-500">Q{order.queueNumber}</p>
                    </div>
                </div>

                {/* ── Progress Bar ── */}
                <div className="bg-white rounded-2xl mb-4 border border-slate-100 shadow-sm">
                    <OrderProgressBar status={order.status} />
                </div>

                {/* ── Countdown Timer ── */}
                {["COOKING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION"].includes(order.status) && order.estimatedReadyAt && !isSellerView && (
                    <div className="mb-4">
                        <CountdownTimer estimatedReadyAt={order.estimatedReadyAt} />
                    </div>
                )}

                {/* ── Ready Banner ── */}
                {order.status === "READY_FOR_PICKUP" && !isSellerView && (
                    <div className="mb-4 bg-emerald-500 rounded-2xl p-5 flex items-center gap-4 shadow-md">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiPackage className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-white text-lg">อาหารพร้อมแล้ว!</p>
                            <p className="text-emerald-100 text-sm">กรุณามารับอาหารที่ร้านได้เลย</p>
                        </div>
                    </div>
                )}

                {/* ── Main Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Left: Order Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <MdRestaurant className="w-4 h-4 text-orange-500" />
                                รายการอาหาร
                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{order.orderItems.length} รายการ</span>
                            </h3>
                            <div className="space-y-3">
                                {order.orderItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                            {item.menu.image ? (
                                                <img src={item.menu.image} alt={item.menu.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <MdRestaurant className="w-7 h-7 text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">{item.menu.name}</p>
                                            <p className="text-sm text-slate-400 mt-0.5">฿{item.menu.price.toFixed(0)} × {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 text-base flex-shrink-0">฿{item.subtotal.toFixed(0)}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Total row */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm text-slate-500 font-medium">ยอดรวมทั้งหมด</span>
                                <span className="text-2xl font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Reorder */}
                        {!isSellerView && ["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status) && (
                            <button onClick={handleReorder} disabled={isAddingToCart}
                                className="w-full border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isAddingToCart
                                    ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent" />กำลังเพิ่มลงตะกร้า...</>
                                    : <><FiRefreshCw className="w-4 h-4" />สั่งซ้ำอีกครั้ง</>}
                            </button>
                        )}
                    </div>

                    {/* Right: Summary + Timeline */}
                    <div className="space-y-4">

                        {/* Summary card */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 mb-4">สรุปการชำระเงิน</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">สถานะ</span>
                                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${isPaid ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                                        {isPaid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">วิธีชำระ</span>
                                    <span className="text-sm font-semibold text-slate-700">
                                        {order.paymentMethod === "PROMPTPAY" ? "PromptPay" : "เงินสด"}
                                    </span>
                                </div>
                                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm text-slate-500">ยอดรวม</span>
                                    <span className="text-xl font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Slip */}
                            {order.paymentSlip && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                        <FiCreditCard className="w-3.5 h-3.5 text-emerald-500" /> สลิปการโอนเงิน
                                    </p>
                                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200"
                                        onClick={() => window.open(order.paymentSlip!, "_blank")}>
                                        <img src={order.paymentSlip} alt="Payment Slip" className="w-full" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white font-semibold text-sm">คลิกดูขนาดเต็ม</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <OrderTimeline order={order} />

                        {/* Review */}
                        <ReviewSection />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
