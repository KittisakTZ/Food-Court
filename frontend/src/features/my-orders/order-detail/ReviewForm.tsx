// @/features/my-orders/order-detail/ReviewForm.tsx
import { useState } from "react";
import { useCreateReview } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiStar, FiLoader, FiUser, FiEyeOff } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";
import { toastService } from "@/services/toast.service";

interface ReviewFormProps {
    storeId: string;
    orderId: string;
    onCancel: () => void;
}

const StarRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex space-x-1">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        type="button"
                        key={ratingValue}
                        className={`transition-colors duration-200 ${ratingValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <FiStar className="w-8 h-8 fill-current" />
                    </button>
                );
            })}
        </div>
    );
};

const ReviewForm = ({ storeId, orderId, onCancel }: ReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const queryClient = useQueryClient();
    const { mutate: createReview, isPending } = useCreateReview();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toastService.warning("กรุณาให้คะแนนอย่างน้อย 1 ดาว");
            return;
        }
        createReview(
            { storeId, rating, comment, isAnonymous },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
                    }
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">เขียนรีวิว</h3>
            <div className="flex flex-col items-center space-y-2">
                <p className="text-gray-600">ให้คะแนนร้านค้านี้</p>
                <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    ความคิดเห็น (ไม่บังคับ)
                </label>
                <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="บอกเล่าประสบการณ์ของคุณ..."
                    className="min-h-[100px]"
                />
            </div>

            {/* Anonymous toggle */}
            <button
                type="button"
                onClick={() => setIsAnonymous(v => !v)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    isAnonymous
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
            >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isAnonymous ? "bg-orange-100" : "bg-gray-200"
                }`}>
                    {isAnonymous
                        ? <FiEyeOff className="w-4 h-4 text-orange-500" />
                        : <FiUser className="w-4 h-4 text-gray-500" />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isAnonymous ? "text-orange-700" : "text-gray-700"}`}>
                        {isAnonymous ? "ไม่ระบุชื่อ (นิรนาม)" : "แสดงชื่อผู้ใช้"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {isAnonymous ? "ร้านค้าจะไม่เห็นชื่อของคุณ" : "ร้านค้าจะเห็นชื่อผู้ใช้ของคุณ"}
                    </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isAnonymous ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
                }`}>
                    {isAnonymous && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </button>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
                    ยกเลิก
                </Button>
                <Button type="submit" disabled={isPending || rating === 0}>
                    {isPending ? <FiLoader className="animate-spin" /> : "ส่งรีวิว"}
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;
