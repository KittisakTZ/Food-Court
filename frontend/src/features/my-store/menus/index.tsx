// @/features/my-store/menus/index.tsx
import { useAuthStore } from "@/zustand/useAuthStore";
import { useMyStore } from "@/hooks/useStores";
import { useStore } from "@/hooks/useStores"; // Hook ที่ดึงข้อมูลร้านเดียว
import { useMenuCategories, useCreateCategory } from "@/hooks/useMenuCategories";
import { useMenus } from "@/hooks/useMenus"; // Hook ที่เรามีอยู่แล้ว
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuForm } from "../components/MenuForm";

// (สร้าง Component ย่อยๆ เพื่อความสะอาด)
// 1. Component สำหรับจัดการ Categories
const CategoryManager = ({ storeId }: { storeId: string }) => {
    const { data: categories, isLoading } = useMenuCategories(storeId);
    const { mutate: createCat, isPending } = useCreateCategory();
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleCreate = () => {
        if (newCategoryName.trim()) {
            createCat({ storeId, name: newCategoryName });
            setNewCategoryName("");
        }
    };

    if (isLoading) return <p>Loading categories...</p>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
            <h2 className="text-xl font-semibold mb-3">Manage Categories</h2>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    className="flex-grow p-2 border rounded-md"
                />
                <button onClick={handleCreate} disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400">
                    {isPending ? 'Adding...' : 'Add'}
                </button>
            </div>
            <ul className="mt-4 space-y-2">
                {categories?.map(cat => <li key={cat.id} className="p-2 bg-gray-100 rounded-md">{cat.name}</li>)}
            </ul>
        </div>
    );
};


// 2. Component สำหรับแสดงรายการเมนู
const MenuList = ({ storeId }: { storeId: string }) => {
    const { data: menusData, isLoading } = useMenus({ storeId });

    if (isLoading) return <p>Loading menus...</p>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-3">All Menus</h2>
            <div className="space-y-4">
                {menusData?.data.map(menu => (
                    <div key={menu.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                            <img src={menu.image || 'https://via.placeholder.com/60'} alt={menu.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                            <div>
                                <p className="font-semibold">{menu.name}</p>
                                <p className="text-sm text-gray-500">{menu.category?.name || 'Uncategorized'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">${menu.price.toFixed(2)}</p>
                            {/* เพิ่มปุ่ม Edit/Delete ที่นี่ */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Component หลัก
const MenuManagementFeature = () => {
    // 2. เรียกใช้ Hook useMyStore
    const { data: myStore, isLoading: isLoadingStore, isError, error } = useMyStore();

    if (isLoadingStore) {
        return <div className="text-center p-10">Loading your store information...</div>;
    }

    // 3. จัดการ Error Case ที่ดีขึ้น
    if (isError) {
        // (error as any) เพื่อให้ TypeScript ยอมให้เข้าถึง property ที่อาจจะไม่มี
        const errorMessage = (error as any)?.response?.data?.message || error.message;
        if (errorMessage.includes("You do not own a store yet")) {
            return (
                <div className="text-center p-10">
                    <h2 className="text-2xl font-bold">You haven't created a store yet.</h2>
                    <p className="mt-2 text-gray-600">Please create your store first to manage menus.</p>
                    {/* (Optional) เพิ่ม Link ไปหน้าสร้างร้านค้า */}
                </div>
            );
        }
        return <div className="text-center p-10 text-red-500">Error: {errorMessage}</div>;
    }

    // 4. จัดการ Case ที่ไม่ควรเกิดขึ้น (เผื่อไว้)
    if (!myStore) {
        return <div className="text-center p-10">Could not find store data. Please try again.</div>;
    }

    if (isLoadingStore) return <div>Loading...</div>;
    if (!myStore) return <div>You do not have a store.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Menu Management for <span className="text-blue-600">{myStore.name}</span></h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* จัด Layout ใหม่ */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <MenuList storeId={myStore.id} />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                    <CategoryManager storeId={myStore.id} />
                    <MenuForm storeId={myStore.id} /> {/* <-- นำ Form มาใส่ที่นี่ */}
                </div>
            </div>
        </div>
    );
};

export default MenuManagementFeature;