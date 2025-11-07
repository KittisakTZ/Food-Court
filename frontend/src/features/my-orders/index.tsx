// @/features/my-orders/index.tsx

import { useMyOrders } from "@/hooks/useOrders";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useRef } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";

// --- Configuration Section ---

const getStatusConfig = (status: Order['status']) => {
  const configs: Record<Order['status'], { color: string; icon: JSX.Element; text: string; }> = {
    'PENDING': { color: 'text-yellow-600 bg-yellow-100', icon: <FiClock />, text: 'รอดำเนินการ' },
    'AWAITING_PAYMENT': { color: 'text-blue-600 bg-blue-100', icon: <FiDollarSign />, text: 'รอชำระเงิน' },
    'AWAITING_CONFIRMATION': { color: 'text-purple-600 bg-purple-100', icon: <FiClock />, text: 'รอตรวจสอบ' },
    'COOKING': { color: 'text-orange-600 bg-orange-100', icon: <MdRestaurant />, text: 'กำลังเตรียม' },
    'READY_FOR_PICKUP': { color: 'text-teal-600 bg-teal-100', icon: <FiPackage />, text: 'พร้อมรับ' },
    'COMPLETED': { color: 'text-gray-600 bg-gray-200', icon: <FiCheckCircle />, text: 'เสร็จสิ้น' },
    'CANCELLED': { color: 'text-red-600 bg-red-100', icon: <FiXCircle />, text: 'ยกเลิก' },
    'REJECTED': { color: 'text-red-600 bg-red-100', icon: <FiXCircle />, text: 'ถูกปฏิเสธ' },
  };
  return configs[status] || configs['PENDING'];
};


// --- Sub-components Section ---

const PaymentModal = ({ order, onClose }: { order: Order | null; onClose: () => void; }) => {
  const { mutate: uploadSlip, isPending } = useUploadSlip();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastService.error("File is too large! Maximum size is 5MB.");
        return;
      }
      uploadSlip({ orderId: order.id, slipFile: file }, { onSuccess: () => onClose() });
    }
  };

  const handleUploadClick = () => { fileInputRef.current?.click(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
          <FiXCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">ชำระเงินสำหรับออเดอร์</h2>
        <p className="text-center text-gray-600 mb-6">ร้าน: {order.store.name}</p>
        <div className="text-center mb-6">
          <p className="text-gray-700">ยอดชำระทั้งหมด</p>
          <p className="text-5xl font-bold text-green-600">฿{order.totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex justify-center mb-6">
          {order.paymentQrCode ? (
            <img src={order.paymentQrCode} alt="QR Code" className="w-64 h-64 border-4 border-gray-200 rounded-lg" />
          ) : (
            <p className="text-red-500 font-semibold">ไม่สามารถโหลด QR Code ได้</p>
          )}
        </div>
        <div className="text-center text-sm text-gray-500 mb-6 space-y-1">
          <p>สแกน QR Code เพื่อชำระเงิน จากนั้นแนบสลิปเพื่อยืนยัน</p>
          {order.paymentExpiresAt && <p className="font-semibold text-red-600">QR Code นี้จะหมดอายุในเวลา {new Date(order.paymentExpiresAt).toLocaleTimeString('th-TH')}</p>}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          className="hidden"
          disabled={isPending}
        />
        <button
          onClick={handleUploadClick}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
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
  );
};

const OrderCard = ({ order, onPayClick }: { order: Order; onPayClick: (order: Order) => void; }) => {
  const statusConfig = getStatusConfig(order.status);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/my-orders/${order.id}`);
  };

  const isPaid = !!order.paidAt;
  const paymentStatusText = isPaid ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระเงิน';
  const paymentStatusColor = isPaid ? 'text-green-600' : 'text-amber-600';

  const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      <div className="p-4 md:p-6 flex-grow">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-4">
            <img src={order.store.image || '/default-store.png'} alt={order.store.name} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">{order.store.name}</h2>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs ${statusConfig.color}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>
        </div>
        <div className="border-t border-b border-gray-200 py-3 my-3">
          <p className="text-sm text-gray-600 font-medium line-clamp-2">
            {order.orderItems.map(item => `${item.menu.name} (x${item.quantity})`).join(', ')}
          </p>
          <p className="text-xs text-gray-400 mt-1">{totalItems} รายการ</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            <span className={`font-bold text-sm ${paymentStatusColor}`}>
              {paymentStatusText}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            ฿{order.totalAmount.toFixed(0)}
          </p>
        </div>
      </div>
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        {order.status === 'AWAITING_PAYMENT' ? (
          <button
            onClick={() => onPayClick(order)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
          >
            <FiDollarSign className="w-4 h-4" />
            ชำระเงิน
          </button>
        ) : (
          <button
            onClick={handleViewDetails}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <span>ดูรายละเอียดออเดอร์</span>
            <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};


// --- Main Feature Component ---

const MyOrdersFeature = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: ordersData, isLoading, isError } = useMyOrders({ page, pageSize });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ✨ FIX: ย้าย `useMemo` มาไว้ที่ Top Level พร้อมกับ Hooks อื่นๆ ✨
  const { activeOrders, historyOrders } = useMemo(() => {
    const allOrders = ordersData?.data ?? [];
    const activeOrders = allOrders.filter(o => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    const historyOrders = allOrders.filter(o => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    return { activeOrders, historyOrders }; // ✅ ชื่อสอดคล้องกัน
  }, [ordersData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดออเดอร์...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-800 font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>
    );
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <>
      <PaymentModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ออเดอร์ของฉัน</h1>
          <p className="text-gray-600">ติดตามสถานะและประวัติการสั่งอาหารของคุณ</p>
        </div>

        {(!ordersData || ordersData.data.length === 0) ? (
          <div className="text-center p-12 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
            <div className="mb-6">
              <MdRestaurant className="w-20 h-20 text-gray-300 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">ยังไม่มีออเดอร์</h2>
            <p className="text-gray-600 mb-6">คุณยังไม่เคยสั่งอาหารเลย มาเริ่มต้นสั่งอาหารกันเถอะ!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <MdRestaurant className="w-5 h-5" />
              เริ่มสั่งอาหาร
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-12">
              {activeOrders.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-4">ออร์เดอร์ล่าสุด</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}
              {historyOrders.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-gray-400 pl-4">ประวัติการสั่งซื้อ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {historyOrders.map(order => (
                      <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {ordersData.totalPages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-md">
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm font-medium text-gray-700">แสดง:</label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">รายการต่อหน้า</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                    <span>ก่อนหน้า</span>
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    หน้า {ordersData.currentPage} / {ordersData.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === ordersData.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>ถัดไป</span>
                    <FiChevronRight />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  ทั้งหมด {ordersData.totalCount} รายการ
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MyOrdersFeature;