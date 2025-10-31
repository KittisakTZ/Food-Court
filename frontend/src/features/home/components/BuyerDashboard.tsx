// @/features/home/components/BuyerDashboard.tsx

import { useStores } from "@/hooks/useStores";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch,  FiStar, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdStorefront } from "react-icons/md";
import { IoFastFoodOutline } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";

export const BuyerDashboard = () => {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");

    const { data, isLoading, isError, error } = useStores({ page, pageSize: 12, searchText });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-20 w-20 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <IoFastFoodOutline className="w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">กำลังโหลดร้านค้า...</p>
                    <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center bg-white p-10 rounded-3xl shadow-xl border-2 border-red-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MdStorefront className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-600 mb-6">{error?.message || "ไม่สามารถโหลดข้อมูลได้"}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl"
                    >
                        ลองอีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {/* Hero Section */}
            <div className="mb-8 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <IoFastFoodOutline className="w-10 h-10" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-4xl md:text-5xl font-bold">ยินดีต้อนรับ!</h1>
                                <HiSparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                            </div>
                            <p className="text-orange-100 text-lg md:text-xl">
                                เลือกร้านอาหารที่คุณชื่นชอบและเริ่มสั่งได้เลย
                            </p>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <MdStorefront className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{data?.total || 0}</p>
                            <p className="text-sm text-orange-100">ร้านค้าทั้งหมด</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                            <FiStar className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">4.5+</p>
                            <p className="text-sm text-orange-100">คะแนนเฉลี่ย</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center col-span-2 md:col-span-1">
                            <IoFastFoodOutline className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">100+</p>
                            <p className="text-sm text-orange-100">เมนูให้เลือก</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-2 hover:shadow-2xl transition-shadow">
                    <div className="relative">
                        <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        <input
                            type="text"
                            placeholder="ค้นหาร้านอาหาร เช่น ก๋วยเตี้ยว, ข้าวมันไก่, สเต็ก..."
                            className="w-full pl-16 pr-6 py-4 text-lg border-0 focus:ring-2 focus:ring-orange-400 rounded-xl outline-none bg-transparent"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        {searchText && (
                            <button
                                onClick={() => setSearchText("")}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                
                {searchText && (
                    <div className="mt-4 flex items-center gap-2">
                        <p className="text-gray-600">
                            ผลการค้นหา: <span className="font-bold text-orange-600">"{searchText}"</span>
                        </p>
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            {data?.total || 0} ร้าน
                        </span>
                    </div>
                )}
            </div>

            {/* Stores Grid */}
            {data?.data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
                    <div className="relative inline-block mb-6">
                        <MdStorefront className="w-24 h-24 text-gray-300 mx-auto" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl">!</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">ไม่พบร้านค้า</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {searchText 
                            ? `ไม่พบร้านค้าที่ตรงกับ "${searchText}" ลองค้นหาด้วยคำอื่นหรือดูร้านค้าทั้งหมด`
                            : "ยังไม่มีร้านค้าในระบบ กรุณาลองใหม่ภายหลัง"
                        }
                    </p>
                    {searchText && (
                        <button
                            onClick={() => setSearchText("")}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            ดูร้านค้าทั้งหมด
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Store Count */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdStorefront className="w-6 h-6 text-orange-500" />
                            <p className="text-gray-700 font-semibold text-lg">
                                พบ <span className="text-orange-600">{data?.total}</span> ร้านค้า
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            หน้า {data?.currentPage} / {data?.totalPages}
                        </div>
                    </div>

                    {/* Stores Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {data?.data.map((store) => (
                            <Link 
                                to={`/stores/${store.id}`} 
                                key={store.id}
                                className="group block"
                            >
                                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col transform hover:-translate-y-2">
                                    {/* Store Image */}
                                    <div className="relative overflow-hidden h-52">
                                        <img 
                                            src={store.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'} 
                                            alt={store.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                                            }}
                                        />
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            {store.isOpen ? (
                                                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm bg-opacity-95">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    เปิดอยู่
                                                </div>
                                            ) : (
                                                <div className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm bg-opacity-95">
                                                    <FiClock className="w-3 h-3" />
                                                    ปิดแล้ว
                                                </div>
                                            )}
                                        </div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Quick View on Hover */}
                                        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 text-center">
                                                <p className="text-sm font-bold text-gray-800">คลิกเพื่อดูเมนู</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Store Info */}
                                    <div className="p-5 flex-grow flex flex-col">
                                        <h2 className="text-xl font-bold text-gray-800 mb-3 truncate group-hover:text-orange-600 transition-colors">
                                            {store.name}
                                        </h2>
                                        
                                        {/* Rating */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-1.5 rounded-full border border-orange-200">
                                                <FiStar className="w-4 h-4 text-orange-500 fill-orange-500" />
                                                <span className="text-sm font-bold text-orange-600">
                                                    {store.avgRating.toFixed(1)}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 font-medium">
                                                ({store.reviewCount} รีวิว)
                                            </span>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100 my-3"></div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-xl group-hover:from-orange-100 group-hover:to-yellow-100 transition-colors">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    ดูเมนูอาหาร
                                                </span>
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center group-hover:shadow-lg transition-all">
                                                    <svg className="w-4 h-4 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all shadow-md hover:shadow-lg font-semibold text-gray-700"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">หน้าก่อน</span>
                    </button>

                    <div className="flex items-center gap-2">
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
                                        className={`min-w-[48px] h-12 rounded-xl font-bold transition-all ${
                                            pageNum === page
                                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-xl scale-110 border-2 border-orange-400'
                                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (pageNum === page - 2 || pageNum === page + 2) {
                                return <span key={pageNum} className="text-gray-400 px-2 font-bold">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === data.totalPages}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all shadow-md hover:shadow-lg font-semibold text-gray-700"
                    >
                        <span className="hidden sm:inline">หน้าถัดไป</span>
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};