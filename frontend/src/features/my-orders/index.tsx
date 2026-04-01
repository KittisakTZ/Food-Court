// @/features/my-orders/index.tsx

import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload,
  FiChevronRight, FiChevronLeft, FiCalendar, FiShoppingBag, FiRefreshCw,
  FiAlertTriangle, FiMapPin,
} from "react-icons/fi";
import { MdRestaurant, MdPayment } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useMyOrders, useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";
import { useAddItemToCart } from "@/hooks/useCart";

// ── Countdown ──────────────────────────────────────────────────────────────────
const CountdownBadge = ({ estimatedReadyAt }: { estimatedReadyAt: string }) => {
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

  if (isDone) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
          <FiClock className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-700">เวลารับอาหาร</p>
          <p className="text-sm font-bold text-green-800 animate-pulse">ใกล้พร้อมแล้ว!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isAlmostReady ? "bg-amber-50 border border-amber-200" : "bg-orange-50 border border-orange-200"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isAlmostReady ? "bg-amber-500" : "bg-orange-500"}`}>
        <FiClock className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${isAlmostReady ? "text-amber-700" : "text-orange-700"}`}>รับอาหารประมาณ {readyTime} น.</p>
        <p className={`text-xs text-slate-500`}>เวลาที่เหลือ</p>
      </div>
      <p className={`text-2xl font-black font-mono tabular-nums flex-shrink-0 ${isAlmostReady ? "text-amber-600 animate-pulse" : "text-orange-600"}`}>
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
    </div>
  );
};

// ── Status config ──────────────────────────────────────────────────────────────
const getStatusConfig = (status: Order["status"]) => {
  const configs: Record<Order["status"], { color: string; bgColor: string; dotColor: string; icon: JSX.Element; text: string; description: string }> = {
    PENDING: { color: "text-amber-800", bgColor: "bg-amber-100", dotColor: "bg-amber-500", icon: <FiClock className="w-4 h-4" />, text: "รอดำเนินการ", description: "ร้านค้ากำลังตรวจสอบ" },
    AWAITING_PAYMENT: { color: "text-blue-800", bgColor: "bg-blue-100", dotColor: "bg-blue-500", icon: <FiDollarSign className="w-4 h-4" />, text: "รอชำระเงิน", description: "กรุณาชำระเงิน" },
    AWAITING_CONFIRMATION: { color: "text-purple-800", bgColor: "bg-purple-100", dotColor: "bg-purple-500", icon: <MdPayment className="w-4 h-4" />, text: "รอตรวจสอบสลิป", description: "กำลังตรวจสอบ" },
    COOKING: { color: "text-orange-800", bgColor: "bg-orange-100", dotColor: "bg-orange-500", icon: <MdRestaurant className="w-4 h-4" />, text: "กำลังเตรียมอาหาร", description: "กำลังปรุงอาหาร" },
    READY_FOR_PICKUP: { color: "text-emerald-800", bgColor: "bg-emerald-100", dotColor: "bg-emerald-500", icon: <FiPackage className="w-4 h-4" />, text: "อาหารพร้อมแล้ว!", description: "มารับได้เลย" },
    COMPLETED: { color: "text-slate-700", bgColor: "bg-slate-100", dotColor: "bg-slate-400", icon: <FiCheckCircle className="w-4 h-4" />, text: "เสร็จสิ้น", description: "ขอบคุณที่ใช้บริการ" },
    CANCELLED: { color: "text-red-800", bgColor: "bg-red-100", dotColor: "bg-red-500", icon: <FiXCircle className="w-4 h-4" />, text: "ยกเลิกแล้ว", description: "คำสั่งซื้อถูกยกเลิก" },
    REJECTED: { color: "text-red-800", bgColor: "bg-red-100", dotColor: "bg-red-500", icon: <FiXCircle className="w-4 h-4" />, text: "ถูกปฏิเสธ", description: "ร้านค้าปฏิเสธ" },
  };
  return configs[status] ?? configs["PENDING"];
};

