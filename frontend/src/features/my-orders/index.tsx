// @/features/my-orders/index.tsx
import { useMyOrders } from "@/hooks/useOrders";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";

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
        color: 'bg-amber-100 text-amber-800 border-amber-300', 
        icon: <FiClock className="w-4 h-4" />,
        text: 'รอชำระเงิน'
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

const MyOrdersFeature = () => {
  const [page] = useState(1);
  const { data, isLoading, isError } = useMyOrders({ page });

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
                  <div className="flex justify-between items-start">
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
                    <div className="text-right">
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
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersFeature;