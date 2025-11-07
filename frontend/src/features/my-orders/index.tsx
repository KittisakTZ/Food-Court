// @/features/my-orders/index.tsx

import { useMyOrders } from "@/hooks/useOrders";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useRef } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";

// --- Configuration Section ---

const getStatusConfig = (status: Order['status']) => {
  const configs: Record<Order['status'], { color: string; icon: JSX.Element; text: string; }> = {
    'PENDING': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <FiClock className="w-4 h-4" />, text: 'รอดำเนินการ' },
    'AWAITING_PAYMENT': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <FiDollarSign className="w-4 h-4" />, text: 'รอชำระเงิน' },
    'AWAITING_CONFIRMATION': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: <FiClock className="w-4 h-4" />, text: 'รอตรวจสอบ' },
    'COOKING': { color: 'bg-orange-100 text-orange-800 border-orange-300', icon: <MdRestaurant className="w-4 h-4" />, text: 'กำลังเตรียม' },
    'READY_FOR_PICKUP': { color: 'bg-teal-100 text-teal-800 border-teal-300', icon: <FiPackage className="w-4 h-4" />, text: 'พร้อมรับ' },
    'COMPLETED': { color: 'bg-gray-200 text-gray-800 border-gray-400', icon: <FiCheckCircle className="w-4 h-4" />, text: 'เสร็จสิ้น' },
    'CANCELLED': { color: 'bg-red-100 text-red-800 border-red-300', icon: <FiXCircle className="w-4 h-4" />, text: 'ยกเลิก' },
    'REJECTED': { color: 'bg-red-100 text-red-800 border-red-300', icon: <FiXCircle className="w-4 h-4" />, text: 'ถูกปฏิเสธ' },
  };
  return configs[status] || configs['PENDING'];
};

const getOrderProgress = (status: Order['status']) => {
  const stepPositions: Record<Order['status'], number> = {
    'PENDING': 0,
    'AWAITING_PAYMENT': 16.6,
    'AWAITING_CONFIRMATION': 33.3,
    'COOKING': 50,
    'READY_FOR_PICKUP': 83.3,
    'COMPLETED': 100,
    'REJECTED': 0,
    'CANCELLED': 0,
  };
  return stepPositions[status] ?? 0;
};
const progressSteps = ['ยืนยัน', 'ชำระเงิน', 'ทำอาหาร', 'พร้อมรับ', 'เสร็จสิ้น'];

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
      uploadSlip({ orderId: order.id, slipFile: file }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-up">
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
      <style>{`
                @keyframes fade-in-up {
                    from { transform: translateY(20px) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
    </div>
  );
};

const OrderProgressBar = ({ status }: { status: Order['status'] }) => {
  if (status === 'CANCELLED' || status === 'REJECTED') {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg m-4">
        <p className="font-bold text-red-600">ออร์เดอร์นี้ถูกยกเลิก/ปฏิเสธ</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-4">
      <ProgressBar
        percent={getOrderProgress(status)}
        filledBackground="linear-gradient(to right, #f97316, #fbbf24)"
        unfilledBackground="#e0e0e0"
        height="8px"
      >
        {/* FIX 2: ใช้ <Step> component ที่มากับ library */}
        {progressSteps.map((_step, index) => (
          <Step key={index} transition="scale">
            {({ accomplished }) => (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${accomplished ? 'bg-orange-500' : 'bg-gray-300'}`}>
                {accomplished && <FiCheckCircle className="w-4 h-4 text-white" />}
              </div>
            )}
          </Step>
        ))}
      </ProgressBar>
      <div className="flex justify-between mt-3 text-xs md:text-sm text-gray-500 px-1">
        {progressSteps.map(step => <span key={step} className="w-1/5 text-center">{step}</span>)}
      </div>
    </div>
  );
};

const OrderCard = ({ order, onPayClick }: { order: Order; onPayClick: (order: Order) => void; }) => {
  const statusConfig = getStatusConfig(order.status);
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // navigate(`/my-orders/${order.id}`);
    toastService.warning("หน้ารายละเอียดออร์เดอร์ยังไม่เปิดให้บริการ");
  };

  const isPaid = !!order.paidAt;
  const paymentStatusText = isPaid ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระเงิน';
  const paymentStatusColor = isPaid ? 'text-green-600' : 'text-amber-600';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-gray-800">
              <MdRestaurant className="w-6 h-6 text-orange-500" />
              {order.store.name}
            </h2>
            <p className="text-gray-500 text-sm">
              วันที่: {new Date(order.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-xs border ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.text}
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-800">
              ฿{order.totalAmount.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <OrderProgressBar status={order.status} />

      <div className="bg-gray-50 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          <span className={`font-bold text-sm ${paymentStatusColor}`}>
            {paymentStatusText}
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-600 capitalize">
            {order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'จ่ายเงินสด'}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleViewDetails}
            className="flex-1 text-center py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            ดูรายละเอียด
          </button>
          {order.status === 'AWAITING_PAYMENT' && (
            <button
              onClick={() => onPayClick(order)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm"
            >
              <FiDollarSign className="w-4 h-4" />
              ชำระเงิน
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MyOrdersFeature = () => {
  const [page] = useState(1);
  const { data: ordersData, isLoading, isError } = useMyOrders({ page, pageSize: 20 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { activeOrders, historyOrders } = useMemo(() => {
    const allOrders = ordersData?.data ?? [];
    const active = allOrders.filter(o => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    const history = allOrders.filter(o => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(o.status));
    return { activeOrders: active, historyOrders: history };
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
          <div className="space-y-12">
            {activeOrders.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-4">ออร์เดอร์ล่าสุด</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                  ))}
                </div>
              </section>
            )}

            {historyOrders.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-gray-400 pl-4">ประวัติการสั่งซื้อ</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {historyOrders.map(order => (
                    <OrderCard key={order.id} order={order} onPayClick={setSelectedOrder} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrdersFeature;