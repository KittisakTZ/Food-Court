// @/features/home/components/BuyerDashboard.tsx

import { useStores } from "@/hooks/useStores";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiStar, FiClock, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";
import { BiTrendingUp } from "react-icons/bi";

export const BuyerDashboard = () => {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [inputValue, setInputValue] = useState("");

    const { data, isLoading, isError, error } = useStores({ page, pageSize: 12, searchText });

    const handleSearch = () => {
        setSearchText(inputValue);
        setPage(1); // Reset to first page when searching
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setInputValue("");
        setSearchText("");
        setPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
                <div className="text-center">
                    <div className="relative mb-6">
                        {/* Outer spinning ring */}
                        <div className="animate-spin rounded-full h-24 w-24 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
                        {/* Middle spinning ring */}
                        <div className="absolute top-2 left-2 animate-spin rounded-full h-20 w-20 border-6 border-yellow-200 border-t-yellow-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                        {/* Center icon */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <IoFastFoodOutline className="w-10 h-10 text-orange-500 animate-bounce" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-gray-700 mb-2 animate-pulse">กำลังโหลดร้านค้า...</p>
                    <p className="text-sm text-gray-500">กรุณารอสักครู่ ✨</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-2 border-red-200 max-w-md transform hover:scale-105 transition-transform">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <MdStorefront className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">เกิดข้อผิดพลาด 😢</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">{error?.message || "ไม่สามารถโหลดข้อมูลได้"}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                    >
                        🔄 ลองอีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                {/* Hero Section */}
                <div className="mb-10 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden animate-fade-in">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-float"></div>
                    <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-white/5 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                                <IoFastFoodOutline className="w-12 h-12" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-4xl md:text-6xl font-bold animate-slide-in-right">ยินดีต้อนรับ!</h1>
                                    <HiSparkles className="w-10 h-10 text-yellow-300 animate-spin-slow" />
                                </div>
                                <p className="text-orange-100 text-lg md:text-xl animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                                    เลือกร้านอาหารที่คุณชื่นชอบและเริ่มสั่งได้เลย 🍽️
                                </p>
                            </div>
                        </div>
                        
                        {/* Quick Stats with Hover Effects */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center transform hover:scale-110 hover:bg-white/30 transition-all cursor-pointer group shadow-lg">
                                <MdStorefront className="w-10 h-10 mx-auto mb-3 group-hover:animate-bounce" />
                                <p className="text-3xl font-bold mb-1">{data?.total || 0}</p>
                                <p className="text-sm text-orange-100">ร้านค้าทั้งหมด</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center transform hover:scale-110 hover:bg-white/30 transition-all cursor-pointer group shadow-lg">
                                <FiStar className="w-10 h-10 mx-auto mb-3 group-hover:animate-spin" />
                                <p className="text-3xl font-bold mb-1">4.5+</p>
                                <p className="text-sm text-orange-100">คะแนนเฉลี่ย</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center col-span-2 md:col-span-1 transform hover:scale-110 hover:bg-white/30 transition-all cursor-pointer group shadow-lg">
                                <IoFastFoodOutline className="w-10 h-10 mx-auto mb-3 group-hover:rotate-12 transition-transform" />
                                <p className="text-3xl font-bold mb-1">100+</p>
                                <p className="text-sm text-orange-100">เมนูให้เลือก</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="mb-10">
                    <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-2 hover:shadow-3xl hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="relative flex items-center gap-2">
                            <div className="relative flex-grow">
                                <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400 w-6 h-6 animate-pulse" />
                                <input
                                    type="text"
                                    placeholder="🔍 ค้นหาร้านอาหาร เช่น ก๋วยเตี้ยว, ข้าวมันไก่, สเต็ก... (กด Enter เพื่อค้นหา)"
                                    className="w-full pl-16 pr-6 py-5 text-lg border-0 focus:ring-2 focus:ring-orange-400 rounded-2xl outline-none bg-transparent font-medium"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                {inputValue && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 hover:rotate-90 transition-all duration-300 bg-gray-100 hover:bg-red-100 rounded-full p-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="px-8 py-5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                            >
                                <FiSearch className="w-5 h-5" />
                                <span className="hidden sm:inline">ค้นหา</span>
                            </button>
                        </div>
                    </div>
                    
                    {searchText && (
                        <div className="mt-5 flex items-center gap-3 animate-slide-down">
                            <p className="text-gray-700 font-medium">
                                ผลการค้นหา: <span className="font-bold text-orange-600">"{searchText}"</span>
                            </p>
                            <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full text-sm font-bold shadow-md animate-bounce-slow border-2 border-orange-200">
                                🏪 {data?.totalCount || 0} ร้าน
                            </span>
                        </div>
                    )}
                </div>

                {/* Stores Grid */}
                {data?.data.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-2xl border-2 border-dashed border-gray-300 animate-fade-in">
                        <div className="relative inline-block mb-8">
                            <MdStorefront className="w-32 h-32 text-gray-300 mx-auto animate-pulse" />
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                                <span className="text-white text-2xl font-bold">!</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">ไม่พบร้านค้า 😔</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                            {searchText 
                                ? `ไม่พบร้านค้าที่ตรงกับ "${searchText}" ลองค้นหาด้วยคำอื่นหรือดูร้านค้าทั้งหมด`
                                : "ยังไม่มีร้านค้าในระบบ กรุณาลองใหม่ภายหลัง"
                            }
                        </p>
                        {searchText && (
                            <button
                                onClick={handleClearSearch}
                                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                            >
                                ✨ ดูร้านค้าทั้งหมด
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Store Count Header */}
                        <div className="mb-8 flex items-center justify-between bg-white rounded-2xl p-5 shadow-lg border-2 border-orange-100">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                                    <MdStorefront className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-gray-700 font-bold text-xl">
                                    พบ <span className="text-orange-600 text-2xl">{data?.total}</span> ร้านค้า
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-yellow-50 px-5 py-2 rounded-full border-2 border-orange-200">
                                <BiTrendingUp className="w-5 h-5 text-orange-500" />
                                <span className="text-sm font-bold text-gray-700">
                                    หน้า {data?.currentPage} / {data?.totalPages}
                                </span>
                            </div>
                        </div>

                        {/* Stores Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            {data?.data.map((store, index) => (
                                <Link 
                                    to={`/stores/${store.id}`} 
                                    key={store.id}
                                    className="group block animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden border-2 border-gray-100 h-full flex flex-col transform hover:-translate-y-3 hover:border-orange-300">
                                        {/* Store Image */}
                                        <div className="relative overflow-hidden h-56">
                                            <img 
                                                src={store.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} 
                                                alt={store.name} 
                                                className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                                                }}
                                            />
                                            
                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 animate-slide-in-right">
                                                {store.isOpen ? (
                                                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-sm bg-opacity-95 transform hover:scale-110 transition-transform">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                                        <div className="w-2 h-2 bg-white rounded-full absolute"></div>
                                                        เปิดอยู่
                                                    </div>
                                                ) : (
                                                    <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-sm bg-opacity-95">
                                                        <FiClock className="w-3 h-3" />
                                                        ปิดแล้ว
                                                    </div>
                                                )}
                                            </div>

                                            {/* Favorite Button */}
                                            <div className="absolute top-4 left-4 animate-slide-in-left">
                                                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-red-500 hover:text-white transition-all hover:scale-110 group/heart">
                                                    <FiHeart className="w-5 h-5 group-hover/heart:fill-current" />
                                                </button>
                                            </div>

                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            {/* Quick View on Hover */}
                                            <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-center shadow-2xl">
                                                    <p className="text-sm font-bold text-gray-800 flex items-center justify-center gap-2">
                                                        <HiSparkles className="w-4 h-4 text-orange-500" />
                                                        คลิกเพื่อดูเมนู
                                                        <HiSparkles className="w-4 h-4 text-orange-500" />
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Store Info */}
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h2 className="text-xl font-bold text-gray-800 mb-4 truncate group-hover:text-orange-600 transition-colors">
                                                {store.name}
                                            </h2>
                                            
                                            {/* Rating */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                                                    <FiStar className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                                                    <span className="text-sm font-bold text-orange-600">
                                                        {store.avgRating.toFixed(1)}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 font-semibold">
                                                    ({store.reviewCount} รีวิว)
                                                </span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t-2 border-gray-100 my-4"></div>

                                            {/* Action Button */}
                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-2xl group-hover:from-orange-200 group-hover:to-yellow-200 transition-all border-2 border-orange-200">
                                                    <span className="text-sm font-bold text-gray-700">
                                                        🍴 ดูเมนูอาหาร
                                                    </span>
                                                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center group-hover:shadow-xl transition-all group-hover:scale-110">
                                                        <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="mt-16 mb-8 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 transition-all shadow-xl hover:shadow-2xl font-bold text-gray-700 hover:-translate-x-1 transform"
                        >
                            <FiChevronLeft className="w-6 h-6" />
                            <span className="hidden sm:inline">หน้าก่อน</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {[...Array(data.totalPages)].map((_, idx) => {
                                const pageNum = idx + 1;
                                if (
                                    pageNum === 1 ||
                                    pageNum === data.totalPages ||
                                    (pageNum >= page - 1 && pageNum <= page + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`min-w-[56px] h-14 rounded-2xl font-bold transition-all transform ${
                                                pageNum === page
                                                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-2xl scale-125 border-2 border-orange-400 animate-pulse'
                                                    : 'bg-white border-2 border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 hover:scale-110'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === page - 2 || pageNum === page + 2) {
                                    return <span key={pageNum} className="text-orange-400 px-2 font-bold text-xl">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === data.totalPages}
                            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-orange-200 transition-all shadow-xl hover:shadow-2xl font-bold text-gray-700 hover:translate-x-1 transform"
                        >
                            <span className="hidden sm:inline">หน้าถัดไป</span>
                            <FiChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>

            {/* Custom CSS for Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slide-in-right {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slide-in-left {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slide-down {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes fade-in-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .animate-fade-in { animation: fade-in 0.6s ease-out; }
                .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
                .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
                .animate-slide-down { animation: slide-down 0.4s ease-out; }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 3s linear infinite; }
            `}</style>
        </div>
    );
};