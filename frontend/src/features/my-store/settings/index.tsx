import {
    useMyStore,
    useUpdateMyStore,
    useToggleMyStoreStatus,
} from "@/hooks/useStores";
import { useForm, SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import { getStoreImageUrl } from "@/utils/imageUtils";
import { MdStorefront, MdSettings, MdToggleOn, MdToggleOff, MdCheckCircle } from "react-icons/md";
import { FiImage, FiMapPin, FiCreditCard, FiFileText, FiX, FiUploadCloud, FiClock, FiAlertCircle } from "react-icons/fi";

type StoreSettingsInputs = {
    name: string;
    description: string;
    location: string;
    promptPayId: string;
    image: FileList;
    openTime: string;
    closeTime: string;
};

// ── Temporary Close Modal ─────────────────────────────────────────────────────
const TempCloseModal = ({
    onClose,
    onConfirm,
    isPending,
}: {
    onClose: () => void;
    onConfirm: (reason: string, reopenAt: string | null) => void;
    isPending: boolean;
}) => {
    const [reason, setReason] = useState("");
    const [useReopenTime, setUseReopenTime] = useState(false);
    const [reopenTime, setReopenTime] = useState("");

    useEffect(() => {
        const d = new Date(Date.now() + 30 * 60 * 1000);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        setReopenTime(local);
    }, []);

    const handleConfirm = () => {
        const reopenAt = useReopenTime && reopenTime
            ? new Date(reopenTime).toISOString()
            : null;
        onConfirm(reason, reopenAt);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <FiClock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Temporarily Close Store</h3>
                        <p className="text-sm text-gray-500">Notify customers of the reason for closing</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                            Reason <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Lunch break, Restocking ingredients..."
                            maxLength={200}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                checked={useReopenTime}
                                onChange={(e) => setUseReopenTime(e.target.checked)}
                                className="w-4 h-4 accent-orange-500"
                            />
                            <span className="text-sm font-semibold text-gray-700">Schedule automatic reopen time</span>
                        </label>
                        {useReopenTime && (
                            <input
                                type="datetime-local"
                                value={reopenTime}
                                onChange={(e) => setReopenTime(e.target.value)}
                                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        )}
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                    >
                        {isPending ? "Saving..." : "Confirm Temporary Close"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StoreSettingsFeature = () => {
    const { data: myStore, isLoading: isLoadingStore, refetch } = useMyStore();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StoreSettingsInputs>();

    const [feedback, setFeedback] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showTempCloseModal, setShowTempCloseModal] = useState(false);
    const imageFile = watch("image");

    const { mutate: updateStore, isPending: isUpdating } = useUpdateMyStore();
    const { mutate: toggleStatus, isPending: isTogglingStatus } = useToggleMyStoreStatus();

    useEffect(() => {
        if (myStore) {
            setValue("name", myStore.name);
            setValue("description", myStore.description || "");
            setValue("location", myStore.location || "");
            setValue("promptPayId", myStore.promptPayId || "");
            setValue("openTime", myStore.openTime || "");
            setValue("closeTime", myStore.closeTime || "");
        }
    }, [myStore, setValue]);

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            return () => { URL.revokeObjectURL(previewUrl); };
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const onSubmit: SubmitHandler<StoreSettingsInputs> = (data) => {
        setFeedback(null);
        const { image, ...storeData } = data;
        const imageFile = image && image.length > 0 ? image[0] : undefined;
        updateStore({
            ...storeData,
            openTime: storeData.openTime || null,
            closeTime: storeData.closeTime || null,
            image: imageFile,
        }, {
            onSuccess: () => {
                setFeedback({ type: "success", message: "Store information updated successfully!" });
                refetch();
            },
            onError: (error) => {
                setFeedback({ type: "error", message: (error as Error).message || "Failed to update store information." });
            },
        });
    };

    const handleOpen = () => {
        if (!myStore) return;
        setFeedback(null);
        toggleStatus({ isOpen: true }, {
            onSuccess: () => { refetch(); setFeedback({ type: "success", message: "Store opened successfully!" }); },
            onError: (error) => { setFeedback({ type: "error", message: (error as Error).message || "Failed to change status." }); },
        });
    };

    const handleClose = () => {
        if (!myStore) return;
        setFeedback(null);
        toggleStatus({ isOpen: false }, {
            onSuccess: () => { refetch(); setFeedback({ type: "success", message: "Store closed successfully!" }); },
            onError: (error) => { setFeedback({ type: "error", message: (error as Error).message || "Failed to change status." }); },
        });
    };

    const handleTempClose = (reason: string, reopenAt: string | null) => {
        setFeedback(null);
        toggleStatus({ isOpen: false, closeReason: reason || null, reopenAt }, {
            onSuccess: () => {
                setShowTempCloseModal(false);
                refetch();
                setFeedback({ type: "success", message: "Store temporarily closed!" });
            },
            onError: (error) => { setFeedback({ type: "error", message: (error as Error).message || "Failed to change status." }); },
        });
    };

    const removeImage = () => {
        setValue("image", new DataTransfer().files);
        setImagePreview(null);
    };

    if (isLoadingStore) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!myStore) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
                <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-md">
                    <MdStorefront className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <p className="text-xl text-gray-800 font-bold mb-2">Store not found</p>
                    <button onClick={() => refetch()} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl">
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    const isPending = isUpdating || isTogglingStatus;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
            {showTempCloseModal && (
                <TempCloseModal
                    onClose={() => setShowTempCloseModal(false)}
                    onConfirm={handleTempClose}
                    isPending={isTogglingStatus}
                />
            )}

            <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-yellow-500 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                                        <MdSettings className="w-10 h-10" />
                                        Store Settings
                                    </h1>
                                    <p className="text-orange-100 text-lg mt-2">Manage your store information and status</p>
                                </div>
                                <div className="hidden md:block bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                                    <MdStorefront className="w-12 h-12 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`mb-6 p-5 rounded-2xl border-2 shadow-md ${feedback.type === "success" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
                        <div className="flex items-center gap-3">
                            <MdCheckCircle className={`w-6 h-6 ${feedback.type === "success" ? "text-green-700" : "text-red-700"}`} />
                            <p className={`font-semibold ${feedback.type === "success" ? "text-green-800" : "text-red-800"}`}>
                                {feedback.message}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Store Status Card */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {myStore.isOpen ? <MdToggleOn className="w-6 h-6" /> : <MdToggleOff className="w-6 h-6" />}
                                Store Status
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${myStore.isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                                <span className={`text-2xl font-bold ${myStore.isOpen ? "text-green-600" : "text-red-600"}`}>
                                    {myStore.isOpen ? "Open" : "Closed"}
                                </span>
                            </div>

                            {!myStore.isOpen && (myStore.closeReason || myStore.reopenAt) && (
                                <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200 flex items-start gap-2">
                                    <FiAlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-orange-700">
                                        {myStore.closeReason && <p><span className="font-semibold">Reason:</span> {myStore.closeReason}</p>}
                                        {myStore.reopenAt && (
                                            <p><span className="font-semibold">Reopens at:</span>{" "}
                                                {new Date(myStore.reopenAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {myStore.isOpen ? (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleClose}
                                        disabled={isPending}
                                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400 flex items-center gap-2"
                                    >
                                        <MdToggleOff className="w-5 h-5" />
                                        Close Store
                                    </button>
                                    <button
                                        onClick={() => setShowTempCloseModal(true)}
                                        disabled={isPending}
                                        className="px-5 py-2.5 rounded-xl font-bold text-orange-600 bg-orange-50 border-2 border-orange-300 hover:bg-orange-100 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <FiClock className="w-4 h-4" />
                                        Temporary Close
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleOpen}
                                    disabled={isPending}
                                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2"
                                >
                                    {isTogglingStatus ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Opening...</>
                                    ) : (
                                        <><MdToggleOn className="w-5 h-5" /> Open Store</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Store Information Form */}
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiFileText className="w-5 h-5" />
                                Store Information
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {/* Image Upload */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                    <FiImage className="w-5 h-5 text-orange-600" />
                                    Store Image
                                </label>
                                <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-orange-50/50 rounded-xl border-2 border-orange-100">
                                    <div className="relative group">
                                        <img
                                            src={imagePreview ?? getStoreImageUrl(myStore.image)}
                                            alt="Store preview"
                                            className="w-32 h-32 rounded-xl object-cover shadow-md border-2 border-orange-200"
                                        />
                                        {imagePreview && (
                                            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
                                                <FiX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label htmlFor="image" className="flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-dashed border-orange-300 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-orange-400">
                                            <FiUploadCloud className="w-6 h-6 text-orange-600" />
                                            <span className="font-semibold text-gray-700">Choose New Image</span>
                                            <input id="image" type="file" accept="image/png, image/jpeg" {...register("image")} className="hidden" disabled={isPending} />
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2 text-center">PNG or JPG (max 5MB)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Store Name */}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <MdStorefront className="w-5 h-5 text-orange-600" />
                                    Store Name <span className="text-red-500">*</span>
                                </label>
                                <input id="name" {...register("name", { required: "Store name is required" })} placeholder="Your store name" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm disabled:bg-gray-50" disabled={isPending} />
                                {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium"><FiX className="w-4 h-4" />{errors.name.message}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiFileText className="w-5 h-5 text-orange-600" />
                                    Store Description
                                </label>
                                <textarea id="description" {...register("description")} rows={4} placeholder="Describe your store..." className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base resize-none shadow-sm disabled:bg-gray-50" disabled={isPending} />
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiMapPin className="w-5 h-5 text-orange-600" />
                                    Location
                                </label>
                                <input id="location" {...register("location")} placeholder="Store location" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm disabled:bg-gray-50" disabled={isPending} />
                            </div>

                            {/* Store Hours */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                                    <FiClock className="w-5 h-5 text-orange-600" />
                                    Store Hours
                                </label>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50/50 rounded-xl border-2 border-orange-100">
                                    <div>
                                        <label htmlFor="openTime" className="block text-xs font-semibold text-gray-600 mb-1">Opening Time</label>
                                        <input
                                            id="openTime"
                                            type="time"
                                            {...register("openTime")}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm disabled:bg-gray-50"
                                            disabled={isPending}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="closeTime" className="block text-xs font-semibold text-gray-600 mb-1">Closing Time</label>
                                        <input
                                            id="closeTime"
                                            type="time"
                                            {...register("closeTime")}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm disabled:bg-gray-50"
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">Displayed to customers on your store page. Leave blank if hours vary.</p>
                            </div>

                            {/* PromptPay ID */}
                            <div>
                                <label htmlFor="promptPayId" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                    <FiCreditCard className="w-5 h-5 text-orange-600" />
                                    PromptPay ID <span className="text-red-500">*</span>
                                </label>
                                <input id="promptPayId" {...register("promptPayId", { required: "PromptPay ID is required" })} placeholder="Phone number or national ID" className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-base font-medium shadow-sm disabled:bg-gray-50" disabled={isPending} />
                                {errors.promptPayId && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium"><FiX className="w-4 h-4" />{errors.promptPayId.message}</p>}
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button type="submit" disabled={isPending} className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-xl rounded-xl disabled:from-gray-400 disabled:to-gray-500 hover:from-orange-600 hover:to-yellow-600 shadow-md hover:shadow-xl flex items-center justify-center gap-3">
                                    {isUpdating ? (
                                        <><div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div><span>Saving...</span></>
                                    ) : (
                                        <><MdCheckCircle className="w-7 h-7" /><span>Save Changes</span></>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreSettingsFeature;
