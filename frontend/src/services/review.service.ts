// @/services/review.service.ts
import mainApi from "@/apis/main.api";
import { APIResponseType, APIPaginationType } from "@/types/response";
import { Review } from "@/types/response/review.response";

type CreateReviewPayload = {
    rating: number;
    comment?: string;
};

const createReview = async (storeId: string, payload: CreateReviewPayload) => {
    const { data: response } = await mainApi.post<APIResponseType<Review>>(
        `/v1/reviews/store/${storeId}`,
        payload
    );
    return response;
};

const getReviewsForStore = async (storeId: string, page: number, pageSize: number) => {
    const { data: response } = await mainApi.get<APIResponseType<APIPaginationType<Review[]>>>(
        `/v1/reviews/store/${storeId}`,
        {
            params: { page, pageSize },
        }
    );
    return response;
};

export const reviewService = {
    createReview,
    getReviewsForStore,
};
