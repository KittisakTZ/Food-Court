// @/features/home/components/DraggableOrderCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Order } from "@/types/response/order.response";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import { FaGripVertical, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useMoveOrderPosition } from "@/hooks/useOrders";
import { useState, useEffect } from "react";
import {
  FiCheck,
  FiX,
  FiPackage,
  FiClock,
  FiUser,
  FiAlertTriangle,
  FiEye,
  FiChevronRight,
  FiDollarSign,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { ConfirmationDialog } from "@/components/customs/ConfirmationDialog";
import { NO_FOOD_IMAGE, onImgError } from "@/utils/imageUtils";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG: Record<
  Order["status"],
  { label: string; bar: string; badge: string; text: string }
> = {
  PENDING: {
    label: "Pending",
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-800",
    text: "text-amber-700",
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    bar: "bg-blue-400",
    badge: "bg-blue-100 text-blue-800",
    text: "text-blue-700",
  },
  AWAITING_CONFIRMATION: {
    label: "Awaiting Slip Confirmation",
    bar: "bg-purple-400",
    badge: "bg-purple-100 text-purple-800",
    text: "text-purple-700",
  },
  COOKING: {
    label: "Cooking",
    bar: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800",
    text: "text-orange-700",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup!",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800",
    text: "text-emerald-700",
  },
  COMPLETED: {
    label: "Completed",
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600",
    text: "text-slate-600",
  },
  CANCELLED: {
    label: "Cancelled",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-800",
    text: "text-red-700",
  },
  REJECTED: {
    label: "Rejected",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-800",
    text: "text-red-700",
  },
};

// ── Mini countdown for seller card ───────────────────────────────────────────
const SellerCountdown = ({
  estimatedReadyAt,
}: {
  estimatedReadyAt: string;
}) => {
  const [rem, setRem] = useState(0);
  useEffect(() => {
    const tick = () =>
      setRem(
        Math.max(
          0,
          Math.floor(
            (new Date(estimatedReadyAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [estimatedReadyAt]);
  const m = Math.floor(rem / 60),
    s = rem % 60;
  const done = rem === 0;
  const soon = !done && rem <= 120;
  return (
    <span
      className={`font-mono font-bold text-sm tabular-nums ${done ? "text-emerald-600" : soon ? "text-amber-500 animate-pulse" : "text-orange-600"}`}
    >
      {done
        ? "Soon"
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`}
    </span>
  );
};

// ── CancelOrderModal ──────────────────────────────────────────────────────────
const CancelOrderModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const presetReasons = [
    "Insufficient ingredients",
    "Out of stock",
    "Store closed",
    "Menu temporarily suspended",
    "Unable to accept order",
  ];
  const action = order.status === "PENDING" ? "REJECT" : "CANCEL_BY_STORE";
  const finalReason =
    selectedReason === "__custom__" ? customReason.trim() : selectedReason;

  const handleConfirm = () => {
    if (!finalReason) return;
    updateStatus(
      { orderId: order.id, action, cancelReason: finalReason },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 p-5 rounded-t-2xl text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Cancel Order #{order.queueNumber}
              </h3>
              <p className="text-red-100 text-sm">
                Customer: {order.buyer?.username} · Customer will be notified
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            Select a reason for cancellation:
          </p>
          <div className="space-y-2">
            {presetReasons.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedReason === reason ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-red-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  {reason}
                </span>
              </label>
            ))}
            <label
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedReason === "__custom__" ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              <input
                type="radio"
                name="cancelReason"
                value="__custom__"
                checked={selectedReason === "__custom__"}
                onChange={() => setSelectedReason("__custom__")}
                className="accent-red-500"
              />
              <span className="text-sm font-medium text-slate-800">
                Other (Specify)
              </span>
            </label>
            {selectedReason === "__custom__" && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify reason..."
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-xl text-sm focus:outline-none focus:border-red-400"
                autoFocus
              />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending || !finalReason}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <FiX className="w-4 h-4" />
              )}
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── OrderDetailModal ──────────────────────────────────────────────────────────
const OrderDetailModal = ({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-t-2xl text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <FiEye className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">Order Details</h3>
            <p className="text-orange-100 text-sm">
              Queue #{order.queueNumber} · {order.buyer?.username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/80 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 p-5 space-y-4">
        {order.hasIssue && order.issueReason && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 text-sm">Order Has Issue</p>
              <p className="text-red-700 text-sm mt-0.5">{order.issueReason}</p>
            </div>
          </div>
        )}
        <div>
          <h4 className="font-bold text-slate-700 mb-3 text-sm">
            Order Items ({order.orderItems.length} items)
          </h4>
          <div className="space-y-2">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
              >
                <img
                  src={item.menu.image || NO_FOOD_IMAGE}
                  alt={item.menu.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={onImgError(NO_FOOD_IMAGE)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {item.menu.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    ฿{item.menu.price.toFixed(0)} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  ฿{item.subtotal.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </div>
        {order.description && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 text-sm mb-1">
              Note from customer
            </p>
            <p className="text-sm text-slate-700 italic">
              "{order.description}"
            </p>
          </div>
        )}
        <div className="bg-orange-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total amount</p>
            <p className="text-xs text-slate-400">
              {order.paymentMethod === "PROMPTPAY" ? "PromptPay" : "Cash"}
            </p>
          </div>
          <p className="text-2xl font-black text-orange-600">
            ฿{order.totalAmount.toFixed(0)}
          </p>
        </div>
        {order.paymentSlip && (
          <div>
            <p className="font-semibold text-slate-700 text-sm mb-2">
              Payment Slip
            </p>
            <img
              src={order.paymentSlip}
              alt="Payment Slip"
              className="w-full rounded-xl border border-slate-200 cursor-pointer"
              onClick={() => window.open(order.paymentSlip!, "_blank")}
            />
          </div>
        )}
      </div>
      <div className="p-5 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── OrderActions ──────────────────────────────────────────────────────────────
const OrderActions = ({ order }: { order: Order }) => {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, title: "", description: "", onConfirm: null });

  const openDialog = (
    action:
      | "APPROVE"
      | "CONFIRM_PAYMENT"
      | "PREPARE_COMPLETE"
      | "CUSTOMER_PICKED_UP"
      | "CONFIRM_CASH_PAYMENT",
  ) => {
    const msgs: Record<typeof action, string> = {
      APPROVE: "Approve this order and begin processing",
      CONFIRM_PAYMENT: "Confirm payment received and begin cooking",
      PREPARE_COMPLETE: "Confirm food is ready for pickup",
      CUSTOMER_PICKED_UP: "Confirm customer has picked up the food",
      CONFIRM_CASH_PAYMENT: "Confirm cash payment received and begin cooking",
    };
    setDialogState({
      isOpen: true,
      title: "Confirm Action",
      description: msgs[action],
      onConfirm: () => updateStatus({ orderId: order.id, action }),
    });
  };

  const closeDialog = () =>
    setDialogState({
      isOpen: false,
      title: "",
      description: "",
      onConfirm: null,
    });

  return (
    <>
      {showCancelModal && (
        <CancelOrderModal
          order={order}
          onClose={() => setShowCancelModal(false)}
        />
      )}
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm!}
        title={dialogState.title}
        description={dialogState.description}
      />

      <div className="space-y-2">
        {order.status === "PENDING" && (
          <>
            {/* Primary: Approve */}
            <button
              onClick={() => openDialog("APPROVE")}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-5 h-5" />
              )}
              Approve Order
            </button>
            {/* Cancel with issue reason */}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={isPending}
              className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiX className="w-4 h-4" />
              Reject Order
            </button>
          </>
        )}

        {order.status === "AWAITING_PAYMENT" &&
          (order.paymentMethod === "CASH_ON_PICKUP" ? (
            <button
              onClick={() => openDialog("CONFIRM_CASH_PAYMENT")}
              disabled={isPending}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiDollarSign className="w-5 h-5" />
              )}
              Confirm Cash
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiDollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800">
                  Awaiting Payment
                </p>
                <p className="text-xs text-blue-500">
                  Customer is making payment
                </p>
              </div>
            </div>
          ))}

        {order.status === "AWAITING_CONFIRMATION" && (
          <button
            onClick={() => openDialog("CONFIRM_PAYMENT")}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-[0.98] text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiCheck className="w-5 h-5" />
            )}
            Confirm Payment
          </button>
        )}

        {order.status === "COOKING" && (
          <button
            onClick={() => openDialog("PREPARE_COMPLETE")}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiPackage className="w-5 h-5" />
            )}
            Food is Ready
          </button>
        )}

        {order.status === "READY_FOR_PICKUP" && (
          <button
            onClick={() => openDialog("CUSTOMER_PICKED_UP")}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiCheck className="w-5 h-5" />
            )}
            Customer Picked Up
          </button>
        )}
      </div>
    </>
  );
};

// ── DraggableOrderCard (main) ─────────────────────────────────────────────────
export const DraggableOrderCard = ({
  order,
  queueDisplayNumber,
  isFirst,
  isLast,
  highlightMenuId,
}: {
  order: Order;
  queueDisplayNumber: number;
  isFirst: boolean;
  isLast: boolean;
  highlightMenuId?: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });
  const { mutate: moveOrder, isPending: isMoving } = useMoveOrderPosition();
  const [jumpPosition, setJumpPosition] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : ("auto" as any),
  };

  const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.PENDING;
  const totalItems = order.orderItems.reduce((s, i) => s + i.quantity, 0);
  const totalCookingMin = order.orderItems.reduce(
    (s, i) => s + i.quantity * (i.menu.cookingTime ?? 5),
    0,
  );
  const showCountdown =
    ["COOKING", "AWAITING_PAYMENT", "AWAITING_CONFIRMATION"].includes(
      order.status,
    ) && !!order.estimatedReadyAt;

  const handleMove = (pos: number) => {
    if (pos !== order.position)
      moveOrder({ orderId: order.id, newPosition: pos });
  };
  const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const p = parseInt(jumpPosition);
      if (!isNaN(p) && p > 0) {
        handleMove(p);
        setJumpPosition("");
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      {showDetailModal && (
        <OrderDetailModal
          order={order}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      <div
        className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden
                ${isDragging ? "shadow-xl ring-2 ring-orange-300" : "hover:shadow-md"}
                ${order.hasIssue ? "border-red-300" : "border-slate-200"}`}
      >
        {/* ── Status bar ─────────────────────────────────── */}
        <div className={`h-1 ${cfg.bar}`} />

        {/* ── Header ─────────────────────────────────────── */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-400 mt-1 hidden sm:block flex-shrink-0"
            >
              <FaGripVertical className="w-4 h-4" />
            </div>

            {/* Queue number */}
            <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-black text-xl leading-none">
                {queueDisplayNumber}
              </span>
            </div>

            {/* Customer info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <FiUser className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="font-bold text-slate-800 truncate">
                  {order.buyer?.username ?? "Customer"}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}
                >
                  {cfg.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${order.paymentMethod === "PROMPTPAY" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"}`}
                >
                  {order.paymentMethod === "PROMPTPAY"
                    ? "💳 PromptPay"
                    : "💵 Cash"}
                </span>
              </div>
            </div>

            {/* Right: countdown + detail button */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowDetailModal(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                title="View Details"
              >
                <FiEye className="w-4 h-4" />
              </button>
              {showCountdown && order.estimatedReadyAt && (
                <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                  <FiClock className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <SellerCountdown estimatedReadyAt={order.estimatedReadyAt} />
                </div>
              )}
            </div>
          </div>

          {/* Scheduled pickup */}
          {order.scheduledPickup && (
            <div className="mt-2.5 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <FiClock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-700">
                Pickup Time:{" "}
                {new Date(order.scheduledPickup).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          )}
        </div>

        {/* ── Issue banner ────────────────────────────────── */}
        {order.hasIssue && order.issueReason && (
          <div className="mx-4 mb-3 flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
            <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                Order Issue
              </p>
              <p className="text-sm text-red-600">{order.issueReason}</p>
            </div>
          </div>
        )}

        {/* ── Payment slip for AWAITING_CONFIRMATION ─────── */}
        {order.status === "AWAITING_CONFIRMATION" &&
          order.paymentSlip &&
          (() => {
            const slipUrl = order.paymentSlip!.replace(/([^:])\/\/+/g, "$1/");
            return (
              <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-purple-200 bg-purple-50">
                <div className="px-4 py-2.5 bg-purple-100 border-b border-purple-200">
                  <p className="font-bold text-purple-800 text-sm">
                    Payment Slip — Please Verify
                  </p>
                </div>
                <div
                  className="p-3 relative group cursor-pointer"
                  onClick={() => window.open(slipUrl, "_blank")}
                >
                  <img
                    src={slipUrl}
                    alt="Payment Slip"
                    className="w-full rounded-lg border border-purple-200 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      (
                        e.currentTarget.nextElementSibling as HTMLElement
                      )?.style.removeProperty("display");
                    }}
                  />
                  <div className="hidden p-6 bg-red-50 rounded-lg border border-red-200 items-center justify-center text-red-500 text-sm font-medium">
                    Failed to load slip
                  </div>
                  <div className="absolute inset-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      🔍 Click to view full size
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* ── Order items ─────────────────────────────────── */}
        <div className="px-4 pb-3">
          <div className="divide-y divide-slate-100">
            {order.orderItems.map((item) => {
              const isHl = highlightMenuId === item.menuId;
              const itemCookMin = item.quantity * (item.menu.cookingTime ?? 5);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 transition-all rounded-lg ${isHl ? "bg-amber-50 px-2 -mx-2" : ""}`}
                >
                  <img
                    src={item.menu.image || NO_FOOD_IMAGE}
                    alt={item.menu.name}
                    className={`w-12 h-12 rounded-xl object-cover flex-shrink-0 ${isHl ? "ring-2 ring-amber-400" : ""}`}
                    onError={onImgError(NO_FOOD_IMAGE)}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold truncate text-sm ${isHl ? "text-amber-800" : "text-slate-800"}`}
                    >
                      {item.menu.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />≈ {itemCookMin} mins
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-black text-lg ${isHl ? "text-amber-700" : "text-slate-700"}`}
                    >
                      ×{item.quantity}
                    </p>
                    <p className="text-xs font-semibold text-orange-500">
                      ฿{item.subtotal.toFixed(0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Note ────────────────────────────────────────── */}
        {order.description && (
          <div className="mx-4 mb-3 px-3 py-2.5 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
            <p className="text-xs font-bold text-amber-700 mb-0.5">Note</p>
            <p className="text-sm text-slate-700 italic">
              "{order.description}"
            </p>
          </div>
        )}

        {/* ── Total ───────────────────────────────────────── */}
        <div className="mx-4 mb-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div>
            <p className="text-xs text-slate-400">
              {totalItems} items · Prep time ~{totalCookingMin} mins
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              ฿{order.totalAmount.toFixed(0)}
            </p>
          </div>
          {order.estimatedReadyAt && (
            <div className="text-right">
              <p className="text-xs text-slate-400">Countdown</p>
              <SellerCountdown estimatedReadyAt={order.estimatedReadyAt} />
            </div>
          )}
        </div>

        {/* ── Action buttons ──────────────────────────────── */}
        <div className="px-4 pb-4">
          <OrderActions order={order} />
        </div>

        {/* ── Queue management ────────────────────────────── */}
        <div className="px-4 pb-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleMove(order.position - 1)}
              disabled={isFirst || isMoving}
              className="w-8 h-8 bg-slate-100 hover:bg-orange-100 hover:text-orange-600 border border-slate-200 hover:border-orange-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              title="Move Up"
            >
              <FaArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMove(order.position + 1)}
              disabled={isLast || isMoving}
              className="w-8 h-8 bg-slate-100 hover:bg-orange-100 hover:text-orange-600 border border-slate-200 hover:border-orange-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              title="Move Down"
            >
              <FaArrowDown className="w-3 h-3" />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">
                Go to Q
              </span>
              <input
                type="number"
                value={jumpPosition}
                onChange={(e) => setJumpPosition(e.target.value)}
                onKeyDown={handleJump}
                onBlur={() => setJumpPosition("")}
                disabled={isMoving}
                placeholder={`${order.position}`}
                className="w-14 text-center px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none font-bold text-xs"
                min="1"
              />
              <FiChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
