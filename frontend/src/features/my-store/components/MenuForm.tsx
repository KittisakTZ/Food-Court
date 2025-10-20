// @/features/my-store/menus/components/MenuForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useCreateMenu, useUpdateMenu } from "@/hooks/useMenus";
import { useState, useEffect } from "react"; // Import useEffect
import { Menu } from "@/types/response/menu.response"; // Import Menu type

// Type สำหรับข้อมูลในฟอร์ม
type MenuFormInputs = {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    image: FileList;
};

interface MenuFormProps {
    storeId: string;
    initialData?: Menu | null; // <-- (ใหม่) รับข้อมูลเริ่มต้นสำหรับโหมดแก้ไข
    onComplete: () => void;      // <-- (ใหม่) Callback เมื่อทำงานเสร็จ
}

export const MenuForm = ({ storeId, initialData, onComplete }: MenuFormProps) => {
    const isEditMode = !!initialData; // เช็คว่าเป็นโหมดแก้ไขหรือไม่

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MenuFormInputs>();

    // **useEffect:** เมื่อ initialData เปลี่ยน (เช่น user กด edit), ให้ตั้งค่า default ให้ฟอร์ม
    useEffect(() => {
        if (isEditMode && initialData) {
            setValue('name', initialData.name);
            setValue('description', initialData.description || '');
            setValue('price', initialData.price);
            setValue('categoryId', initialData.categoryId || '');
            setPreviewImage(initialData.image || null);
        } else {
            // ถ้าไม่ใช่โหมด Edit (เช่น กด cancel), ให้ล้างฟอร์ม
            reset();
            setPreviewImage(null);
        }
    }, [initialData, isEditMode, setValue, reset]);

    const { data: categories } = useMenuCategories(storeId);
    const { mutate: create, isPending: isCreating } = useCreateMenu();
    const { mutate: update, isPending: isUpdating } = useUpdateMenu(); // Hook สำหรับอัปเดต
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const isPending = isCreating || isUpdating;

    const onSubmit: SubmitHandler<MenuFormInputs> = (data) => {
        const formData = new FormData();
        // Append data ที่มีการเปลี่ยนแปลง (หรือทั้งหมด)
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', String(data.price));
        formData.append('categoryId', data.categoryId);
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        if (isEditMode && initialData) {
            // --- โหมดแก้ไข ---
            update({ storeId, menuId: initialData.id, formData }, {
                onSuccess: () => {
                    onComplete(); // เรียก callback เพื่อปิดฟอร์ม
                }
            });
        } else {
            // --- โหมดสร้างใหม่ ---
            create({ storeId, formData }, {
                onSuccess: () => {
                    onComplete(); // เรียก callback เพื่อล้างฟอร์ม
                }
            });
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border sticky top-4">
            <h2 className="text-xl font-semibold mb-4">{isEditMode ? `Editing: ${initialData.name}` : 'Add New Menu'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input id="name" {...register("name", { required: "Name is required" })} className="mt-1 block w-full p-2 border rounded-md" />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" {...register("description")} className="mt-1 block w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input id="price" type="number" step="0.01" {...register("price", { required: "Price is required", valueAsNumber: true })} className="mt-1 block w-full p-2 border rounded-md" />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        id="categoryId"
                        // **ตรวจสอบ Validation Rule ตรงนี้ให้แน่ใจ**
                        {...register("categoryId", {
                            required: "Please select a category",
                            validate: value => value !== "" || "Please select a valid category" // **เพิ่ม Custom Validation**
                        })}
                        className="mt-1 block w-full p-2 border rounded-md"
                    >
                        {/* **ตรวจสอบ Option แรก** */}
                        <option value="" disabled>Select a category</option>
                        {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                    <input id="image" type="file" accept="image/png, image/jpeg" {...register("image")} onChange={handleImageChange} className="mt-1 block w-full text-sm" />
                    {previewImage && <img src={previewImage} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md"/>}
                </div>
                <div className="flex space-x-2">
                    {isEditMode && (
                        <button type="button" onClick={onComplete} className="flex-1 px-4 py-2 bg-gray-200 text-black rounded-md">
                            Cancel
                        </button>
                    )}
                    <button type="submit" disabled={isPending} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400">
                        {isPending ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Menu')}
                    </button>
                </div>
            </form>
        </div>
    );
};