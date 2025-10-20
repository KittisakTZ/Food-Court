// @/features/checkout/index.tsx
import { useCartStore } from "@/zustand/useCartStore";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react"; // 1. Import useEffect (และ useRef)
import { createOrder } from "@/services/order.service";

const CheckoutFeature = () => {
    // 5. (ข้อสังเกตเพิ่มเติม) แก้ไขวิธีนับ render
    const renderCount = useRef(0);
    renderCount.current++;
    console.log(`CheckoutFeature is rendering...Count: ${renderCount.current}`);

    const { cart, storeId, totalPrice, clearCart } = useCartStore(state => ({
        cart: state.cart,
        storeId: state.storeId,
        totalPrice: state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
        clearCart: state.clearCart,
    }));
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    // let renderCount = 0; // (ลบอันเก่าทิ้ง)
    const [pickupOption, setPickupOption] = useState<'asap' | 'scheduled'>('asap');
    const [pickupTime, setPickupTime] = useState('');

    // 2. เพิ่ม useEffect ตรงนี้
    useEffect(() => {
        // ถ้าไม่ login ให้ navigate ไปหน้า login
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]); // ให้ Effect นี้ทำงานเมื่อ 2 ค่านี้เปลี่ยน

    // 3. แก้ไข if ด้านล่าง
    if (!isAuthenticated) {
        // ไม่ต้องทำอะไร ปล่อยให้ useEffect จัดการ navigate
        // คืนค่า null เพื่อไม่แสดงผลอะไรระหว่างรอ navigate
        return null;
    }

    if (cart.length === 0 || !storeId) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl">Your cart is empty.</h1>
                <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                    Back to Shopping
                </button>
            </div>
        );
    }

    // Handler สำหรับการยืนยัน Order (โค้ดส่วนนี้เหมือนเดิม)
    const handleConfirmOrder = async () => {
        if (!storeId) return;

        // เตรียม Payload
        const payload = {
            storeId,
            items: cart.map(item => ({ menuId: item.id, quantity: item.quantity })),
            scheduledPickupTime: pickupOption === 'scheduled' ? pickupTime : undefined,
        };

        try {
            const response = await createOrder(payload);
            if (response.statusCode === 201) {
                alert("Order created successfully! You can check its status in 'My Orders'.");
                clearCart(); // ล้างตะกร้าเมื่อสั่งสำเร็จ
                navigate('/my-orders'); // พาไปหน้าประวัติการสั่งซื้อ
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (error: any) {
            console.error("Failed to create order:", error);
            alert(error.response?.data?.message || "An unexpected error occurred while placing your order.");
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Confirm Your Order</h1>

            {/* ส่วนสรุปรายการ */}
            <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* ส่วนเลือกเวลารับ */}
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-semibold mb-4">Pickup Time</h2>
                <div className="flex space-x-4">
                    <label className="flex items-center">
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
                    <label className="flex items-center">
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
                        <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700">Select time (HH:mm):</label>
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
                className="w-full mt-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors"
            >
                Confirm and Place Order
            </button>
        </div>
    );
};

export default CheckoutFeature;