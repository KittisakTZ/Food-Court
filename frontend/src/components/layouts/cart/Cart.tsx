// @/components/layouts/cart/Cart.tsx

import { useCartStore } from "@/zustand/useCartStore";
import { useUpdateCartItem, useClearCart } from "@/hooks/useCart";
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiX, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { BiDish } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ConfirmationDialog } from "@/components/customs/ConfirmationDialog";
import { useScreenSize } from "@/hooks/use-mobile";

export const Cart = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cart = useCartStore(state => state.cart);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const { isMobile, isTablet } = useScreenSize();

    // คำนวณค่า totals ด้วย useMemo
    const { totalItems, totalPrice } = useMemo(() => {
        if (!cart?.items) {
            return { totalItems: 0, totalPrice: 0 };
        }
        const items = cart.items;
        const newTotalItems = items.reduce((total, item) => total + item.quantity, 0);
        const newTotalPrice = items.reduce((total, item) => total + item.menu.price * item.quantity, 0);
        return { totalItems: newTotalItems, totalPrice: newTotalPrice };
    }, [cart]);

    const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
    const { mutate: clearCart, isPending: isClearing } = useClearCart();

    if (totalItems === 0) {
        return null;
    }

    const handleUpdateQuantity = (itemId: string, quantity: number) => {
        if (!isUpdating) {
            updateItem({ itemId, quantity });
        }
    };

    const handleClearCart = () => {
        setConfirmOpen(true);
    };

    const isPending = isUpdating || isClearing;

    return (
        <>
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={clearCart}
                title="ยืนยันการล้างตะกร้า"
                description="คุณต้องการล้างตะกร้าสินค้าทั้งหมดใช่หรือไม่? 🗑️"
            />
            {/* Floating Cart Button */}
            <div className={`fixed z-[45] animate-fade-in ${
                isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'
            }`}>
                {!isExpanded ? (
                    // Collapsed State - Floating Button
                    <button
                        onClick={() => setIsExpanded(true)}
                        className={`relative group bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 ${
                            isMobile ? 'p-4' : 'p-5'
                        }`}
                    >
                        {/* Badge */}
                        <div className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce-slow border-2 border-white ${
                            isMobile ? 'w-6 h-6' : 'w-8 h-8'
                        }`}>
                            {totalItems}
                        </div>

                        {/* Icon */}
                        <FiShoppingCart className={`group-hover:animate-wiggle ${
                            isMobile ? 'w-6 h-6' : 'w-8 h-8'
                        }`} />

                        {/* Tooltip - ซ่อนใน mobile */}
                        {!isMobile && (
                            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <div className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                                    ดูตะกร้า ({totalItems} รายการ)
                                    <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </button>
                ) : (
                    // Expanded State - Cart Panel
                    <div className={`bg-white rounded-3xl shadow-3xl border-2 border-orange-200 overflow-hidden animate-slide-up ${
                        isMobile ? 'w-[calc(100vw-2rem)] max-w-sm' : isTablet ? 'w-80' : 'w-96'
                    }`}>
                        {/* Header */}
                        <div className={`bg-gradient-to-r from-orange-500 to-yellow-500 text-white relative overflow-hidden ${
                            isMobile ? 'p-4' : 'p-6'
                        }`}>
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            
                            <div className="relative z-10">
                                <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg ${
                                            isMobile ? 'w-10 h-10' : 'w-12 h-12'
                                        }`}>
                                            <FiShoppingBag className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
                                        </div>
                                        <div>
                                            <h2 className={`font-bold flex items-center gap-2 ${
                                                isMobile ? 'text-xl' : 'text-2xl'
                                            }`}>
                                                ตะกร้าของคุณ
                                                <HiSparkles className={`animate-spin-slow ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                                            </h2>
                                            <p className={`text-orange-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>{totalItems} รายการ</p>
                                        </div>
                                    </div>
                                    
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:rotate-90 shadow-lg"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Clear Cart Button */}
                                <button
                                    onClick={handleClearCart}
                                    disabled={isPending}
                                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    <MdDelete className="w-4 h-4" />
                                    ล้างตะกร้า
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className={`overflow-y-auto space-y-3 bg-gradient-to-b from-orange-50/30 to-white ${
                            isMobile ? 'max-h-64 p-4' : isTablet ? 'max-h-80 p-5' : 'max-h-96 p-6'
                        }`}>
                            {cart?.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 border-2 border-gray-100 hover:border-orange-200 group animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Menu Image */}
                                        <div className="relative">
                                            <div className={`rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow ${
                                                isMobile ? 'w-16 h-16' : 'w-20 h-20'
                                            }`}>
                                                <img
                                                    src={item.menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"}
                                                    alt={item.menu.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100";
                                                    }}
                                                />
                                            </div>
                                            {/* Quantity Badge */}
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                {item.quantity}
                                            </div>
                                        </div>

                                        {/* Menu Info */}
                                        <div className="flex-grow min-w-0">
                                            <h3 className={`font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors ${
                                                isMobile ? 'text-sm' : 'text-base'
                                            }`} title={item.menu.name}>
                                                {item.menu.name}
                                            </h3>
                                            <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                                                ฿{item.menu.price.toFixed(0)} / ชิ้น
                                            </p>
                                            
                                            {/* Quantity Controls */}
                                            <div className={`flex items-center gap-2 ${isMobile ? 'mt-2' : 'mt-3'}`}>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={isPending}
                                                    className={`bg-gradient-to-r from-red-100 to-red-200 hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white rounded-lg flex items-center justify-center font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-110 ${
                                                        isMobile ? 'w-7 h-7' : 'w-8 h-8'
                                                    }`}
                                                >
                                                    <FiMinus className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                                                </button>

                                                <span className={`w-8 text-center font-bold text-gray-800 ${
                                                    isMobile ? 'text-base' : 'text-lg'
                                                }`}>
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={isPending}
                                                    className={`bg-gradient-to-r from-green-100 to-green-200 hover:from-green-500 hover:to-green-600 text-green-600 hover:text-white rounded-lg flex items-center justify-center font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-110 ${
                                                        isMobile ? 'w-7 h-7' : 'w-8 h-8'
                                                    }`}
                                                >
                                                    <FiPlus className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total */}
                                        <div className="text-right">
                                            <div className={`font-bold text-green-600 ${
                                                isMobile ? 'text-lg' : 'text-xl'
                                            }`}>
                                                ฿{(item.menu.price * item.quantity).toFixed(0)}
                                            </div>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, 0)}
                                                disabled={isPending}
                                                className={`text-red-500 hover:text-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                                    isMobile ? 'mt-1' : 'mt-2'
                                                }`}
                                                title="ลบออกจากตะกร้า"
                                            >
                                                <FiTrash2 className={isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State (จริงๆ จะไม่แสดงเพราะ component จะ return null) */}
                            {cart?.items.length === 0 && (
                                <div className="text-center py-12">
                                    <BiDish className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-semibold">ตะกร้าว่างเปล่า</p>
                                </div>
                            )}
                        </div>

                        {/* Footer - Total & Checkout */}
                        <div className={`bg-white border-t-2 border-gray-100 ${
                            isMobile ? 'p-4' : 'p-6'
                        }`}>
                            {/* Delivery Info */}
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 mb-4 border border-orange-200">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">ค่าอาหาร</span>
                                    <span className="font-semibold text-gray-800">฿{totalPrice.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">ค่าจัดส่ง</span>
                                    <span className="font-semibold text-green-600">ฟรี! 🎉</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-100">
                                <span className="text-xl font-bold text-gray-800">ยอดรวมทั้งหมด</span>
                                <span className="text-3xl font-bold text-orange-600">฿{totalPrice.toFixed(0)}</span>
                            </div>

                            {/* Checkout Button */}
                            <Link to="/checkout" className="block" onClick={() => setIsExpanded(false)}>
                                <button
                                    disabled={isPending}
                                    className={`w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-2xl transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 group/checkout ${
                                        isMobile ? 'py-3 text-sm' : 'py-4'
                                    }`}
                                >
                                    {isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            กำลังดำเนินการ...
                                        </>
                                    ) : (
                                        <>
                                            <FiShoppingBag className="w-5 h-5 group-hover/checkout:animate-bounce" />
                                            ไปชำระเงิน
                                            <FiArrowRight className="w-5 h-5 group-hover/checkout:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </Link>

                            {/* Continue Shopping */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                            >
                                เลือกซื้อต่อ
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {isExpanded && (
                <div
                    onClick={() => setIsExpanded(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fade-in"
                ></div>
            )}

            {/* Custom CSS for Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes fade-in-up {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-10deg); }
                    75% { transform: rotate(10deg); }
                }
                
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-up { animation: slide-up 0.4s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 3s linear infinite; }
                .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
                
                .shadow-3xl {
                    box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
                }

                /* Custom Scrollbar */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #f97316, #facc15);
                    border-radius: 10px;
                }
                
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #ea580c, #eab308);
                }
            `}</style>
        </>
    );
};