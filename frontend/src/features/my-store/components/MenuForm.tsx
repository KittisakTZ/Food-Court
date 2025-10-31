// @/features/my-store/menus/components/MenuForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useCreateMenu, useUpdateMenu } from "@/hooks/useMenus";
import { useState, useEffect } from "react";
import { Menu } from "@/types/response/menu.response";

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 sticky top-4">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">
        {isEditMode ? `แก้ไขเมนู: ${initialData?.name}` : "เพิ่มเมนูใหม่"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ชื่อเมนู */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            ชื่อเมนู <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            placeholder="กรอกชื่อเมนู เช่น ข้าวกะเพราไก่"
            {...register("name", { required: "กรุณากรอกชื่อเมนู" })}
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* รายละเอียดเมนู */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
            รายละเอียด
          </label>
          <textarea
            id="description"
            placeholder="กรอกรายละเอียดของเมนู เช่น วัตถุดิบหรือรสชาติ"
            {...register("description")}
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ราคา */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-700">
            ราคา (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            placeholder="เช่น 45.00"
            {...register("price", { required: "กรุณากรอกราคา", valueAsNumber: true })}
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700">
            หมวดหมู่เมนู <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register("categoryId", {
              required: "กรุณาเลือกหมวดหมู่เมนู",
              validate: (value) => value !== "" || "กรุณาเลือกหมวดหมู่ที่ถูกต้อง",
            })}
            className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* รูปภาพเมนู */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-gray-700">
            รูปภาพเมนู
          </label>
          <input
            id="image"
            type="file"
            accept="image/png, image/jpeg"
            {...register("image")}
            onChange={handleImageChange}
            className="mt-1 w-full text-sm text-gray-600"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="mt-3 h-28 w-28 object-cover rounded-md border shadow-sm"
            />
          )}
        </div>

        {/* ปุ่ม */}
        <div className="flex space-x-3 pt-2">
          {isEditMode && (
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
            >
              ยกเลิก
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:bg-gray-400 transition-colors"
          >
            {isPending
              ? "กำลังบันทึก..."
              : isEditMode
              ? "บันทึกการแก้ไข"
              : "เพิ่มเมนู"}
          </button>
        </div>
      </form>
    </div>
  );
};
