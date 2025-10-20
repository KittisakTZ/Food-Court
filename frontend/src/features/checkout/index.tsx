// @/features/checkout/index.tsx

import { useCartStore } from "@/zustand/useCartStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createOrder } from "@/services/order.service";
import { useMemo } from "react";
import { toastService } from '@/services/toast.service';

const CheckoutFeature = () => {
    // 1. ดึงข้อมูลจาก Stores
    // ดึงข้อมูล cart มาแสดงผล และ totalPrice ที่คำนวณไว้แล้ว
    const cart = useCartStore(state => state.cart);
    const totalPrice = useMemo(() => {
        if (!cart?.items) return 0;
        return cart.items.reduce((total, item) => total + item.menu.price * item.quantity, 0);
    }, [cart]);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    // 2. State สำหรับจัดการตัวเลือกเวลา และ Loading
    const [pickupOption, setPickupOption] = useState<'asap' | 'scheduled'>('asap');
    const [pickupTime, setPickupTime] = useState(''); // เก็บเวลา HH:mm
    const [isSubmitting, setIsSubmitting] = useState(false); // State สำหรับ Loading ตอนกดสั่ง

    // 3. ป้องกันการเข้าถึงหน้านี้โดยตรง
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // ถ้ายังไม่ Login หรือตะกร้าว่าง, แสดง UI ที่เหมาะสม
    if (!isAuthenticated) {
        return <div>Redirecting to login...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto text-center p-10">
                <h1 className="text-2xl font-bold">Your cart is empty.</h1>
                <p className="text-gray-600 mt-2">There's nothing to check out.</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                    Find Stores
                </button>
            </div>
        );
    }

    // 4. Handler สำหรับการยืนยัน Order
    const handleConfirmOrder = async () => {
        if (!cart.storeId) return;

        setIsSubmitting(true); // เริ่ม Loading

        const payload = {
            storeId: cart.storeId,
            items: cart.items.map(item => ({ menuId: item.menu.id, quantity: item.quantity })),
            scheduledPickupTime: pickupOption === 'scheduled' ? pickupTime : undefined,
        };

        try {
            const response = await createOrder(payload);
            if (response.statusCode === 201) {
                toastService.success("Order created successfully! You can check its status in 'My Orders'.");
                // **** เราจะไม่ล้างตะกร้าที่นี่ ****
                // clearCart(); 
                navigate('/my-orders'); // พาไปหน้าประวัติการสั่งซื้อ
            } else {
                toastService.error(`Error: ${response.message}`);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            toastService.error(error.response?.data?.message || "An unexpected error occurred while placing your order.");
        } finally {
            setIsSubmitting(false); // หยุด Loading
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Confirm Your Order</h1>

            {/* ส่วนสรุปรายการ */}
            <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                    {cart.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                                <p className="font-semibold">{item.menu.name}</p>
                                <p className="text-sm text-gray-500">${item.menu.price.toFixed(2)} x {item.quantity}</p>
                            </div>
                            <span className="font-medium">${(item.menu.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* ส่วนเลือกเวลารับ */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-semibold mb-4">Pickup Time</h2>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                    <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                        <input
                            type="radio"
                            name="pickupOption"
                            value="asap"
                            checked={pickupOption === 'asap'}
                            onChange={() => setPickupOption('asap')}
                            className="mr-2"
                        />
                        As Soon As Possible
                    </label>
                    <label className="flex items-center p-3 border rounded-lg has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                        <input
                            type="radio"
                            name="pickupOption"
                            value="scheduled"
                            checked={pickupOption === 'scheduled'}
                            onChange={() => setPickupOption('scheduled')}
                            className="mr-2"
                        />
                        Schedule for later
                    </label>
                </div>
                {pickupOption === 'scheduled' && (
                    <div className="mt-4">
                        <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Select time (HH:mm 24-hour):</label>
                        <input
                            type="time"
                            id="pickupTime"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* ปุ่มยืนยัน */}
            <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full mt-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
                {isSubmitting ? 'Placing Order...' : 'Confirm and Place Order'}
            </button>
        </div>
    );
};

export default CheckoutFeature;