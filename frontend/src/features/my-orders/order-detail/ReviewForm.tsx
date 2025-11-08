// @/features/my-orders/order-detail/ReviewForm.tsx
import { useState } from "react";
import { useCreateReview } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FiStar, FiLoader } from "react-icons/fi";
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
    const queryClient = useQueryClient();
    const { mutate: createReview, isPending } = useCreateReview();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toastService.warning("กรุณาให้คะแนนอย่างน้อย 1 ดาว");
            return;
        }
        createReview(
            { storeId, rating, comment },
            {
                onSuccess: (res) => {
                    if (res.success) {
                        // Invalidate the specific order query
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
