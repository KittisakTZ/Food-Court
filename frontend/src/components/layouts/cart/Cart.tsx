// @/components/layouts/cart/Cart.tsx (ฉบับแก้ไขล่าสุด)

import { useCartStore } from "@/zustand/useCartStore";
import { useUpdateCartItem, useClearCart } from "@/hooks/useCart";
import { FaShoppingBag, FaTrash } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { useMemo } from "react"; // **** 1. Import useMemo ****

export const Cart = () => {
    // ดึงแค่ 'cart' object ทั้งก้อนออกมา
    const cart = useCartStore(state => state.cart);

    // **** 2. ใช้ useMemo เพื่อคำนวณค่า totals ****
    // โค้ดใน useMemo จะทำงานใหม่ก็ต่อเมื่อ 'cart' (dependency) เปลี่ยนแปลงเท่านั้น
    const { totalItems, totalPrice } = useMemo(() => {
        if (!cart?.items) {
            return { totalItems: 0, totalPrice: 0 };
        }
        const items = cart.items;
        const newTotalItems = items.reduce((total, item) => total + item.quantity, 0);
        const newTotalPrice = items.reduce((total, item) => total + item.menu.price * item.quantity, 0);
        return { totalItems: newTotalItems, totalPrice: newTotalPrice };
    }, [cart]); // Dependency array: คำนวณใหม่เมื่อ cart เปลี่ยน

    const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
    const { mutate: clearCart, isPending: isClearing } = useClearCart();

    // ใช้ totalItems ที่คำนวณจาก useMemo
    if (totalItems === 0) {
        return null;
    }

    const handleUpdateQuantity = (itemId: string, quantity: number) => {
        if (!isUpdating) {
            updateItem({ itemId, quantity });
        }
    };

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            clearCart();
        }
    };

    const isPending = isUpdating || isClearing;

    return (
        <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-2xl w-80 border z-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center"><FaShoppingBag className="mr-2" /> Your Order</h2>
                <button onClick={handleClearCart} disabled={isPending} title="Clear cart">
                    <FaTrash className="text-red-500 hover:text-red-700" />
                </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cart?.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-semibold truncate w-32" title={item.menu.name}>{item.menu.name}</span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={isPending} className="font-bold">-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={isPending} className="font-bold">+</button>
                        </div>
                        <span>${(item.menu.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="block w-full">
                <button disabled={isPending} className="w-full mt-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                    Go to Checkout
                </button>
            </Link>
        </div>
    );
};