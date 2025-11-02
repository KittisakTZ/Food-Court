// @/features/my-store/menus/index.tsx
import { useMyStore } from "@/hooks/useStores";
import { useMenuCategories, useCreateCategory } from "@/hooks/useMenuCategories";
import { useMenus, useDeleteMenu } from "@/hooks/useMenus";
import { useState } from "react";
import { Menu } from "@/types/response/menu.response";
import { MenuForm } from "../components/MenuForm";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { MdRestaurant, MdCategory, MdClose } from "react-icons/md";

const CategoryManager = ({ storeId }: { storeId: string }) => {
  const { data: categories, isLoading } = useMenuCategories(storeId);
  const { mutate: createCat, isPending } = useCreateCategory();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createCat({ storeId, name: newCategoryName });
      setNewCategoryName("");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MdCategory className="w-5 h-5" />
          หมวดหมู่เมนู
        </h2>
        <p className="text-orange-100 text-sm mt-1">
          {categories?.length || 0} หมวดหมู่
        </p>
      </div>

      <div className="p-5">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="เพิ่มหมวดหมู่ใหม่..."
            className="flex-grow px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all text-sm"
          />
          <button 
            onClick={handleCreate} 
            disabled={isPending || !newCategoryName.trim()}
            className="px-5 py-2.5 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
          >
            <FiPlus className="w-4 h-4" />
            {isPending ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
          </button>
        </div>
        
        <div className={`space-y-2 transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-48'} overflow-y-auto`}>
          {categories?.length === 0 ? (
            <div className="text-center py-8">
              <MdCategory className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">ยังไม่มีหมวดหมู่</p>
            </div>
          ) : (
            categories?.map(cat => (
              <div 
                key={cat.id} 
                className="group p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-3 border border-orange-100 cursor-pointer"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="font-medium text-gray-800 text-sm flex-grow">{cat.name}</span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  แตะเพื่อเลือก
                </span>
              </div>
            ))
          )}
        </div>

        {categories && categories.length > 4 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {isExpanded ? 'แสดงน้อยลง' : `แสดงทั้งหมด (${categories.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

const MenuList = ({ storeId, onEdit }: { storeId: string, onEdit: (menu: Menu) => void }) => {
  const { data: menusData, isLoading } = useMenus({ storeId });
  const { mutate: deleteItem, isPending } = useDeleteMenu();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleDelete = (menuId: string, menuName: string) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการลบเมนู "${menuName}" ใช่หรือไม่?`)) {
      deleteItem({ storeId, menuId });
    }
  };

  const filteredMenus = menusData?.data.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || menu.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MdRestaurant className="w-7 h-7" />
              เมนูทั้งหมด
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {filteredMenus?.length || 0} รายการ
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเมนู..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-orange-300 outline-none transition-all text-gray-700"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Menu List */}
      <div className="p-6">
        {filteredMenus?.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdRestaurant className="w-12 h-12 text-orange-300" />
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">
              {searchTerm ? 'ไม่พบเมนูที่ค้นหา' : 'ยังไม่มีเมนู'}
            </p>
            <p className="text-gray-400 text-sm">
              {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มสร้างเมนูแรกของคุณได้เลย'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMenus?.map((menu, index) => (
              <div 
                key={menu.id} 
                className="group relative flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 bg-white animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl flex-shrink-0">
                  <img 
                    src={menu.image || 'https://via.placeholder.com/80'} 
                    alt={menu.name} 
                    className="w-24 h-24 object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-800 truncate mb-1">
                    {menu.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md">
                      <MdCategory className="w-4 h-4 text-orange-500" />
                      {menu.category?.name || 'ไม่มีหมวดหมู่'}
                    </span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      ฿{menu.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(menu)} 
                      className="p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow active:scale-95"
                      title="แก้ไข"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(menu.id, menu.name)}
                      disabled={isPending}
                      className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-all shadow-sm hover:shadow active:scale-95"
                      title="ลบ"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MenuManagementFeature = () => {
  const { data: myStore, isLoading: isLoadingStore } = useMyStore();
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!myStore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdRestaurant className="w-10 h-10 text-orange-300" />
          </div>
          <p className="text-xl text-gray-800 font-bold mb-2">คุณยังไม่มีร้านค้า</p>
          <p className="text-gray-500 text-sm">กรุณาสร้างร้านค้าก่อนเพื่อจัดการเมนู</p>
        </div>
      </div>
    );
  }

  const handleFormComplete = () => {
    setEditingMenu(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <MdRestaurant className="w-10 h-10" />
                    จัดการเมนู
                  </h1>
                  <p className="text-orange-100 text-lg">
                    ร้าน <span className="font-semibold">{myStore.name}</span>
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-6 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">12</p>
                    <p className="text-orange-100 text-sm">เมนู</p>
                  </div>
                  <div className="w-px h-12 bg-white/30"></div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">5</p>
                    <p className="text-orange-100 text-sm">หมวดหมู่</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Menu List */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <MenuList storeId={myStore.id} onEdit={setEditingMenu} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2 space-y-6 lg:sticky lg:top-6">
            <CategoryManager storeId={myStore.id} />
            <MenuForm
              storeId={myStore.id}
              initialData={editingMenu}
              onComplete={handleFormComplete}
            />
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default MenuManagementFeature;