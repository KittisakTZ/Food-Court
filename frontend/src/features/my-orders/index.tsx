// @/features/my-orders/index.tsx (ปรับปรุง UI ให้ใช้งานง่าย)

import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload,
  FiChevronRight, FiChevronLeft, FiCalendar, FiShoppingBag, FiRefreshCw, FiAlertTriangle} from "react-icons/fi";
import { MdRestaurant, MdPayment } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useMyOrders, useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";
import { useAddItemToCart } from "@/hooks/useCart";


/**
 * Helper function to get UI configuration based on order status.
 */
const getStatusConfig = (status: Order['status']) => {
  const configs: Record<Order['status'], {
    color: string;
    bgColor: string;
    icon: JSX.Element;
    text: string;
    description: string;
  }> = {
    'PENDING': {
      color: 'text-amber-800',
      bgColor: 'bg-amber-100',
      icon: <FiClock className="w-5 h-5" />,
      text: 'รอดำเนินการ',
      description: 'ร้านค้ากำลังตรวจสอบคำสั่งซื้อ'
    },
    'AWAITING_PAYMENT': {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      icon: <FiDollarSign className="w-5 h-5" />,
      text: 'รอชำระเงิน',
      description: 'กรุณาชำระเงินเพื่อยืนยันคำสั่งซื้อ'
    },
    'AWAITING_CONFIRMATION': {
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      icon: <MdPayment className="w-5 h-5" />,
      text: 'รอตรวจสอบการชำระเงิน',
      description: 'ร้านค้ากำลังตรวจสอบหลักฐานการชำระเงิน'
    },
    'COOKING': {
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
      icon: <MdRestaurant className="w-5 h-5" />,
      text: 'กำลังเตรียมอาหาร',
      description: 'ร้านค้ากำลังเตรียมอาหารของคุณ'
    },
    'READY_FOR_PICKUP': {
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-100',
      icon: <FiPackage className="w-5 h-5" />,
      text: 'อาหารพร้อมแล้ว',
      description: 'สามารถมารับอาหารได้แล้ว'
    },
    'COMPLETED': {
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-100',
      icon: <FiCheckCircle className="w-5 h-5" />,
      text: 'เสร็จสิ้น',
      description: 'ขอบคุณที่ใช้บริการ'
    },
    'CANCELLED': {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      icon: <FiXCircle className="w-5 h-5" />,
      text: 'ยกเลิกแล้ว',
      description: 'คำสั่งซื้อถูกยกเลิก'
    },
    'REJECTED': {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      icon: <FiXCircle className="w-5 h-5" />,
      text: 'ถูกปฏิเสธ',
      description: 'ร้านค้าปฏิเสธคำสั่งซื้อ'
    }
  };
  return configs[status] || configs['PENDING'];
};

/**
 * Modal component for handling payment and slip upload.
 */
const PaymentModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadSlip, isPending: isUploading } = useUploadSlip();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!order) return null;

  // normalize URL — ตัด double slash ที่อาจเกิดจาก APP_URL มี trailing slash
  const normalizeUrl = (url: string | null) =>
    url ? url.replace(/([^:])\/\/+/g, '$1/') : null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastService.error("ไฟล์ใหญ่เกินไป! ขนาดสูงสุด 5MB");
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadSlip({ orderId: order.id, slipFile: selectedFile }, {
        onSuccess: () => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          onClose();
        },
      });
    }
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleViewSlip = () => {
    const slip = normalizeUrl(order.paymentSlip);
    if (slip) {
      window.open(slip, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <FiXCircle className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">ชำระเงิน</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Order #{order.id.substring(0, 8)}...</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Store Info */}
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl">
            <img
              src={order.store.image}
              alt={order.store.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm sm:text-base">{order.store.name}</p>
              <p className="text-xs sm:text-sm text-slate-600">{order.orderItems.length} รายการ</p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
            <p className="text-slate-600 text-xs sm:text-sm mb-2">ยอดชำระทั้งหมด</p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-600">
              ฿{order.totalAmount.toFixed(2)}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            {normalizeUrl(order.paymentQrCode) ? (
              <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-slate-200">
                <img
                  src={normalizeUrl(order.paymentQrCode)!}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                <p className="text-red-600 font-semibold text-sm sm:text-base">ไม่สามารถโหลด QR Code</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base">!</span>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                  <strong>วิธีชำระเงิน:</strong><br />
                  1. สแกน QR Code ด้วยแอปธนาคาร<br />
                  2. ชำระเงินตามยอดที่แสดง<br />
                  3. แนบสลิปการโอนเงินด้านล่าง
                </p>
                {order.paymentExpiresAt && (
                  <p className="text-xs text-amber-700 mt-2 font-semibold">
                    ⏱ QR Code หมดอายุ {new Date(order.paymentExpiresAt).toLocaleTimeString('th-TH')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Preview Image */}
          {previewUrl && (
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-700 text-sm sm:text-base">ภาพตัวอย่างสลิป</p>
                <button
                  onClick={handleCancelPreview}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm sm:text-base px-3 py-1.5 -mr-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full rounded-lg border border-slate-200 max-h-64 sm:max-h-80 md:max-h-96 object-contain bg-white"
              />
            </div>
          )}

          {/* View Uploaded Slip Button */}
          {order.paymentSlip && !previewUrl && (
            <button
              onClick={handleViewSlip}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base min-h-[48px]"
            >
              <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ดูสลิปที่อัปโหลดแล้ว
            </button>
          )}

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/jfif"
            className="hidden"
            disabled={isUploading}
          />

          {previewUrl ? (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base min-h-[48px] active:scale-[0.98]"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ยืนยันการอัปโหลด
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleUploadClick}
              disabled={isUploading || !!order.paymentSlip}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base min-h-[48px] active:scale-[0.98]"
            >
              {order.paymentSlip ? (
                <>
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  อัปโหลดสลิปเรียบร้อยแล้ว
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                  แนบสลิปการโอนเงิน
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Order Card Component - Horizontal Layout
 */
const OrderCard = ({ order, onPayClick }: { order: Order; onPayClick: (order: Order) => void }) => {
  const statusConfig = getStatusConfig(order.status);
  const isPaid = !!order.paidAt;
  const { mutate: addToCart, isPending: isAddingToCart } = useAddItemToCart();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' น.';
  };

  const handleReorder = async () => {
    try {
      // เพิ่มรายการทั้งหมดจากออเดอร์ลงตะกร้า
      let successCount = 0;
      for (const item of order.orderItems) {
        await new Promise<void>((resolve, reject) => {
          addToCart(
            { menuId: item.menuId, quantity: item.quantity },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error) => {
                console.error('Error adding item to cart:', error);
                reject(error);
              }
            }
          );
        });
      }

      if (successCount === order.orderItems.length) {
        toastService.success(`เพิ่ม ${successCount} รายการลงตะกร้าเรียบร้อยแล้ว`);
      } else if (successCount > 0) {
        toastService.warning(`เพิ่มได้เพียง ${successCount} จาก ${order.orderItems.length} รายการ`);
      }
    } catch (error) {
      toastService.error('ไม่สามารถสั่งซ้ำได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className={`bg-white rounded-xl border hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col ${order.hasIssue ? 'border-red-400 shadow-red-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
      {/* Status Badge */}
      <div className={`${statusConfig.bgColor} ${statusConfig.color} px-4 py-2.5 flex items-center justify-between flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4">{statusConfig.icon}</div>
          <div>
            <p className="font-bold text-sm">{statusConfig.text}</p>
          </div>
        </div>
        {!isPaid && order.status === 'AWAITING_PAYMENT' && (
          <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold">รอชำระเงิน</span>
          </div>
        )}
      </div>

      {/* Issue Banner */}
      {order.hasIssue && order.issueReason && (
        <div className="bg-red-50 border-b-2 border-red-200 px-4 py-3 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wide">ร้านค้าแจ้งปัญหา</p>
            <p className="text-sm text-red-700 font-medium mt-0.5">{order.issueReason}</p>
          </div>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col">
        {/* Store Info */}
        <div className="flex items-start gap-3 mb-4 flex-shrink-0">
          <img
            src={order.store.image}
            alt={order.store.name}
            className="w-14 h-14 rounded-lg object-cover border border-slate-100 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 mb-0.5">{order.store.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FiCalendar className="w-3 h-3 flex-shrink-0" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Order #{order.id.substring(0, 10)}...</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold mb-2">
            <FiShoppingBag className="w-3.5 h-3.5" />
            <span>รายการอาหาร ({order.orderItems.length})</span>
          </div>
          <div className="space-y-1.5">
            {order.orderItems.slice(0, 2).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-slate-700 truncate flex-1">
                  {item.menu.name} <span className="text-slate-500">×{item.quantity}</span>
                </span>
                <span className="font-semibold text-slate-900 ml-2">฿{item.subtotal.toFixed(0)}</span>
              </div>
            ))}
            {order.orderItems.length > 2 && (
              <p className="text-xs text-slate-500">
                และอีก {order.orderItems.length - 2} รายการ
              </p>
            )}
          </div>
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Payment Info */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              <span className={`text-xs font-bold ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isPaid ? 'ชำระแล้ว' : 'ยังไม่ชำระ'}
              </span>
            </div>
            <span className="text-xs text-slate-600">{order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'เงินสด'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">ยอดรวมทั้งหมด</span>
            <span className="text-2xl font-black text-slate-900">฿{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Queue Position */}
        {/* {order.position > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg px-3 py-2 flex items-center justify-between mb-4 flex-shrink-0 shadow-md">
            <span className="text-xs font-semibold opacity-90">ลำดับคิวของร้าน</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs opacity-75">คิวที่</span>
              <span className="text-xl font-black">{order.position}</span>
            </div>
          </div>
        )} */}

        {/* Action Buttons */}
        {order.status === 'AWAITING_PAYMENT' ? (
          <button
            onClick={() => onPayClick(order)}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <FiDollarSign className="w-4 h-4" />
            ชำระเงินทันที
          </button>
        ) : (
          <div className="space-y-2">
            <Link to={`/my-orders/${order.id}`} className="block">
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                <span>ดูรายละเอียด</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </Link>

            {/* ปุ่มสั่งซ้ำ สำหรับออเดอร์ที่เสร็จสิ้นหรือถูกยกเลิก */}
            {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
              <button
                onClick={handleReorder}
                disabled={isAddingToCart}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    กำลังเพิ่มลงตะกร้า...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="w-4 h-4" />
                    สั่งซ้ำ
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main feature component
 */
const MyOrdersFeature = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: ordersData, isLoading, isError } = useMyOrders({ page, pageSize });

  const { activeOrders, historyOrders } = useMemo(() => {
    if (!ordersData?.data) {
      return { activeOrders: [], historyOrders: [] };
    }

    const allOrders = ordersData.data;
    const active = allOrders.filter(o => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    const history = allOrders.filter(o => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    return { activeOrders: active, historyOrders: history };
  }, [ordersData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-slate-200 rounded w-64 mb-2"></div>
            <div className="h-5 bg-slate-200 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                <div className="h-20 bg-slate-200"></div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-24 bg-slate-100 rounded-xl"></div>
                  <div className="h-16 bg-slate-100 rounded-xl"></div>
                  <div className="h-12 bg-slate-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white rounded-2xl shadow-xl border-2 border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">เกิดข้อผิดพลาด</h2>
          <p className="text-slate-600">ไม่สามารถโหลดข้อมูลออเดอร์ได้<br />กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">ออเดอร์ของฉัน</h1>
            <p className="text-slate-600 text-lg">ติดตามสถานะและจัดการคำสั่งซื้อของคุณ</p>
          </div>

          {ordersData && ordersData.data.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">ยังไม่มีออเดอร์</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                คุณยังไม่เคยสั่งอาหารเลย<br />เริ่มสั่งอาหารที่คุณชอบกันเถอะ!
              </p>
              <Link to="/">
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center gap-2">
                  <MdRestaurant className="w-5 h-5" />
                  เริ่มสั่งอาหาร
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      ออเดอร์ปัจจุบัน
                      <span className="ml-3 text-base font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {activeOrders.length} รายการ
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {/* History Orders */}
              {historyOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-slate-400 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      ประวัติการสั่งซื้อ
                      <span className="ml-3 text-base font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {historyOrders.length} รายการ
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {historyOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {/* Pagination */}
              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <FiChevronLeft className="w-4 h-4" /> ก่อนหน้า
                  </button>
                  <div className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-lg">
                    {ordersData.currentPage} / {ordersData.totalPages}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, ordersData.totalPages))}
                    disabled={page === ordersData.totalPages}
                    className="px-5 py-2.5 bg-white border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
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
