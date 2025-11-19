import {
    useMyStore,
    useUpdateMyStore,
    useToggleMyStoreStatus,
} from "@/hooks/useStores";
import { useForm, SubmitHandler } from "react-hook-form";
// *** เพิ่ม useState สำหรับการจัดการ Feedback ***
import { ChangeEvent, useEffect, useState } from "react";
import { getStoreImageUrl } from "@/utils/imageUtils";

type StoreSettingsInputs = {
    name: string;
    description: string;
    location: string;
    promptPayId: string;
    image: FileList;
};

// *** (UI/UX) สร้าง Component ไอคอน Spinner สำหรับใช้ซ้ำ ***
const SpinnerIcon = () => (
    <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

const StoreSettingsFeature = () => {
    const { data: myStore, isLoading: isLoadingStore, refetch } = useMyStore();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StoreSettingsInputs>();

    // *** (UX) สร้าง State สำหรับเก็บข้อความ Success หรือ Error ***
    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageFile = watch("image");

    // *** (UX) ปรับแก้ useUpdateMyStore และ useToggleMyStoreStatus
    // ให้รับ onSuccess/onError ที่นี่ หรือจะส่งไปใน mutate() ก็ได้
    // ในตัวอย่างนี้ เราจะส่งเข้าไปใน mutate() ด้านล่าง
    const { mutate: updateStore, isPending: isUpdating } = useUpdateMyStore();
    const { mutate: toggleStatus, isPending: isTogglingStatus } =
        useToggleMyStoreStatus();

    useEffect(() => {
        if (myStore) {
            setValue("name", myStore.name);
            setValue("description", myStore.description || "");
            setValue("location", myStore.location || "");
            setValue("promptPayId", myStore.promptPayId || "");
        }
    }, [myStore, setValue]);

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Cleanup function to revoke the object URL
            return () => {
                URL.revokeObjectURL(previewUrl);
            };
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    // *** (UX) ปรับปรุง onSubmit ให้มีการตั้งค่า Feedback ***
    const onSubmit: SubmitHandler<StoreSettingsInputs> = (data) => {
        setFeedback(null); // เคลียร์ Feedback เก่าก่อน
        const { image, ...storeData } = data;
        const imageFile = image && image.length > 0 ? image[0] : undefined;
        updateStore({ ...storeData, image: imageFile }, {
            onSuccess: () => {
                setFeedback({
                    type: "success",
                    message: "Store information updated successfully!",
                });
                refetch();
                // ไม่จำเป็นต้อง refetch() ถ้า hook ของคุณใช้ invalidateQueries
                // แต่ถ้าต้องการข้อมูลล่าสุดทันที ก็ใส่ refetch() ได้
            },
            onError: (error) => {
                setFeedback({
                    type: "error",
                    message: (error as Error).message || "Failed to update store.",
                });
            },
        });
    };

    // *** (UX) ปรับปรุง handleToggleStatus ให้มีการตั้งค่า Feedback ***
    const handleToggleStatus = () => {
        if (myStore) {
            setFeedback(null); // เคลียร์ Feedback เก่า
            toggleStatus(!myStore.isOpen, {
                onSuccess: () => {
                    refetch(); // อันนี้ดีแล้ว ที่เรียก refetch เพื่ออัปเดตสถานะ
                    setFeedback({
                        type: "success",
                        message: "Store status changed successfully!",
                    });
                },
                onError: (error) => {
                    setFeedback({
                        type: "error",
                        message: (error as Error).message || "Failed to change status.",
                    });
                },
            });
        }
    };

    // *** (UI/UX) ปรับปรุงหน้า Loading ให้ดูดีขึ้น ***
    if (isLoadingStore) {
        return (
            <div className="flex justify-center items-center h-64">
                <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <span className="ml-3 text-lg text-gray-700">
                    Loading your store settings...
                </span>
            </div>
        );
    }

    // *** (UI/UX) ปรับปรุงหน้า Error กรณีไม่มีข้อมูล ***
    if (!myStore) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-center">
                <p className="text-xl text-red-600">
                    Store data is unavailable.
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Try Reloading
                </button>
            </div>
        );
    }

    // ตัวแปรนี้ดีอยู่แล้ว ใช้รวมสถานะ Loading ทั้งหมด
    const isPending = isUpdating || isTogglingStatus;

    return (
        // *** (UI) ปรับ Layout ภายนอกเล็กน้อย ***
        <div className="container mx-auto max-w-3xl p-4 md:p-8">
            {/* (UI) ปรับ Header ให้เด่นชัดขึ้น */}
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
                Store Settings
            </h1>

            <div className="space-y-8">
                {/* *** (UX) แสดงกล่อง Feedback *** */}
                {feedback && (
                    <div
                        className={`p-4 rounded-lg border ${feedback.type === "success"
                            ? "bg-green-50 border-green-300 text-green-800"
                            : "bg-red-50 border-red-300 text-red-800"
                            }`}
                        role="alert"
                    >
                        <p className="font-semibold">
                            {feedback.type === "success" ? "Success!" : "Error"}
                        </p>
                        <p>{feedback.message}</p>
                    </div>
                )}

                {/* *** (UI) ปรับ Card แรก (Store Status) *** */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Store Status
                            </h2>
                            <p className="text-lg">
                                Your store is currently{" "}
                                <span
                                    className={`font-bold ${myStore.isOpen ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {myStore.isOpen ? "OPEN" : "CLOSED"}
                                </span>
                            </p>
                        </div>
                        {/* *** (UI/UX) ปรับปรุงปุ่ม Toggle *** */}
                        <button
                            onClick={handleToggleStatus}
                            disabled={isPending}
                            className={`inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-white shadow-sm transition-colors duration-150
                ${myStore.isOpen
                                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                }
                disabled:bg-gray-400 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                            {isTogglingStatus ? (
                                <>
                                    <SpinnerIcon />
                                    Changing...
                                </>
                            ) : myStore.isOpen ? (
                                "Close Store"
                            ) : (
                                "Open Store"
                            )}
                        </button>
                    </div>
                </div>

                {/* *** (UI) ปรับ Card ที่สอง (Form) *** */}
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        Store Information
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label
                                htmlFor="image"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Store Image
                            </label>
                            <div className="mt-2 flex items-center gap-6">
                                <img
                                    src={imagePreview ?? getStoreImageUrl(myStore.image)}
                                    alt="Store preview"
                                    className="h-24 w-24 rounded-lg object-cover"
                                />
                                <input
                                    id="image"
                                    type="file"
                                    {...register("image")}
                                    className="block w-full text-sm text-gray-500
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-md file:border-0
                               file:text-sm file:font-semibold
                               file:bg-blue-50 file:text-blue-700
                               hover:file:bg-blue-100"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                        <div>
                            {/* (UI) ปรับ Label และ Input */}
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Store Name
                            </label>
                            <input
                                id="name"
                                {...register("name", { required: "Name is required" })}
                                className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50"
                                disabled={isPending}
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                {...register("description")}
                                rows={4}
                                className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="location"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Location
                            </label>
                            <input
                                id="location"
                                {...register("location")}
                                className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="promptPayId"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                PromptPay ID
                            </label>
                            <input
                                id="promptPayId"
                                {...register("promptPayId", { required: "PromptPay ID is required" })}
                                className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500
                           disabled:bg-gray-50"
                                disabled={isPending}
                            />
                            {errors.promptPayId && (
                                <p className="text-red-600 text-sm mt-1">
                                    {errors.promptPayId.message}
                                </p>
                            )}
                        </div>

                        {/* *** (UI/UX) ปรับปรุงปุ่ม Submit *** */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5
                           bg-blue-600 text-white font-semibold rounded-md shadow-sm 
                           hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                           disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <SpinnerIcon />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoreSettingsFeature;