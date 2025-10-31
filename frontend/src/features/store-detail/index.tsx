// @/features/store-detail/index.tsx

import { useStore } from "@/hooks/useStores";
import { useMenus } from "@/hooks/useMenus";
import { useState } from "react";
import { useAddItemToCart } from "@/hooks/useCart";

interface StoreDetailFeatureProps {
  storeId: string;
}

const StoreDetailFeature = ({ storeId }: StoreDetailFeatureProps) => {
  const [page, setPage] = useState(1);
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
  } = useMenus({ storeId, page });

  const handleAddItem = (menuId: string) => {
    addItem({ menuId, quantity: 1 });
  };

  if (isLoadingStore) return <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูลร้านค้า...</div>;
  if (isErrorStore) return <div className="text-center py-10 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลร้านค้า</div>;
  if (!store) return <div className="text-center py-10 text-gray-500">ไม่พบข้อมูลร้านค้า</div>;

  return (
    <div className="container mx-auto p-4">
      {/* ส่วน Header ของร้าน */}
      <div className="mb-8">
        <img
          src={store.image || "https://via.placeholder.com/1200x300"}
          alt={store.name}
          className="w-full h-56 object-cover rounded-xl shadow-md mb-4"
        />
        <h1 className="text-4xl font-bold text-gray-800">{store.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{store.description}</p>
        <p className="text-gray-600 text-sm mt-2">
          ⭐ {store.avgRating.toFixed(1)} ({store.reviewCount} รีวิว)
        </p>
      </div>

      {/* ส่วนของเมนู */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">เมนูอาหาร</h2>

        {isLoadingMenus && (
          <div className="text-center py-8 text-gray-500">กำลังโหลดเมนู...</div>
        )}
        {isErrorMenus && (
          <div className="text-center py-8 text-red-500">เกิดข้อผิดพลาดในการโหลดเมนู</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus?.data.map((menu) => (
            <div
              key={menu.id}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow p-4 flex flex-col justify-between bg-white"
            >
              <img
                src={menu.image || "https://via.placeholder.com/300"}
                alt={menu.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">
                  {menu.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {menu.description || "ไม่มีคำอธิบาย"}
                </p>
                <p className="mt-3 font-bold text-green-600">
                  ฿{menu.price.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => handleAddItem(menu.id)}
                disabled={isAdding}
                className="mt-4 w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAdding ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
              </button>
            </div>
          ))}
        </div>

        {/* Pagination (ถ้ามี) */}
        {menus?.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: menus.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailFeature;
