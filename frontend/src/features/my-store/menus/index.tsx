// @/features/my-store/menus/index.tsx
import { useMyStore } from "@/hooks/useStores";
import { useMenuCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useMenuCategories";
import { useMenus, useDeleteMenu } from "@/hooks/useMenus";
import { useState } from "react";
import { Menu } from "@/types/response/menu.response";
import { MenuForm } from "../components/MenuForm";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiSave, FiX } from "react-icons/fi";
import { MdRestaurant, MdCategory, MdClose } from "react-icons/md";
import { ConfirmationDialog } from "@/components/customs/ConfirmationDialog";
import { type MenuType, MENU_TYPE_LABEL, MENU_TYPE_EMOJI, MENU_TYPE_DEFAULT_COOKING_TIME } from "@/services/menuCategory.service";
import { NO_FOOD_IMAGE, onImgError } from "@/utils/imageUtils";

const MENU_TYPE_OPTIONS = (Object.keys(MENU_TYPE_LABEL) as MenuType[]).map(type => ({
  value: type,
  label: `${MENU_TYPE_EMOJI[type]} ${MENU_TYPE_LABEL[type]}`,
  hint: `เวลาทำ ~${MENU_TYPE_DEFAULT_COOKING_TIME[type]} นาที`,
}));

const CategoryManager = ({ storeId }: { storeId: string }) => {
  const { data: categories, isLoading } = useMenuCategories(storeId);
  const { mutate: createCat, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCat, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCat, isPending: isDeleting } = useDeleteCategory();

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<MenuType>("OTHER");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryType, setEditingCategoryType] = useState<MenuType>("OTHER");
  const [isExpanded, setIsExpanded] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  const handleCreate = () => {
    if (newCategoryName.trim()) {
      createCat({ storeId, name: newCategoryName, menuType: newCategoryType });
      setNewCategoryName("");
      setNewCategoryType("OTHER");
    }
  };

  const handleDelete = (categoryId: string, categoryName: string) => {
    setDialogState({
      isOpen: true,
      title: "Confirm Deletion",
      description: `คุณแน่ใจว่าต้องการลบหมวดหมู่ "${categoryName}" ใช่หรือไม่?`,
      onConfirm: () => deleteCat({ storeId, categoryId }),
    });
  };

  const handleEdit = (category: { id: string; name: string; menuType: MenuType }) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryType(category.menuType);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategoryType("OTHER");
  };

  const handleUpdate = () => {
    if (editingCategoryId && editingCategoryName.trim()) {
      updateCat({ storeId, categoryId: editingCategoryId, name: editingCategoryName, menuType: editingCategoryType });
      handleCancelEdit();
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

  const closeDialog = () => {
    setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={dialogState.onConfirm!}
        title={dialogState.title}
        description={dialogState.description}
      />
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MdCategory className="w-6 h-6" />
              หมวดหมู่เมนู
            </h2>
            <p className="text-orange-100 text-sm mt-1 flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                {categories?.length || 0}
              </span>
              หมวดหมู่
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <MdCategory className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-orange-50 to-white">
        {/* Create new category */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex gap-2">
            <select
              value={newCategoryType}
              onChange={(e) => setNewCategoryType(e.target.value as MenuType)}
              className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm bg-white shadow-sm"
            >
              {MENU_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="ชื่อหมวดหมู่..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm bg-white shadow-sm"
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !newCategoryName.trim()}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md"
            >
              <FiPlus className="w-5 h-5" />
              <span>{isCreating ? '...' : 'เพิ่ม'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 pl-1">
            เวลาทำเริ่มต้น: {MENU_TYPE_EMOJI[newCategoryType]} {MENU_TYPE_LABEL[newCategoryType]} = <span className="font-semibold text-orange-500">{MENU_TYPE_DEFAULT_COOKING_TIME[newCategoryType]} นาที</span>
          </p>
        </div>

        <div className={`space-y-2 ${isExpanded ? 'max-h-96' : 'max-h-52'} overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent`}>
          {categories?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MdCategory className="w-8 h-8 text-orange-300" />
              </div>
              <p className="text-gray-500 font-medium">ยังไม่มีหมวดหมู่</p>
              <p className="text-gray-400 text-sm mt-1">เริ่มเพิ่มหมวดหมู่แรกของคุณ</p>
            </div>
          ) : (
            categories?.map(cat => (
              <div
                key={cat.id}
                className="group p-3 bg-white rounded-xl hover:bg-orange-50 flex items-center gap-3 border-2 border-gray-100 hover:border-orange-200 shadow-sm"
              >
                {editingCategoryId === cat.id ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <select
                        value={editingCategoryType}
                        onChange={(e) => setEditingCategoryType(e.target.value as MenuType)}
                        className="px-2 py-2 border-2 border-orange-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        {MENU_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                        className="flex-1 px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none text-sm font-medium"
                        autoFocus
                      />
                      <button onClick={handleUpdate} disabled={isUpdating} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300">
                        <FiSave className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancelEdit} className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-xl flex-shrink-0">{MENU_TYPE_EMOJI[cat.menuType]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">{MENU_TYPE_LABEL[cat.menuType]} · {MENU_TYPE_DEFAULT_COOKING_TIME[cat.menuType]} นาที</p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit({ ...cat, menuType: cat.menuType as MenuType })}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="แก้ไข"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={isDeleting}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-400"
                        title="ลบ"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
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
    const [dialogState, setDialogState] = useState<{
      isOpen: boolean;
      title: string;
      description: string;
      onConfirm: (() => void) | null;
    }>({
      isOpen: false,
      title: '',
      description: '',
      onConfirm: null,
    });

    const handleDelete = (menuId: string, menuName: string) => {
      setDialogState({
        isOpen: true,
        title: "Confirm Deletion",
        description: `คุณแน่ใจว่าต้องการลบเมนู "${menuName}" ใช่หรือไม่?`,
        onConfirm: () => deleteItem({ storeId, menuId }),
      });
    };

    const filteredMenus = menusData?.data.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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

    const closeDialog = () => {
      setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
        <ConfirmationDialog
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          onConfirm={dialogState.onConfirm!}
          title={dialogState.title}
          description={dialogState.description}
        />
        {/* Header Section */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <MdRestaurant className="w-8 h-8" />
                เมนูทั้งหมด
              </h2>
              <p className="text-orange-100 text-sm mt-2 flex items-center gap-2">
                <span className="bg-white/20 px-3 py-0.5 rounded-full font-semibold">
                  {filteredMenus?.length || 0}
                </span>
                รายการ
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <MdRestaurant className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเมนูที่ต้องการ..."
              className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-white/50 focus:ring-2 focus:ring-white focus:border-white outline-none text-gray-700 font-medium placeholder-gray-400 shadow-sm bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-lg"
              >
                <MdClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Menu List */}
        <div className="p-6 bg-gradient-to-b from-orange-50 to-white">
          {filteredMenus?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <MdRestaurant className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-gray-700 text-xl font-bold mb-2">
                {searchTerm ? 'ไม่พบเมนูที่ค้นหา' : 'ยังไม่มีเมนู'}
              </p>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มสร้างเมนูแรกของคุณได้เลย'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMenus?.map((menu) => (
                <div
                  key={menu.id}
                  className="group relative flex items-center gap-5 p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-300 hover:shadow-xl shadow-md"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-2xl flex-shrink-0 shadow-md">
                    <img
                      src={menu.image || NO_FOOD_IMAGE}
                      alt={menu.name}
                      className="w-28 h-28 object-cover"
                      onError={onImgError(NO_FOOD_IMAGE)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-800 truncate mb-2">
                      {menu.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200">
                        <MdCategory className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-700">
                          {menu.category?.name || 'ไม่มีหมวดหมู่'}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-right bg-gradient-to-br from-orange-50 to-yellow-50 px-5 py-3 rounded-xl border-2 border-orange-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">ราคา</p>
                      <p className="text-3xl font-black text-orange-600">
                        ฿{menu.price.toFixed(0)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(menu)}
                        className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg"
                        title="แก้ไข"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id, menu.name)}
                        disabled={isPending}
                        className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 shadow-md hover:shadow-lg"
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
      </div>
    );
  };

export default MenuManagementFeature;