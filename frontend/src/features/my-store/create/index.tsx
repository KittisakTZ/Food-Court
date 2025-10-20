// @/features/my-store/create/index.tsx (ไฟล์ใหม่)

import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mainApi from "@/apis/main.api";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/services/toast.service";

// Service สำหรับสร้างร้านค้า (อาจจะแยกไปไฟล์ service ก็ได้)
const createStore = async (formData: FormData) => {
    const { data: response } = await mainApi.post("/v1/stores", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
}

type StoreFormInputs = {
    name: string;
    description: string;
    location: string;
    image: FileList;
};

const CreateStoreFeature = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<StoreFormInputs>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: createStore,
        onSuccess: () => {
            toastService.success("Store created successfully! It is now awaiting administrator approval.");
            // บอกให้ react-query ไปดึงข้อมูล my-store มาใหม่ในครั้งถัดไป
            queryClient.invalidateQueries({ queryKey: ['my-store'] });
            navigate("/"); // กลับไปหน้า Dashboard
        },
        onError: (error: any) => {
            toastService.error(`Failed to create store: ${error.response?.data?.message || error.message}`);
        }
    });

    const onSubmit: SubmitHandler<StoreFormInputs> = (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('location', data.location);
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }
        mutate(formData);
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Create Your Store</h1>
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Store Name</label>
                        <input id="name" {...register("name", { required: "Name is required" })} className="mt-1 block w-full p-2 border rounded-md" />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" {...register("description")} rows={3} className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input id="location" {...register("location")} className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Store Image (Logo/Banner)</label>
                        <input id="image" type="file" accept="image/png, image/jpeg" {...register("image")} className="mt-1 block w-full text-sm" />
                    </div>
                    <button type="submit" disabled={isPending} className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md disabled:bg-gray-400">
                        {isPending ? 'Creating Store...' : 'Submit for Approval'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateStoreFeature;