// @/features/store-detail/index.tsx

import { useStore } from "@/hooks/useStores";
import { useMenus } from "@/hooks/useMenus";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useState } from "react";
import { useAddItemToCart } from "@/hooks/useCart";
import { FiStar, FiClock, FiMapPin, FiShoppingCart, FiChevronLeft, FiChevronRight, FiInfo } from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";
import { BiDish } from "react-icons/bi";
import { Link } from "react-router-dom";

interface StoreDetailFeatureProps {
  storeId: string;
}

const StoreDetailFeature = ({ storeId }: StoreDetailFeatureProps) => {
  const [page, setPage] = useState(1);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { mutate: addItem, isPending: isAdding } = useAddItemToCart();
  const {
    data: store,
    isLoading: isLoadingStore,
    isError: isErrorStore,
  } = useStore(storeId);
  const {
    data: menus,
    isLoading: isLoadingMenus,
    isError: isErrorMenus,
  } = useMenus({ storeId, page, categoryId: selectedCategoryId });
  const { data: categories } = useMenuCategories(storeId);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setPage(1);
  };

  const handleAddItem = (menuId: string) => {
    setAddingItemId(menuId);
    addItem(
      { menuId, quantity: 1 },
      {
        onSettled: () => {
          setTimeout(() => setAddingItemId(null), 500);
        },
      }
    );
  };

  // Loading State
  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <div className="absolute top-2 left-2 animate-spin rounded-full h-20 w-20 border-6 border-yellow-200 border-t-yellow-500" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <IoFastFoodOutline className="w-10 h-10 text-orange-500 animate-bounce" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-700 mb-2 animate-pulse">กำลังโหลดข้อมูลร้านค้า...</p>
          <p className="text-sm text-gray-500">กรุณารอสักครู่ ✨</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isErrorStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-2 border-red-200 max-w-md transform hover:scale-105 transition-transform">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FiInfo className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">เกิดข้อผิดพลาด 😢</h2>
          <p className="text-gray-600 mb-8">เกิดข้อผิดพลาดในการโหลดข้อมูลร้านค้า</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <FiChevronLeft className="w-5 h-5" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl border-2 border-gray-200 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoFastFoodOutline className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">ไม่พบข้อมูลร้านค้า 🔍</h2>
          <p className="text-gray-600 mb-8">ไม่พบร้านค้าที่คุณกำลังค้นหา</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <FiChevronLeft className="w-5 h-5" />
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Back Button - Compact */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md font-semibold text-gray-700 text-sm group"
        >
          <FiChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          กลับหน้าหลัก
        </Link>

        {/* Store Header Section - Compact */}
        <div className="mb-6">
          {/* Store Cover Image - Compact */}
          <div className="relative overflow-hidden rounded-2xl shadow-lg mb-4 h-48 md:h-64 group">
            <img
              src={store.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200";
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            {/* Store Status Badge - Compact */}
            <div className="absolute top-3 right-3">
              {store.isOpen ? (
                <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute"></div>
                  เปิดอยู่
                </div>
              ) : (
                <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <FiClock className="w-3 h-3" />
                  ปิด
                </div>
              )}
            </div>

            
            
            {/* Store Info Overlay - Compact */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
                  <IoFastFoodOutline className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg">{store.name}</h1>
                  <div className="flex items-center gap-2">
                    {/* Rating - Compact */}
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                      <FiStar className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                      <span className="font-bold text-sm">{store.avgRating.toFixed(1)}</span>
                      <span className="text-white/80 text-xs">({store.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info Cards - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Description Card - Compact */}
            <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-md border border-orange-100 hover:shadow-lg transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <FiInfo className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-800">รายละเอียดร้าน</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {store.description || "ร้านอาหารคุณภาพดี บริการด้วยใจ อาหารอร่อย สดใหม่ทุกวัน"}
              </p>
            </div>

            {/* Quick Info Card - Compact */}
            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl p-4 shadow-md text-white">
              <div className="flex items-center gap-2 mb-3">
                <HiSparkles className="w-5 h-5" />
                <h3 className="text-base font-bold">ข้อมูลเพิ่มเติม</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <BiDish className="w-4 h-4" />
                  <span className="font-semibold text-sm">เมนูหลากหลาย</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <FiMapPin className="w-4 h-4" />
                  <span className="font-semibold text-sm">จัดส่งฟรี</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                  <FiClock className="w-4 h-4" />
                  <span className="font-semibold text-sm">จัดส่งรวดเร็ว</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section - Compact */}
        <div>
          {/* Section Header - Compact */}
          <div className="flex items-center justify-between mb-5 bg-white rounded-xl p-4 shadow-md border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <BiDish className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  เมนูอาหาร
                </h2>
                <p className="text-gray-500 text-xs">เลือกเมนูที่คุณชื่นชอบ</p>
              </div>
            </div>
            {menus?.total && (
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-full border border-orange-200">
                <p className="font-bold text-orange-600 text-sm">
                  {menus.total} เมนู
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoadingMenus && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
              <div className="relative inline-block mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <BiDish className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-700 animate-pulse">กำลังโหลดเมนู...</p>
            </div>
          )}

          {/* Error State */}
          {isErrorMenus && (
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-red-200">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiInfo className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">เกิดข้อผิดพลาด</h3>
              <p className="text-gray-600">เกิดข้อผิดพลาดในการโหลดเมนู</p>
            </div>
          )}

          {/* Category Filters - Compact */}
          {categories && categories.length > 0 && (
            <div className="mb-5 flex items-center justify-center flex-wrap gap-2">
              <button
                onClick={() => handleCategorySelect("")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md ${selectedCategoryId === "" ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' : 'bg-white text-gray-700'}`}
              >
                ทั้งหมด
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md ${selectedCategoryId === category.id ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Menu Grid */}
          {!isLoadingMenus && !isErrorMenus && menus?.data && (
            <>
              {menus.data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300">
                  <BiDish className="w-24 h-24 text-gray-300 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">ยังไม่มีเมนูในร้าน</h3>
                  <p className="text-gray-600">กรุณาลองใหม่ภายหลัง</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                  {menus.data.map((menu) => (
                    <div
                      key={menu.id}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2 hover:border-orange-300"
                    >
                      {/* Menu Image - Compact */}
                      <div className="relative overflow-hidden h-32">
                        <img
                          src={menu.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                          alt={menu.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                          }}
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Price Badge - Compact */}
                        <div className="absolute top-2 right-2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg">
                            ฿{menu.price.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {/* Menu Info - Compact */}
                      <div className="p-3 flex-grow flex flex-col">
                        <h3 className="text-sm font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
                          {menu.name}
                        </h3>

                        <p className="text-xs text-gray-500 mb-2 line-clamp-1 flex-grow">
                          {menu.description || "เมนูอาหารรสชาติเด็ด"}
                        </p>

                        {/* Price Display - Compact */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-green-600">
                            ฿{menu.price.toFixed(0)}
                          </span>
                        </div>

                        {/* Add to Cart Button - Compact */}
                        <button
                          onClick={() => handleAddItem(menu.id)}
                          disabled={isAdding && addingItemId === menu.id}
                          className="w-full py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs"
                        >
                          {isAdding && addingItemId === menu.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                              กำลังเพิ่ม...
                            </>
                          ) : (
                            <>
                              <FiShoppingCart className="w-3.5 h-3.5" />
                              เพิ่มลงตะกร้า
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination - Compact */}
          {menus && menus.totalPages > 1 && (
            <div className="mt-6 mb-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-bold text-gray-700 text-sm"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">ก่อนหน้า</span>
              </button>

              <div className="flex items-center gap-2">
                {[...Array(menus.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === menus.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`min-w-[40px] h-10 rounded-lg font-bold transition-all text-sm ${
                          pageNum === page
                            ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md border border-orange-400"
                            : "bg-white border border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return (
                      <span key={pageNum} className="text-orange-400 px-1 font-bold">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === menus.totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-bold text-gray-700 text-sm"
              >
                <span className="hidden sm:inline">ถัดไป</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
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
        
        @keyframes fade-in-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default StoreDetailFeature;