// @/features/home/components/BuyerDashboard.tsx

import { useStores } from "@/hooks/useStores";
import { useState } from "react";
import { Link } from "react-router-dom";

export const BuyerDashboard = () => {
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");

    // ใช้ Hook ของเราเพื่อดึงข้อมูล
    const { data, isLoading, isError, error } = useStores({ page, pageSize: 12, searchText });

    if (isLoading) {
        return <div>Loading stores...</div>;
    }

    if (isError) {
        return <div>Error loading stores: {error.message}</div>;
    }

    // เมื่อมีข้อมูลแล้ว
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Welcome, BUYER! Find a store to order from.</h1>
            
            {/* ส่วนของ Search Box */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for a store..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* ส่วนแสดงผลร้านค้า */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.data.map((store) => (
                    // (แก้ไข) หุ้ม Card ทั้งหมดด้วย Component <Link>
                    <Link to={`/stores/${store.id}`} key={store.id}>
                        <div className="border rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow h-full">
                            <img 
                                src={store.image || 'https://via.placeholder.com/300x200'} 
                                alt={store.name} 
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold truncate">{store.name}</h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    ⭐ {store.avgRating.toFixed(1)} ({store.reviewCount} reviews)
                                </p>
                                <p className={`mt-2 text-sm font-medium ${store.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                    {store.isOpen ? 'Open Now' : 'Closed'}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ส่วนของ Pagination (แบบง่ายๆ) */}
            <div className="flex justify-center mt-8 space-x-4">
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {data?.currentPage} of {data?.totalPages}</span>
                <button
                    onClick={() => setPage(p => (data?.currentPage ?? 1) < (data?.totalPages ?? 1) ? p + 1 : p)}
                    disabled={page === data?.totalPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};