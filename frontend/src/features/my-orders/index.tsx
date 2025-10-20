// @/features/my-orders/index.tsx
import { useMyOrders } from "@/hooks/useOrders";
import { Link } from "react-router-dom";
import { useState } from "react";

// Helper function เพื่อแสดงสีของสถานะ
const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING':
        case 'AWAITING_PAYMENT':
            return 'text-yellow-500 bg-yellow-100';
        case 'COOKING':
            return 'text-blue-500 bg-blue-100';
        case 'READY_FOR_PICKUP':
            return 'text-green-500 bg-green-100';
        case 'COMPLETED':
            return 'text-gray-500 bg-gray-100';
        case 'CANCELLED':
        case 'REJECTED':
            return 'text-red-500 bg-red-100';
        default:
            return 'text-gray-500 bg-gray-100';
    }
}

const MyOrdersFeature = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useMyOrders({ page });

    if (isLoading) return <div>Loading your orders...</div>;
    if (isError) return <div>Failed to load orders.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {data?.data.length === 0 ? (
                <div className="text-center p-10 border rounded-lg">
                    <p className="text-xl">You haven't placed any orders yet.</p>
                    <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {data?.data.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Order at {order.store.name}</h2>
                                    <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                                    <p className="text-sm text-gray-500">
                                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    <p className="text-lg font-bold mt-2">${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="border-t my-4"></div>
                            <div>
                                {order.orderItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm py-1">
                                        <span>{item.menu.name} x {item.quantity}</span>
                                        <span className="text-gray-600">${(item.menu.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            {/* อาจจะเพิ่มปุ่ม "Review" หรือ "Cancel" ที่นี่ในอนาคต */}
                        </div>
                    ))}
                </div>
            )}
            {/* (Optional) เพิ่ม Pagination ที่นี่ */}
        </div>
    );
};

export default MyOrdersFeature;