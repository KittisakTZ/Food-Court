// @/features/store-detail/index.tsx

import { useStore } from "@/hooks/useStores";
import { useMenus } from "@/hooks/useMenus";
import { useState } from "react";
import { useCartStore } from "@/zustand/useCartStore";

interface StoreDetailFeatureProps {
    storeId: string;
}

const StoreDetailFeature = ({ storeId }: StoreDetailFeatureProps) => {
    const [page, setPage] = useState(1);
    const { addItem } = useCartStore(); // ดึง action 'addItem' มาใช้
    const { data: store, isLoading: isLoadingStore, isError: isErrorStore } = useStore(storeId); // ดึงข้อมูลร้านค้า
    const { data: menus, isLoading: isLoadingMenus, isError: isErrorMenus } = useMenus({ storeId, page }); // ดึงข้อมูลเมนู

    if (isLoadingStore) return <div>Loading store details...</div>;
    if (isErrorStore) return <div>Error loading store details.</div>;
    if (!store) return <div>Store not found.</div>;

    return (
        <div className="container mx-auto p-4">
            {/* ส่วน Header ของร้าน */}
            <div className="mb-8">
                <img src={store.image || 'https://via.placeholder.com/1200x300'} alt={store.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h1 className="text-4xl font-bold">{store.name}</h1>
                <p className="text-lg text-gray-600">{store.description}</p>
                <p className="text-gray-600 text-sm mt-2">
                    ⭐ {store.avgRating.toFixed(1)} ({store.reviewCount} reviews)
                </p>
            </div>

            {/* ส่วนของเมนู */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Menus</h2>
                {isLoadingMenus && <div>Loading menus...</div>}
                {isErrorMenus && <div>Error loading menus.</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus?.data.map(menu => (
                        <div key={menu.id} className="border rounded-lg p-4 flex">
                            <div className="flex-grow pr-4">
                                <h3 className="text-lg font-semibold">{menu.name}</h3>
                                <p className="text-sm text-gray-500">{menu.description}</p>
                                <p className="mt-2 font-bold text-green-600">${menu.price.toFixed(2)}</p>
                            </div>
                            <img src={menu.image || 'https://via.placeholder.com/100'} alt={menu.name} className="w-24 h-24 object-cover rounded-md" />

                            {/* (ใหม่) เพิ่มปุ่ม Add to Cart */}
                            <button 
                                onClick={() => addItem(menu)}
                                className="ml-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
                {/* (Optional) เพิ่ม Pagination สำหรับเมนูที่นี่ */}
            </div>
        </div>
    );
};

export default StoreDetailFeature;