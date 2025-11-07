// @/features/my-orders/index.tsx

import { useMyOrders } from "@/hooks/useOrders";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiUpload } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import { Order } from "@/types/response/order.response";
import { useUploadSlip } from "@/hooks/useOrders";
import { toastService } from "@/services/toast.service";

// Configuration for order status display
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: <FiClock className="w-4 h-4" />,
        text: 'รอดำเนินการ'
      };
    case 'AWAITING_PAYMENT':
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: <FiDollarSign className="w-4 h-4" />,
        text: 'รอชำระเงิน'
      };
    case 'AWAITING_CONFIRMATION':
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        icon: <FiClock className="w-4 h-4" />,
        text: 'รอตรวจสอบ'
      };
    case 'COOKING':
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: <MdRestaurant className="w-4 h-4" />,
        text: 'กำลังเตรียม'
      };
    case 'READY_FOR_PICKUP':
      return { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        icon: <FiPackage className="w-4 h-4" />,
        text: 'พร้อมรับ'
      };
    case 'COMPLETED':
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: <FiCheckCircle className="w-4 h-4" />,
        text: 'เสร็จสิ้น'
      };
    case 'CANCELLED':
    case 'REJECTED':
      return { 
        color: 'bg-red-100 text-red-800 border-red-300', 
        icon: <FiXCircle className="w-4 h-4" />,
        text: 'ยกเลิก'
      };
    default:
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: <FiClock className="w-4 h-4" />,
        text: status
      };
  }
};

// Payment Modal Component
const PaymentModal = ({ order, onClose }: { order: Order | null; onClose: () => void; }) => {
    const { mutate: uploadSlip, isPending } = useUploadSlip();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!order) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (e.g., max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toastService.error("File is too large! Maximum size is 5MB.");
                return;
            }
            uploadSlip({ orderId: order.id, slipFile: file }, {
                onSuccess: () => {
                    onClose(); // Close modal on successful upload
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


// Main Component
const MyOrdersFeature = () => {
  const [page] = useState(1);
  const { data, isLoading, isError } = useMyOrders({ page });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ออเดอร์ของฉัน</h1>
          <p className="text-gray-600">ติดตามสถานะและประวัติการสั่งอาหารของคุณ</p>
        </div>

        {data?.data.length === 0 ? (
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
          <div className="grid grid-cols-1 gap-6">
            {data?.data.map(order => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 text-white">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                          <MdRestaurant className="w-6 h-6" />
                          {order.store.name}
                        </h2>
                        <p className="text-orange-100 text-sm">รหัสออเดอร์: {order.id.substring(0, 8)}</p>
                        <p className="text-orange-100 text-sm">
                          วันที่สั่ง: {new Date(order.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border-2 ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.text}
                        </div>
                        <p className="text-3xl font-bold mt-3">
                          ฿{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FiPackage className="w-5 h-5" />
                      รายการอาหาร
                    </h3>
                    <div className="space-y-3">
                      {order.orderItems.map(item => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {item.quantity}×
                            </div>
                            <span className="font-medium text-gray-800">{item.menu.name}</span>
                          </div>
                          <span className="text-lg font-semibold text-orange-600">
                            ฿{(item.menu.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    {order.status === 'AWAITING_PAYMENT' && (
                        <button 
                            onClick={() => setSelectedOrder(order)}
                            className="w-full flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <FiDollarSign className="w-5 h-5" />
                            ชำระเงิน
                        </button>
                    )}
                    {order.status === 'AWAITING_CONFIRMATION' && (
                        <div className="text-center text-purple-800 font-semibold p-3 bg-purple-100 rounded-lg border border-purple-200">
                            <p>ร้านค้ากำลังตรวจสอบสลิปของคุณ</p>
                            {order.paymentSlip && 
                                <a 
                                    href={order.paymentSlip} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                >
                                    (ดูสลิปที่แนบ)
                                </a>
                            }
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrdersFeature;