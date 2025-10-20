// @/features/my-store/settings/index.tsx
import { useMyStore, useUpdateMyStore, useToggleMyStoreStatus } from "@/hooks/useStores";
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
type StoreSettingsInputs = {
    name: string;
    description: string;
    location: string;
};
const StoreSettingsFeature = () => {
    const { data: myStore, isLoading: isLoadingStore, refetch } = useMyStore();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<StoreSettingsInputs>();
    const { mutate: updateStore, isPending: isUpdating } = useUpdateMyStore();
    const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleMyStoreStatus();

    useEffect(() => {
        if (myStore) {
            setValue('name', myStore.name);
            setValue('description', myStore.description || '');
            setValue('location', myStore.location || '');
        }
    }, [myStore, setValue]);

    // **** เพิ่มฟังก์ชัน onSubmit กลับเข้ามาที่นี่ ****
    const onSubmit: SubmitHandler<StoreSettingsInputs> = (data) => {
        // **ตรวจสอบการเรียก mutate: ต้องเป็น updateStore ที่มาจาก useUpdateMyStore**
        console.log("Submitting data:", data); // <-- เพิ่ม Log เพื่อดูว่ากำลัง Submit อะไร
        updateStore(data);
    };

    const handleToggleStatus = () => {
        if (myStore) {
            // เรียก toggleStatus และเมื่อสำเร็จ ให้สั่ง refetch ข้อมูล myStore ใหม่
            toggleStatus(!myStore.isOpen, {
                onSuccess: () => {
                    // **บังคับให้ useMyStore ดึงข้อมูลใหม่โดยตรง**
                    // แทนที่จะรอ invalidate ซึ่งอาจจะช้ากว่า
                    refetch();
                }
            });
        }
    };

    // **จัดการสถานะ Loading ให้ครอบคลุม**
    if (isLoadingStore) return <div>Loading your store settings...</div>;

    // ถ้าโหลดเสร็จแล้วแต่ยังไม่มีข้อมูล (อาจจะเกิดตอน refetch)
    // ให้แสดง UI เดิม แต่ disable ปุ่มต่างๆ ไว้ก่อน
    if (!myStore) return <div>Store data is unavailable. Please try refreshing.</div>;

    const isPending = isUpdating || isTogglingStatus;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Store Settings</h1>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold">Store Status</h2>
                            <p className={`font-bold ${myStore.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                Your store is currently {myStore.isOpen ? 'OPEN' : 'CLOSED'}
                            </p>
                        </div>
                        <button
                            onClick={handleToggleStatus}
                            disabled={isPending} // ใช้ isPending รวม
                            className={`px-4 py-2 rounded-md font-semibold text-white ${myStore.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-400`}
                        >
                            {isTogglingStatus ? 'Changing...' : (myStore.isOpen ? 'Close Store' : 'Open Store')}
                        </button>
                    </div>
                </div>

                {/* ส่วนของฟอร์มแก้ไขข้อมูล */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-4">Store Information</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Store Name</label>
                            <input id="name" {...register("name", { required: "Name is required" })} className="mt-1 block w-full p-2 border rounded-md" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" {...register("description")} rows={4} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                            <input id="location" {...register("location")} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>

                        <button type="submit" disabled={isPending} className="...">
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default StoreSettingsFeature;