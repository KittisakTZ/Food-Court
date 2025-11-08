// @/hooks/useReviews.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/review.service";
import { toastService } from "@/services/toast.service";

type CreateReviewPayload = {
    storeId: string;
    rating: number;
    comment?: string;
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateReviewPayload) =>
            reviewService.createReview(payload.storeId, { rating: payload.rating, comment: payload.comment }),
        onSuccess: (response) => {
            if (response.success) {
                toastService.success("รีวิวของคุณถูกส่งเรียบร้อยแล้ว");
                // Invalidate the order query to refetch and update the UI
                // We can invalidate all order queries or a specific one if we have the orderId
                queryClient.invalidateQueries({ queryKey: ["order"] });
                queryClient.invalidateQueries({ queryKey: ["reviews"] });
            } else {
                toastService.error(response.message || "เกิดข้อผิดพลาดในการส่งรีวิว");
            }
        },
        onError: (error) => {
            toastService.error(error.message || "เกิดข้อผิดพลาดบางอย่าง");
        },
    });
};

export const useGetReviewsForStore = (storeId: string, page: number, pageSize: number) => {
    return useQuery({
        queryKey: ["reviews", storeId, page, pageSize],
        queryFn: async () => {
            const response = await reviewService.getReviewsForStore(storeId, page, pageSize);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.responseObject;
        },
        enabled: !!storeId,
    });
};
