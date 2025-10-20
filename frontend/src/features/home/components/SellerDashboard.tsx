// @/features/home/components/SellerDashboard.tsx (ฉบับแก้ไข)

import { useMyStoreOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Order } from "@/types/response/order.response";
import { getStatusColor, getStatusName } from "@/utils/statusUtils"; // (เราจะสร้างไฟล์นี้)

// Component สำหรับปุ่ม Action ต่างๆ
const OrderActions = ({ order }: { order: Order }) => {
    const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

    const handleUpdate = (action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP") => {
        // เพิ่มการยืนยันที่ชัดเจนขึ้น
        if (window.confirm(`Are you sure you want to perform the action: '${action.replace('_', ' ')}'?`)) {
            updateStatus({ orderId: order.id, action });
        }
    };

    // **** แก้ไข Logic การแสดงผลปุ่มทั้งหมดที่นี่ ****
    switch (order.status) {
        case 'PENDING':
            return (
                <div className="flex space-x-2">
                    <button onClick={() => handleUpdate('APPROVE')} disabled={isPending} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Approve</button>
                    <button onClick={() => handleUpdate('REJECT')} disabled={isPending} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                </div>
            );
        case 'AWAITING_PAYMENT':
            return <button onClick={() => handleUpdate('CONFIRM_PAYMENT')} disabled={isPending} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Confirm Payment</button>;

        // **** นี่คือสถานะ 'COOKING' ที่ขาดหายไป ****
        case 'COOKING':
            return <button onClick={() => handleUpdate('PREPARE_COMPLETE')} disabled={isPending} className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600">Food Ready</button>;

        case 'READY_FOR_PICKUP':
            return <button onClick={() => handleUpdate('CUSTOMER_PICKED_UP')} disabled={isPending} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">Customer Picked Up</button>;

        // สำหรับสถานะที่จบไปแล้ว (COMPLETED, REJECTED, CANCELLED) ไม่ต้องมีปุ่ม
        default:
            return null;
    }
}

// Main Dashboard Component
export const SellerDashboard = () => {
    // ดึงเฉพาะ Order ที่ยังต้องจัดการ (Active Queue)
    const { data, isLoading, isError } = useMyStoreOrders({
        status: ['PENDING', 'AWAITING_PAYMENT', 'COOKING', 'READY_FOR_PICKUP']
    });

    if (isLoading) return <div>Loading active orders...</div>;
    if (isError) return <div>Failed to load orders.</div>;

    const orders = data?.data ?? [];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Order Queue</h1>

            {orders.length === 0 ? (
                <div className="text-center p-10 border rounded-lg bg-white">
                    <p className="text-xl text-gray-600">No active orders right now.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-lg shadow-md border flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            {/* ข้อมูล Order */}
                            <div className="flex-grow">
                                <div className="flex items-center justify-between sm:justify-start mb-2 sm:mb-0">
                                    <span className="font-bold text-lg mr-4">Queue #{order.position}</span>
                                    {/* แสดงสถานะปัจจุบัน */}
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {getStatusName(order.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">From: {order.buyer?.username ?? 'N/A'}</p>
                                <div className="mt-2 pl-4 border-l-2">
                                    {order.orderItems.map(item => (
                                        <p key={item.id} className="text-sm text-gray-700">- {item.menu.name} x {item.quantity}</p>
                                    ))}
                                </div>
                                {order.scheduledPickup && (
                                    <p className="text-sm text-blue-600 font-semibold mt-2">
                                        Scheduled for: {new Date(order.scheduledPickup).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>

                            {/* ปุ่ม Action */}
                            <div className="flex-shrink-0 ml-0 sm:ml-4 mt-4 sm:mt-0">
                                <OrderActions order={order} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};