// @/features/my-store/menus/components/MenuForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useCreateMenu, useUpdateMenu } from "@/hooks/useMenus";
import { useState, useEffect } from "react";
import { Menu } from "@/types/response/menu.response";
import { MdRestaurant, MdCategory, MdCheckCircle, MdClose } from "react-icons/md";
import { FiFileText, FiImage, FiUploadCloud, FiX } from "react-icons/fi";

type MenuFormInputs = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: FileList;
};

interface MenuFormProps {
  storeId: string;
  initialData?: Menu | null;
  onComplete: () => void;
}

export const MenuForm = ({ storeId, initialData, onComplete }: MenuFormProps) => {
  const isEditMode = !!initialData;
  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<MenuFormInputs>();
  const { data: categories } = useMenuCategories(storeId);
  const { mutate: create, isPending: isCreating } = useCreateMenu();
  const { mutate: update, isPending: isUpdating } = useUpdateMenu();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isPending = isCreating || isUpdating;

  // โหลดข้อมูลเมื่ออยู่ในโหมดแก้ไข
  useEffect(() => {
    if (isEditMode && initialData) {
      setValue("name", initialData.name);
      setValue("description", initialData.description || "");
      setValue("price", initialData.price);
      setValue("categoryId", initialData.categoryId || "");
      setPreviewImage(initialData.image || null);
    } else {
      reset();
      setPreviewImage(null);
    }
  }, [initialData, isEditMode, setValue, reset]);

  const onSubmit: SubmitHandler<MenuFormInputs> = (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("categoryId", data.categoryId);
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }

    if (isEditMode && initialData) {
      update(
        { storeId, menuId: initialData.id, formData },
        { onSuccess: () => onComplete() }
      );
    } else {
      create({ storeId, formData }, { onSuccess: () => onComplete() });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setValue("image", new DataTransfer().files);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MdRestaurant className="w-7 h-7" />
          {isEditMode ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
        </h2>
        {isEditMode && initialData && (
          <p className="text-orange-100 text-sm mt-1">
            กำลังแก้ไข: <span className="font-semibold">{initialData.name}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {/* ชื่อเมนู */}
        <div>
          <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <MdRestaurant className="w-5 h-5 text-orange-600" />
            ชื่อเมนู <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="เช่น ข้าวกะเพราไก่"
            {...register("name", { required: "กรุณากรอกชื่อเมนู" })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium">
              <FiX className="w-4 h-4" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* รายละเอียดเมนู */}
        <div>
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <FiFileText className="w-5 h-5 text-orange-600" />
            รายละเอียดเมนู
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="บรรยายเกี่ยวกับเมนู เช่น วัตถุดิบ รสชาติ..."
            {...register("description")}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base resize-none shadow-sm"
          />
        </div>

        {/* ราคา */}
        <div>
          <label htmlFor="price" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <span className="text-orange-600 font-bold text-lg">฿</span>
            ราคา (บาท) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-lg">฿</span>
            <input
              id="price"
              type="number"
              step="1"
              min="0"
              placeholder="45"
              {...register("price", { required: "กรุณากรอกราคา", valueAsNumber: true })}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm"
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium">
              <FiX className="w-4 h-4" />
              {errors.price.message}
            </p>
          )}
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label htmlFor="categoryId" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <MdCategory className="w-5 h-5 text-orange-600" />
            หมวดหมู่เมนู <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register("categoryId", {
              required: "กรุณาเลือกหมวดหมู่เมนู",
              validate: (value) => value !== "" || "กรุณาเลือกหมวดหมู่ที่ถูกต้อง",
            })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm bg-white"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium">
              <FiX className="w-4 h-4" />
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* รูปภาพเมนู */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <FiImage className="w-5 h-5 text-orange-600" />
            รูปภาพเมนู
          </label>

          {previewImage ? (
            <div className="relative group">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl shadow-md border-2 border-orange-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-orange-50/30 hover:bg-orange-50/50 hover:border-orange-400"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiUploadCloud className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">คลิกเพื่อเลือกรูปภาพ</p>
                <p className="text-xs text-gray-500">PNG หรือ JPG (ไม่เกิน 5MB)</p>
              </div>
              <input
                id="image"
                type="file"
                accept="image/png, image/jpeg"
                {...register("image")}
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* ปุ่ม */}
        <div className="flex gap-3 pt-4">
          {isEditMode && (
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <MdClose className="w-5 h-5" />
              ยกเลิก
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold rounded-xl disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2 shadow-md"
          >
            {isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <MdCheckCircle className="w-5 h-5" />
                <span>{isEditMode ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