// ── Payment Modal ──────────────────────────────────────────────────────────────
const PaymentModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadSlip, isPending: isUploading } = useUploadSlip();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!order) return null;

  const normalizeUrl = (url: string | null) => url ? url.replace(/([^:])\/\/+/g, "$1/") : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toastService.error("ไฟล์ใหญ่เกินไป! สูงสุด 5MB"); return; }
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadSlip({ orderId: order.id, slipFile: selectedFile }, {
      onSuccess: () => { if (previewUrl) URL.revokeObjectURL(previewUrl); onClose(); },
    });
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white relative flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/20 rounded-xl transition-colors">
            <FiXCircle className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">ชำระเงิน</h2>
              <p className="text-blue-100 text-sm">#{order.id.substring(0, 8)}... · {order.store.name}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          <div className="text-center py-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
            <p className="text-slate-500 text-sm mb-1">ยอดชำระทั้งหมด</p>
            <p className="text-5xl font-black text-blue-600">฿{order.totalAmount.toFixed(2)}</p>
          </div>

          <div className="flex justify-center">
            {normalizeUrl(order.paymentQrCode) ? (
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
                <img src={normalizeUrl(order.paymentQrCode)!} alt="QR Code" className="w-56 h-56 rounded-xl" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-red-50 rounded-2xl flex items-center justify-center border-2 border-red-200">
                <p className="text-red-600 font-semibold text-sm text-center px-4">ไม่สามารถโหลด QR Code</p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 space-y-1">
            <p className="font-bold mb-2">วิธีชำระเงิน</p>
            <p>1. สแกน QR Code ด้วยแอปธนาคาร</p>
            <p>2. ชำระเงินตามยอดที่แสดง</p>
            <p>3. แนบสลิปการโอนเงินด้านล่าง</p>
            {order.paymentExpiresAt && (
              <p className="text-amber-700 font-semibold mt-2">
                QR หมดอายุ {new Date(order.paymentExpiresAt).toLocaleTimeString("th-TH")}
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-slate-700">ภาพตัวอย่างสลิป</p>
                <button onClick={handleCancelPreview} className="text-red-500 text-sm font-semibold hover:text-red-600">ยกเลิก</button>
              </div>
              <img src={previewUrl} alt="Preview" className="w-full rounded-xl max-h-72 object-contain bg-white" />
            </div>
          )}

          {order.paymentSlip && !previewUrl && (
            <button onClick={() => window.open(normalizeUrl(order.paymentSlip)!, "_blank")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
              <FiCheckCircle className="w-5 h-5" /> ดูสลิปที่อัปโหลดแล้ว
            </button>
          )}

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/jpg,image/jfif" className="hidden" disabled={isUploading} />

          {previewUrl ? (
            <button onClick={handleUpload} disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isUploading ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> กำลังอัปโหลด...</> : <><FiCheckCircle className="w-5 h-5" /> ยืนยันการอัปโหลด</>}
            </button>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !!order.paymentSlip}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {order.paymentSlip ? <><FiCheckCircle className="w-5 h-5" /> อัปโหลดเรียบร้อยแล้ว</> : <><FiUpload className="w-5 h-5" /> แนบสลิปการโอนเงิน</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Order Card ─────────────────────────────────────────────────────────────────
const OrderCard = ({ order, onPayClick }: { order: Order; onPayClick: (order: Order) => void }) => {
  const statusConfig = getStatusConfig(order.status);
  const isPaid = !!order.paidAt;
  const { mutate: addToCart, isPending: isAddingToCart } = useAddItemToCart();
  const isActive = !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status);
  const showCountdown = ["COOKING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION"].includes(order.status) && !!order.estimatedReadyAt;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) + " น.";

  const handleReorder = async () => {
    try {
      let ok = 0;
      for (const item of order.orderItems) {
        await new Promise<void>((res, rej) =>
          addToCart({ menuId: item.menuId, quantity: item.quantity }, { onSuccess: () => { ok++; res(); }, onError: rej })
        );
      }
      if (ok === order.orderItems.length) toastService.success(`เพิ่ม ${ok} รายการลงตะกร้าแล้ว`);
      else if (ok > 0) toastService.warning(`เพิ่มได้ ${ok}/${order.orderItems.length} รายการ`);
    } catch {
      toastService.error("ไม่สามารถสั่งซ้ำได้ กรุณาลองใหม่");
    }
  };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300
      ${order.hasIssue ? "border-2 border-red-300 shadow-red-100 shadow-lg" : isActive ? "border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-0.5" : "border border-slate-200 shadow-sm hover:shadow-md"}`}>

      {/* ── Header: Store banner + Status ── */}
      <div className="relative">
        {/* Store image banner */}
        <div className="h-36 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 relative">
          {order.store.image ? (
            <img src={order.store.image} alt={order.store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MdRestaurant className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Store name on banner */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-black text-white text-xl leading-tight drop-shadow">{order.store.name}</h3>
            {order.store.location && (
              <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                <FiMapPin className="w-3.5 h-3.5" />
                <span>{order.store.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status badge — floating */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold shadow-lg ${statusConfig.bgColor} ${statusConfig.color}`}>
          <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${isActive ? "animate-pulse" : ""}`} />
          {statusConfig.text}
        </div>
      </div>

      {/* ── Issue Banner ── */}
      {order.hasIssue && order.issueReason && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700 uppercase tracking-wide">ร้านค้าแจ้งปัญหา</p>
            <p className="text-base text-red-700 mt-0.5">{order.issueReason}</p>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="p-5 flex-1 flex flex-col gap-4">

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <span className="font-mono text-xs">#{order.id.substring(0, 10)}</span>
        </div>

        {/* Countdown */}
        {showCountdown && <CountdownBadge estimatedReadyAt={order.estimatedReadyAt!} />}

        {/* READY_FOR_PICKUP banner */}
        {order.status === "READY_FOR_PICKUP" && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">อาหารพร้อมรับแล้ว!</p>
              <p className="text-xs text-emerald-600">กรุณามารับที่ร้าน</p>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 text-slate-500 text-sm font-bold">
            <FiShoppingBag className="w-4 h-4" />
            <span>รายการอาหาร ({order.orderItems.length})</span>
          </div>
          <div className="space-y-2.5">
            {order.orderItems.slice(0, 3).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-base text-slate-700 truncate flex-1 pr-2">
                  {item.menu.name} <span className="text-slate-400 text-sm">×{item.quantity}</span>
                </span>
                <span className="text-base font-bold text-slate-800 flex-shrink-0">฿{item.subtotal.toFixed(0)}</span>
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <p className="text-sm text-slate-400 pt-1">+ อีก {order.orderItems.length - 3} รายการ</p>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Total + Payment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
            <span className={`text-sm font-semibold ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
              {isPaid ? "ชำระแล้ว" : "ยังไม่ชำระ"} · {order.paymentMethod === "PROMPTPAY" ? "PromptPay" : "เงินสด"}
            </span>
          </div>
          <span className="text-3xl font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2.5">
          {order.status === "AWAITING_PAYMENT" ? (
            <button onClick={() => onPayClick(order)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base">
              <FiDollarSign className="w-5 h-5" /> ชำระเงินทันที
            </button>
          ) : (
            <Link to={`/my-orders/${order.id}`} className="block">
              <button className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base">
                ดูรายละเอียด <FiChevronRight className="w-5 h-5" />
              </button>
            </Link>
          )}

          {["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status) && (
            <button onClick={handleReorder} disabled={isAddingToCart}
              className="w-full border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {isAddingToCart
                ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent" /> กำลังเพิ่มลงตะกร้า...</>
                : <><FiRefreshCw className="w-5 h-5" /> สั่งซ้ำ</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse">
    <div className="h-28 bg-slate-200" />
    <div className="p-5 space-y-4">
      <div className="h-3 bg-slate-200 rounded-full w-2/3" />
      <div className="h-16 bg-slate-100 rounded-2xl" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
      <div className="flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded-full w-1/3" />
        <div className="h-7 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="h-12 bg-slate-200 rounded-2xl" />
    </div>
  </div>
);

// ── Main Feature Component ─────────────────────────────────────────────────────
const MyOrdersFeature = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data: ordersData, isLoading, isError } = useMyOrders({ page, pageSize });

  const { activeOrders, historyOrders } = useMemo(() => {
    if (!ordersData?.data) return { activeOrders: [], historyOrders: [] };
    const all = ordersData.data;
    return {
      activeOrders: all.filter(o => !["COMPLETED", "CANCELLED", "REJECTED"].includes(o.status)),
      historyOrders: all.filter(o => ["COMPLETED", "CANCELLED", "REJECTED"].includes(o.status)),
    };
  }, [ordersData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-pulse">
            <div className="h-9 bg-slate-200 rounded-xl w-56 mb-2" />
            <div className="h-5 bg-slate-200 rounded-xl w-80" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-red-200 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-500 text-sm">ไม่สามารถโหลดออเดอร์ได้ กรุณาลองใหม่</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">ออเดอร์ของฉัน</h1>
            <p className="text-slate-500 text-base">ติดตามสถานะและจัดการคำสั่งซื้อของคุณ</p>
          </div>

          {ordersData && ordersData.data.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white rounded-3xl border-2 border-dashed border-slate-200 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FiShoppingBag className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">ยังไม่มีออเดอร์</h2>
              <p className="text-slate-500 text-sm mb-6">เริ่มสั่งอาหารที่คุณชื่นชอบกันเถอะ!</p>
              <Link to="/">
                <button className="bg-slate-900 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-2xl transition-all inline-flex items-center gap-2">
                  <MdRestaurant className="w-5 h-5" /> เริ่มสั่งอาหาร
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-10">

              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      ออเดอร์ปัจจุบัน
                      <span className="text-sm font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                        {activeOrders.length} รายการ
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {activeOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {/* History Orders */}
              {historyOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-8 bg-slate-300 rounded-full" />
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      ประวัติการสั่งซื้อ
                      <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        {historyOrders.length} รายการ
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {historyOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {/* Pagination */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-4">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    <FiChevronLeft className="w-4 h-4" /> ก่อนหน้า
                  </button>
                  <div className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl">
                    {ordersData.currentPage} / {ordersData.totalPages}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, ordersData.totalPages))}
                    disabled={page === ordersData.totalPages}
                    className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    ถัดไป <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrdersFeature;
