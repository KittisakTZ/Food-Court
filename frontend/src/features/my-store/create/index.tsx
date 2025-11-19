// @/features/my-store/create/index.tsx (ไฟล์แก้ไขแล้ว)
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mainApi from "@/apis/main.api";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";
import { useState, useEffect } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi"; // ไอคอนสวยๆ

// ประเภทข้อมูลสำหรับฟอร์ม
type StoreFormInputs = {
    name: string;
    description: string;
    location: string;
    promptPayId: string;
    image: FileList; // react-hook-form จะให้ค่าเป็น FileList
};

// 🔄 CHANGED: ฟังก์ชันเรียก API ถูกปรับให้รับ StoreFormInputs และสร้าง FormData ภายใน
const createStore = async (payload: StoreFormInputs) => {
    // 1. สร้าง FormData object
    const formData = new FormData();

    // 2. เพิ่มข้อมูล text ลงไป
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('location', payload.location);
    formData.append('promptPayId', payload.promptPayId);

    // 3. ตรวจสอบและเพิ่มไฟล์รูปภาพ (ถ้ามี)
    // Backend คาดหวัง field ที่ชื่อว่า 'image'
    if (payload.image && payload.image.length > 0) {
        formData.append('image', payload.image[0]);
    }

    // 4. ส่ง request แบบ multipart/form-data
    // Axios จะตั้งค่า Content-Type ให้โดยอัตโนมัติเมื่อเราส่ง FormData
    const { data: response } = await mainApi.post("/v1/stores", formData);
    return response;
};


const CreateStoreFeature = () => {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<StoreFormInputs>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ✅ ADDED: State สำหรับแสดงตัวอย่างรูปภาพ
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // ดูค่าของ field 'image' เพื่ออัปเดต preview
    const imageFile = watch("image");

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const newPreviewUrl = URL.createObjectURL(file);
            setImagePreview(newPreviewUrl);

            // Cleanup function เพื่อป้องกัน memory leak
            return () => URL.revokeObjectURL(newPreviewUrl);
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);


    const { mutate, isPending } = useMutation({
        mutationFn: createStore,
        onSuccess: () => {
            toastService.success("สร้างร้านค้าสำเร็จ! กำลังรอการอนุมัติจากผู้ดูแลระบบ");
            // บอกให้ react-query ไปดึงข้อมูล my-store มาใหม่ในครั้งถัดไป
            queryClient.invalidateQueries({ queryKey: ['my-store'] });
            navigate("/"); // กลับไปหน้า Dashboard หรือหน้าร้านของฉัน
        },
        onError: (error: any) => {
            // แสดงข้อความ error จาก backend ถ้ามี
            const errorMessage = error.response?.data?.message || "An unexpected error occurred";
            toastService.error(`สร้างร้านค้าไม่สำเร็จ: ${errorMessage}`);
        }
    });

    // 🔄 CHANGED: onSubmit ไม่ต้องแปลงข้อมูลอีกต่อไป ส่ง data ตรงๆ ได้เลย
    const onSubmit: SubmitHandler<StoreFormInputs> = (data) => {
        mutate(data);
    };

    const removeImage = () => {
        setValue("image", new DataTransfer().files); // เคลียร์ค่าใน form
        setImagePreview(null);
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-3xl">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">สร้างร้านค้าของคุณ</h1>
                    <p className="text-gray-500 mt-2">กรอกข้อมูลร้านค้าและส่งเพื่อรอการอนุมัติ</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            รูปภาพร้านค้า (โลโก้/แบนเนอร์)
                        </label>
                        <div className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                            {imagePreview ? (
                                <div className="relative group w-full h-48">
                                    <img src={imagePreview} alt="Store preview" className="rounded-lg object-contain h-full w-full" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Remove image"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                            <span>อัปโหลดไฟล์</span>
                                            <input id="image-upload" type="file" accept="image/png, image/jpeg" {...register("image")} className="sr-only" />
                                        </label>
                                        <p className="pl-1">หรือลากและวาง</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG ไม่เกิน 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">ชื่อร้านค้า</label>
                        <input id="name" {...register("name", { required: "กรุณากรอกชื่อร้านค้า" })} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบายร้านค้า</label>
                        <textarea id="description" {...register("description")} rows={4} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">ที่ตั้ง</label>
                        <input id="location" {...register("location")} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="promptPayId" className="block text-sm font-medium text-gray-700">PromptPay ID</label>
                        <input id="promptPayId" {...register("promptPayId", { required: "กรุณากรอก PromptPay ID" })} className="mt-1 block w-full p-3 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500" />
                        {errors.promptPayId && <p className="text-red-500 text-sm mt-1">{errors.promptPayId.message}</p>}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isPending} className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-lg rounded-xl disabled:from-gray-400 disabled:to-gray-500 hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                        {isPending ? 'กำลังสร้างร้านค้า...' : 'ส่งเพื่อรอการอนุมัติ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateStoreFeature;