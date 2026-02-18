// @/features/my-store/create/index.tsx
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mainApi from "@/apis/main.api";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";
import { useState, useEffect } from "react";
import { FiUploadCloud, FiX, FiMapPin, FiCreditCard, FiFileText, FiImage } from "react-icons/fi";
import { MdStorefront, MdCheckCircle } from "react-icons/md";

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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                                        <MdStorefront className="w-10 h-10" />
                                        สร้างร้านค้าของคุณ
                                    </h1>
                                    <p className="text-orange-100 text-lg mt-2">
                                        กรอกข้อมูลร้านค้าและส่งเพื่อรอการอนุมัติ
                                    </p>
                                </div>
                                <div className="hidden md:block bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                                    <MdStorefront className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Image Upload Card */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiImage className="w-5 h-5" />
                                รูปภาพร้านค้า
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-center items-center px-6 pt-8 pb-8 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30 hover:bg-orange-50/50 hover:border-orange-300">
                                {imagePreview ? (
                                    <div className="relative group w-full">
                                        <div className="max-w-md mx-auto">
                                            <img
                                                src={imagePreview}
                                                alt="Store preview"
                                                className="rounded-xl object-cover h-64 w-full shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-3 right-3 p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600"
                                                aria-label="Remove image"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 text-center py-8">
                                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                                            <FiUploadCloud className="w-10 h-10 text-orange-500" />
                                        </div>
                                        <div className="flex justify-center text-base text-gray-700">
                                            <label
                                                htmlFor="image-upload"
                                                className="relative cursor-pointer font-bold text-orange-600 hover:text-orange-700 px-3 py-2 bg-orange-100 rounded-lg hover:bg-orange-200"
                                            >
                                                <span>เลือกไฟล์รูปภาพ</span>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    accept="image/png, image/jpeg"
                                                    {...register("image")}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">
                                            PNG หรือ JPG (ขนาดไม่เกิน 5MB)
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            แนะนำขนาด 1200x600 พิกเซล
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiFileText className="w-5 h-5" />
                                ข้อมูลร้านค้า
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Store Name */}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <MdStorefront className="w-5 h-5 text-orange-600" />
                                    ชื่อร้านค้า <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    {...register("name", { required: "กรุณากรอกชื่อร้านค้า" })}
                                    placeholder="เช่น ร้านอาหารตามสั่ง"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium"><FiX className="w-4 h-4" />{errors.name.message}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiFileText className="w-5 h-5 text-orange-600" />
                                    คำอธิบายร้านค้า
                                </label>
                                <textarea
                                    id="description"
                                    {...register("description")}
                                    rows={4}
                                    placeholder="บรรยายเกี่ยวกับร้านค้าของคุณ เช่น ประเภทอาหาร จุดเด่น..."
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base resize-none shadow-sm"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiMapPin className="w-5 h-5 text-orange-600" />
                                    ที่ตั้ง
                                </label>
                                <input
                                    id="location"
                                    {...register("location")}
                                    placeholder="เช่น โซนอาหาร ชั้น 2"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm"
                                />
                            </div>

                            {/* PromptPay ID */}
                            <div>
                                <label htmlFor="promptPayId" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiCreditCard className="w-5 h-5 text-orange-600" />
                                    PromptPay ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="promptPayId"
                                    {...register("promptPayId", { required: "กรุณากรอก PromptPay ID" })}
                                    placeholder="เบอร์โทรศัพท์หรือเลขบัตรประชาชน"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm"
                                />
                                {errors.promptPayId && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium"><FiX className="w-4 h-4" />{errors.promptPayId.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 p-6">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-xl rounded-xl disabled:from-gray-400 disabled:to-gray-500 hover:from-orange-600 hover:to-yellow-600 shadow-md hover:shadow-xl flex items-center justify-center gap-3"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>กำลังสร้างร้านค้า...</span>
                                </>
                            ) : (
                                <>
                                    <MdCheckCircle className="w-7 h-7" />
                                    <span>ส่งเพื่อรอการอนุมัติ</span>
                                </>
                            )}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            ระบบจะตรวจสอบและอนุมัติร้านค้าภายใน 1-2 วันทำการ
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStoreFeature;