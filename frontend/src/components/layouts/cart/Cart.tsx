// @/components/layouts/cart/Cart.tsx
import { useCartStore } from "@/zustand/useCartStore";
import { FaShoppingBag } from 'react-icons/fa';
import { Link } from "react-router-dom";

export const Cart = () => {
    const { cart, addItem, removeItem, storeId } = useCartStore();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (totalItems === 0) {
        return null; // ถ้าไม่มีของในตะกร้า ไม่ต้องแสดงอะไร
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white p-6 rounded-lg shadow-2xl w-80 border">
            <h2 className="text-xl font-bold mb-4 flex items-center"><FaShoppingBag className="mr-2" /> Your Order</h2>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="font-semibold truncate w-32">{item.name}</span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => removeItem(item.id)} className="font-bold">-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => addItem(item)} className="font-bold">+</button>
                        </div>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="block w-full">
                <button className="w-full mt-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                    Go to Checkout
                </button>
            </Link>
        </div>
    );
};