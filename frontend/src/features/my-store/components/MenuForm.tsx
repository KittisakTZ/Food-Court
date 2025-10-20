// @/features/my-store/menus/components/MenuForm.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { useMenuCategories } from "@/hooks/useMenuCategories";
import { useCreateMenu } from "@/hooks/useMenus";
import { useState } from "react";

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
}

export const MenuForm = ({ storeId }: MenuFormProps) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<MenuFormInputs>({
        // (แนะนำ) ตั้งค่า defaultValues เพื่อให้ react-hook-form ทำงานได้แม่นยำขึ้น
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            categoryId: "" // <-- ค่าเริ่มต้นเป็น string ว่าง
        }
    });
    const { data: categories } = useMenuCategories(storeId);
    const { mutate: create, isPending } = useCreateMenu();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const onSubmit: SubmitHandler<MenuFormInputs> = (data) => {
        // 1. สร้าง FormData object
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', String(data.price));
        formData.append('categoryId', data.categoryId);
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        // 2. เรียกใช้ Mutation
        create({ storeId, formData }, {
            onSuccess: () => {
                reset();
                setPreviewImage(null);
            }
        });
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4">Add New Menu</h2>
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
                    {previewImage && <img src={previewImage} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md" />}
                </div>
                <button type="submit" disabled={isPending} className="w-full px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400">
                    {isPending ? 'Saving...' : 'Add Menu'}
                </button>
            </form>
        </div>
    );
};