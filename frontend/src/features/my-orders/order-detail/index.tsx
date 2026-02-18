import { Link, useParams, useLocation  } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { Order } from "@/types/response/order.response";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiDollarSign, FiChevronLeft, FiCreditCard, FiUser, FiStar, FiRefreshCw } from "react-icons/fi";
import { MdRestaurant, MdStorefront } from "react-icons/md";
import { useState } from "react";
import ReviewForm from "./ReviewForm";
import { Button } from "@/components/ui/button";
import { useAddItemToCart } from "@/hooks/useCart";
import { toastService } from "@/services/toast.service";

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
    const location = useLocation();
    const isSellerView = location.pathname.includes('/my-store/');
    const { mutate: addToCart, isPending: isAddingToCart } = useAddItemToCart();

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><p>กำลังโหลดรายละเอียดคำสั่งซื้อ...</p></div>;
    }
    if (isError || !order) {
        return <div className="flex items-center justify-center min-h-screen"><p>เกิดข้อผิดพลาด: ไม่พบคำสั่งซื้อ</p></div>;
    }

    const statusConfig = getStatusConfig(order.status);
    const isPaid = !!order.paidAt;

    const handleReorder = async () => {
        try {
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

    const DisplayReview = ({ review }: { review: Order['review'] }) => {
        if (!review) return null;

        return (
            <div className="mt-6 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{isSellerView ? "รีวิวจากลูกค้า" : "รีวิวของคุณ"}</h3>
                <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`w-6 h-6 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="font-semibold text-lg text-gray-700">({review.rating}/5)</span>
                </div>
                {review.comment && (
                    <p className="text-gray-700 mt-4 bg-gray-50 p-4 rounded-lg italic">
                        "{review.comment}"
                    </p>
                )}
            </div>
        );
    };

    const ReviewSection = () => {
        // เงื่อนไขแรก: ยังแสดงผลรีวิวได้เฉพาะออร์เดอร์ที่เสร็จสิ้นแล้ว
        if (order.status !== 'COMPLETED') {
            return null;
        }

        // เงื่อนไขที่สอง: ถ้ามีข้อมูลรีวิว (order.review) ให้แสดง Component DisplayReview
        if (order.review) {
            return <DisplayReview review={order.review} />;
        }

        // เงื่อนไขที่สาม: ถ้ายังไม่มีรีวิว
        // ถ้าเป็นฝั่งร้านค้า (Seller) -> แสดงข้อความว่าลูกค้ารอรีวิว
        if (isSellerView) {
            return (
                <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl text-center">
                    <p className="font-semibold">ลูกค้ายังไม่ได้รีวิวออร์เดอร์นี้</p>
                </div>
            );
        }

        // ถ้าเป็นฝั่งผู้ซื้อ (Buyer) -> แสดงฟอร์มหรือปุ่มสำหรับเขียนรีวิว (เหมือนเดิม)
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
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ลำดับคิวของร้าน:</span>
                                    <span className="font-bold text-orange-600 text-lg">#{order.position}</span>
                                </div>
                            </div>

                            {/* Payment Slip Preview */}
                            {order.paymentSlip && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <FiCreditCard className="text-green-600" />
                                        สลิปการโอนเงิน
                                    </h4>
                                    <div className="relative group">
                                        <img
                                            src={order.paymentSlip}
                                            alt="Payment Slip"
                                            className="w-full rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-all"
                                            onClick={() => window.open(order.paymentSlip, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                                             onClick={() => window.open(order.paymentSlip, '_blank')}>
                                            <div className="text-white text-center">
                                                <FiPackage className="w-8 h-8 mx-auto mb-2" />
                                                <p className="font-semibold">คลิกเพื่อดูขนาดเต็ม</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <OrderTimeline order={order} />
                    </div>
                </div>

                {/* Reorder Button - แสดงสำหรับออเดอร์ที่เสร็จสิ้นหรือถูกยกเลิก (ไม่แสดงสำหรับฝั่งผู้ขาย) */}
                {!isSellerView && ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
                    <div className="mt-6">
                        <button
                            onClick={handleReorder}
                            disabled={isAddingToCart}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isAddingToCart ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    กำลังเพิ่มลงตะกร้า...
                                </>
                            ) : (
                                <>
                                    <FiRefreshCw className="w-5 h-5" />
                                    สั่งซ้ำ
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Review Section */}
                <ReviewSection />
            </div>
        </div>
    );
};

export default OrderDetailPage;