import { Link, useParams } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { Order } from "@/types/response/order.response";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiChevronLeft, FiCalendar, FiCreditCard, FiHash, FiUser, FiStar } from "react-icons/fi";
import { MdRestaurant, MdStorefront } from "react-icons/md";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";

// --- Configuration & Helper Functions ---

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

const getOrderProgress = (status: Order['status']) => {
    const stepPositions: Record<Order['status'], number> = {
        'PENDING': 0, 'AWAITING_PAYMENT': 16.6, 'AWAITING_CONFIRMATION': 33.3,
        'COOKING': 50, 'READY_FOR_PICKUP': 83.3, 'COMPLETED': 100,
        'REJECTED': 0, 'CANCELLED': 0,
    };
    return stepPositions[status] ?? 0;
};
const progressSteps = ['ยืนยัน', 'ชำระเงิน', 'ทำอาหาร', 'พร้อมรับ', 'เสร็จสิ้น'];

const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('th-TH', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    }) + ' น.';
};

// --- Sub-components for Detail Page ---

const OrderProgressBar = ({ status }: { status: Order['status'] }) => {
    if (status === 'CANCELLED' || status === 'REJECTED') {
        return (
            <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="font-bold text-red-600 flex items-center justify-center gap-2">
                    <FiXCircle /> ออร์เดอร์นี้ถูกยกเลิก/ปฏิเสธ
                </p>
            </div>
        );
    }
    return (
        <div className="px-4 md:px-8 py-6">
            <ProgressBar percent={getOrderProgress(status)} filledBackground="linear-gradient(to right, #f97316, #fbbf24)" height="8px">
                {progressSteps.map((_step, index) => (
                    <Step key={index} transition="scale">
                        {({ accomplished }) => (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${accomplished ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                {accomplished && <FiCheckCircle className="w-5 h-5 text-white" />}
                            </div>
                        )}
                    </Step>
                ))}
            </ProgressBar>
            <div className="flex justify-between mt-3 text-xs md:text-sm text-gray-500 px-1">
                {progressSteps.map(step => <span key={step} className="w-1/5 text-center font-medium">{step}</span>)}
            </div>
        </div>
    );
};

const OrderTimeline = ({ order }: { order: Order }) => {
    const timelineEvents = [
        { label: 'สั่งอาหาร', time: order.createdAt, icon: <FiPackage className="text-gray-500" /> },
        { label: 'ร้านค้ายืนยัน', time: order.confirmedAt, icon: <MdStorefront className="text-blue-500" /> },
        { label: 'ชำระเงินแล้ว', time: order.paidAt, icon: <FiCreditCard className="text-green-500" /> },
        { label: 'เริ่มทำอาหาร', time: order.status === 'COOKING' ? order.updatedAt : null, icon: <MdRestaurant className="text-orange-500" /> },
        { label: 'อาหารพร้อมรับ', time: order.status === 'READY_FOR_PICKUP' ? order.updatedAt : null, icon: <FiPackage className="text-teal-500" /> },
        { label: 'รับอาหารแล้ว', time: order.completedAt, icon: <FiUser className="text-purple-500" /> },
    ].filter(event => event.time); // Filter out events that haven't happened yet

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ไทม์ไลน์</h3>
            <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">{event.icon}</div>
                        <div>
                            <p className="font-semibold text-gray-700">{event.label}</p>
                            <p className="text-sm text-gray-500">{formatDate(event.time)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { data: order, isLoading, isError } = useOrder(orderId);
    const [isReviewing, setIsReviewing] = useState(false);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><p>Loading order details...</p></div>;
    }
    if (isError || !order) {
        return <div className="flex items-center justify-center min-h-screen"><p>Error: Order not found.</p></div>;
    }

    const statusConfig = getStatusConfig(order.status);
    const isPaid = !!order.paidAt;

    const ReviewSection = () => {
        if (order.status !== 'COMPLETED') {
            return null; // Do not show review section if order is not completed
        }

        if (order.isReviewed) {
            return (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl text-center">
                    <p className="font-semibold">คุณได้รีวิวออร์เดอร์นี้แล้ว</p>
                </div>
            );
        }

        if (isReviewing) {
            return (
                <div className="mt-6">
                    <ReviewForm
                        storeId={order.store.id}
                        orderId={order.id}
                        onCancel={() => setIsReviewing(false)}
                    />
                </div>
            );
        }

        return (
            <div className="mt-6 text-center">
                <Button onClick={() => setIsReviewing(true)} size="lg">
                    <FiStar className="mr-2" />
                    เขียนรีวิว
                </Button>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/my-orders" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold">
                        <FiChevronLeft />
                        กลับไปหน้ารายการ
                    </Link>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${statusConfig.color}`}>
                        {statusConfig.icon}
                        <span>{statusConfig.text}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <p className="text-sm text-gray-500">ออร์เดอร์</p>
                            <h1 className="text-3xl font-bold text-gray-800 break-all">#{order.id.substring(0, 12)}...</h1>
                            <p className="text-md text-gray-600 mt-2">จากร้าน: <span className="font-semibold">{order.store.name}</span></p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-sm text-gray-500">ยอดรวม</p>
                            <p className="text-4xl font-bold text-green-600">฿{order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Card */}
                <div className="bg-white rounded-2xl shadow-md mb-6">
                    <OrderProgressBar status={order.status} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">รายการอาหาร ({order.orderItems.length})</h3>
                        <div className="space-y-4">
                            {order.orderItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <img src={item.menu.image || ''} alt={item.menu.name} className="w-20 h-20 rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.menu.name}</p>
                                        <p className="text-sm text-gray-500">฿{item.menu.price.toFixed(0)} x {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-lg text-gray-800">฿{item.subtotal.toFixed(0)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Timeline & Summary */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">สรุป</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">สถานะการชำระเงิน:</span> <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>{isPaid ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระเงิน'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">วิธีชำระเงิน:</span> <span className="font-semibold">{order.paymentMethod === 'PROMPTPAY' ? 'PromptPay' : 'จ่ายเงินสด'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">หมายเลขคิว:</span> <span className="font-semibold">{order.queueNumber}</span></div>
                            </div>
                        </div>
                        <OrderTimeline order={order} />
                    </div>
                </div>

                {/* Review Section */}
                <ReviewSection />
            </div>
        </div>
    );
};

export default OrderDetailPage;