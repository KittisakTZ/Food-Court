// @/features/my-store/menus/index.tsx
// import { useAuthStore } from "@/zustand/useAuthStore";
import { useMyStore } from "@/hooks/useStores";
import { useMenuCategories, useCreateCategory } from "@/hooks/useMenuCategories";
import { useMenus, useDeleteMenu } from "@/hooks/useMenus";
import { useState } from "react";
import { Menu } from "@/types/response/menu.response";
import { MenuForm } from "../components/MenuForm";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdRestaurant, MdCategory } from "react-icons/md";

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

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <p className="text-gray-500 text-center">กำลังโหลดหมวดหมู่...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <MdCategory className="w-6 h-6 text-orange-500" />
        จัดการหมวดหมู่
      </h2>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="ชื่อหมวดหมู่ใหม่"
            className="flex-grow px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
          />
          <button 
            onClick={handleCreate} 
            disabled={isPending || !newCategoryName.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            {isPending ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
          </button>
        </div>
        
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {categories?.length === 0 ? (
            <p className="text-center text-gray-400 py-4">ยังไม่มีหมวดหมู่</p>
          ) : (
            categories?.map(cat => (
              <div 
                key={cat.id} 
                className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl hover:from-orange-100 hover:to-yellow-100 transition-all flex items-center gap-3 border border-orange-200"
              >
                <MdCategory className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-800">{cat.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MenuList = ({ storeId, onEdit }: { storeId: string, onEdit: (menu: Menu) => void }) => {
  const { data: menusData, isLoading } = useMenus({ storeId });
  const { mutate: deleteItem, isPending } = useDeleteMenu();

  const handleDelete = (menuId: string, menuName: string) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบเมนู "${menuName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้`)) {
      deleteItem({ storeId, menuId });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <p className="text-gray-500 text-center">กำลังโหลดเมนู...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <MdRestaurant className="w-6 h-6 text-orange-500" />
        รายการเมนูทั้งหมด
      </h2>
      
      {menusData?.data.length === 0 ? (
        <div className="text-center py-12">
          <MdRestaurant className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">ยังไม่มีเมนู</p>
          <p className="text-gray-400 text-sm">เริ่มสร้างเมนูแรกของคุณได้เลย</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {menusData?.data.map(menu => (
            <div 
              key={menu.id} 
              className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-orange-50/30"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="relative group">
                  <img 
                    src={menu.image || 'https://via.placeholder.com/80'} 
                    alt={menu.name} 
                    className="w-20 h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all"></div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800">{menu.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MdCategory className="w-4 h-4" />
                    {menu.category?.name || 'ไม่มีหมวดหมู่'}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-4">
                <p className="text-2xl font-bold text-orange-600">฿{menu.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(menu)} 
                    className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                    title="แก้ไข"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(menu.id, menu.name)}
                    disabled={isPending}
                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
                    title="ลบ"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuManagementFeature = () => {
  const { data: myStore, isLoading: isLoadingStore } = useMyStore();
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!myStore) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <MdRestaurant className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-800 font-medium">คุณยังไม่มีร้านค้า</p>
        </div>
      </div>
    );
  }

  const handleFormComplete = () => {
    setEditingMenu(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-yellow-500 p-8 rounded-3xl shadow-lg text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <MdRestaurant className="w-10 h-10" />
          จัดการเมนู
        </h1>
        <p className="text-orange-100 text-lg">
          ร้าน <span className="font-semibold">{myStore.name}</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Menu List */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <MenuList storeId={myStore.id} onEdit={setEditingMenu} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <CategoryManager storeId={myStore.id} />
          <MenuForm
            storeId={myStore.id}
            initialData={editingMenu}
            onComplete={handleFormComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuManagementFeature;