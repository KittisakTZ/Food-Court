// @/features/my-orders/index.tsx (หรือไฟล์ที่คุณต้องการ)

import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload,
  FiChevronRight, FiChevronLeft, FiCalendar, FiShoppingBag
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useMyOrders, useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";


/**
 * Helper function to get UI configuration based on order status.
 */
const getStatusConfig = (status: Order['status']) => {
  const configs: Record<Order['status'], { color: string; icon: JSX.Element; text: string; dotColor: string; }> = {
    'PENDING': {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <FiClock className="w-4 h-4" />,
      text: 'รอดำเนินการ',
      dotColor: 'bg-amber-500'
    },
    'AWAITING_PAYMENT': {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <FiDollarSign className="w-4 h-4" />,
      text: 'รอชำระเงิน',
      dotColor: 'bg-blue-500'
    },
    'AWAITING_CONFIRMATION': {
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <FiClock className="w-4 h-4" />,
      text: 'รอตรวจสอบ',
      dotColor: 'bg-purple-500'
    },
    'COOKING': {
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      icon: <MdRestaurant className="w-4 h-4" />,
      text: 'กำลังเตรียม',
      dotColor: 'bg-orange-500'
    },
    'READY_FOR_PICKUP': {
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <FiPackage className="w-4 h-4" />,
      text: 'พร้อมรับ',
      dotColor: 'bg-emerald-500'
    },
    'COMPLETED': {
      color: 'bg-slate-50 text-slate-600 border-slate-200',
      icon: <FiCheckCircle className="w-4 h-4" />,
      text: 'เสร็จสิ้น',
      dotColor: 'bg-slate-400'
    },
    'CANCELLED': {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <FiXCircle className="w-4 h-4" />,
      text: 'ยกเลิก',
      dotColor: 'bg-red-500'
    },
    'REJECTED': {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <FiXCircle className="w-4 h-4" />,
      text: 'ถูกปฏิเสธ',
      dotColor: 'bg-red-500'
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

  if (!order) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toastService.error("ไฟล์ใหญ่เกินไป! ขนาดสูงสุด 5MB");
        return;
      }

      uploadSlip({ orderId: order.id, slipFile: file }, {
        onSuccess: () => {
          onClose(); // Close modal on successful upload
        },
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <FiXCircle className="w-6 h-6" />
          </button>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FiDollarSign className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-1">ชำระเงิน</h2>
            <p className="text-blue-100 text-sm">Order #{order.id.substring(0, 8)}...</p>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <img
              src={order.store.image}
              alt={order.store.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div>
              <p className="font-semibold text-slate-800">{order.store.name}</p>
              <p className="text-sm text-slate-500">
                {order.orderItems.length} รายการ
              </p>
            </div>
          </div>
          <div className="text-center mb-6">
            <p className="text-slate-600 text-sm mb-2">ยอดชำระทั้งหมด</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ฿{order.totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-center mb-6">
            {order.paymentQrCode ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-slate-100">
                <img
                  src={order.paymentQrCode}
                  alt="QR Code"
                  className="w-56 h-56 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-56 h-56 bg-slate-100 rounded-2xl flex items-center justify-center">
                <p className="text-red-500 font-semibold">ไม่สามารถโหลด QR Code</p>
              </div>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 text-center">
              <strong>คำแนะนำ:</strong> สแกน QR Code เพื่อชำระเงิน<br />
              จากนั้นแนบสลิปเพื่อยืนยันการชำระเงิน
            </p>
            {order.paymentExpiresAt && (
              <p className="text-xs text-amber-700 text-center mt-2 font-medium">
                ⏱ QR Code หมดอายุ {new Date(order.paymentExpiresAt).toLocaleTimeString('th-TH')}
              </p>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            className="hidden"
            disabled={isUploading}
          />
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                กำลังอัปโหลด...
              </>
            ) : (
              <>
                <FiUpload className="w-5 h-5" />
                แนบสลิปเพื่อยืนยัน
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Card component to display a summary of a single order.
 */
const OrderCard = ({ order, onPayClick }: { order: Order; onPayClick: (order: Order) => void }) => {
  const statusConfig = getStatusConfig(order.status);
  const isPaid = !!order.paidAt;
  const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return `เมื่อสักครู่`;
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ชั่วโมงที่แล้ว`;
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden group">
      <div className="p-5 pb-0">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <img
                src={order.store.image}
                alt={order.store.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-100"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusConfig.dotColor} rounded-full border-2 border-white`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-800 truncate">{order.store.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <FiCalendar className="w-3 h-3" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs border ${statusConfig.color} whitespace-nowrap`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 bg-slate-50">
        <div className="flex items-start gap-2 mb-2">
          <FiShoppingBag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-700 line-clamp-2 flex-1">
            {order.orderItems.map(item => `${item.menu.name} ×${item.quantity}`).join(' • ')}
          </p>
        </div>
        <p className="text-xs text-slate-500 ml-6">{totalItems} รายการ</p>
      </div>
      <div className="p-5 pt-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'} ${!isPaid ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isPaid ? 'ชำระเงินแล้ว' : 'รอชำระเงิน'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">ยอดรวม</p>
            <p className="text-2xl font-bold text-slate-800">
              ฿{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {order.status === 'AWAITING_PAYMENT' ? (
          <button
            onClick={() => onPayClick(order)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FiDollarSign className="w-4 h-4" />
            ชำระเงินทันที
          </button>
        ) : (
          <Link to={`/my-orders/${order.id}`}>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
            >
              <span>ดูรายละเอียด</span>
              <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

/**
 * Main feature component for displaying user's orders.
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
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-slate-800 mb-10">กำลังโหลดออเดอร์ของคุณ...</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-slate-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-lg mb-4"></div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="h-3 bg-slate-200 rounded w-20"></div>
                  <div className="h-6 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-12 bg-slate-200 rounded-xl w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <div className="text-center p-16 bg-red-50 rounded-3xl text-red-700">
          <h2 className="text-2xl font-bold mb-3">เกิดข้อผิดพลาด</h2>
          <p>ไม่สามารถโหลดข้อมูลออเดอร์ของคุณได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PaymentModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">ออเดอร์ของฉัน</h1>
                <p className="text-slate-500 mt-1">ติดตามและจัดการคำสั่งซื้อของคุณ</p>
              </div>
            </div>
          </div>

          {ordersData && ordersData.data.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdRestaurant className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">ยังไม่มีออเดอร์</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                คุณยังไม่เคยสั่งอาหารเลย มาเริ่มต้นสั่งอาหารกันเถอะ!
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <MdRestaurant className="w-5 h-5" />
                เริ่มสั่งอาหาร
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              {activeOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      ออเดอร์ปัจจุบัน
                      <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {activeOrders.length}
                      </span>
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {historyOrders.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <FiClock className="w-5 h-5 text-slate-500" />
                      ประวัติการสั่งซื้อ
                      <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {historyOrders.length}
                      </span>
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {historyOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}

              {ordersData && ordersData.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiChevronLeft /> ก่อนหน้า
                  </button>
                  <span className="font-semibold text-slate-700">
                    หน้า {ordersData.currentPage} / {ordersData.totalPages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(p + 1, ordersData.totalPages))} disabled={page === ordersData.totalPages} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    ถัดไป <FiChevronRight />
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