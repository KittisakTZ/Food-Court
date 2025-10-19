// @modules/review/reviewService.ts

import { StatusCodes } from 'http-status-codes';
import { ServiceResponse, ResponseStatus } from '@common/models/serviceResponse';
import { reviewRepository } from '@modules/review/reviewRepository';
import { ReviewPayload } from '@modules/review/reviewModel';

export const reviewService = {
    createReview: async (storeId: string, payload: ReviewPayload, user: { id: string }) => {
        // 1. ตรวจสอบเงื่อนไขการรีวิว
        // User คนนี้มี Order ที่เสร็จสมบูรณ์จากร้านนี้และยังไม่ได้รีวิวหรือไม่?
        const orderToReview = await reviewRepository.findCompleterdOrderToReview(user.id, storeId);

        if (!orderToReview) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "You do not have a completed order to review for this store, or you have already reviewed it.",
                null,
                StatusCodes.FORBIDDEN // ใช้ 403 Forbidden เพราะเป็นเรื่องของสิทธิ์
            );
        }

        // 2. ถ้าเงื่อนไขผ่าน, ก็ทำการสร้างรีวิวโดยอ้างอิงถึง Order ID ที่หาเจอ
        try {
            const newReview = await reviewRepository.createReviewAndUpdateOrder(
                orderToReview.id, // ส่ง Order ID เข้าไปเพื่ออัปเดต isReviewed
                storeId,
                user.id,
                payload
            );
            return new ServiceResponse(ResponseStatus.Success, "Review submitted successfully.", newReview, StatusCodes.CREATED);
        } catch (error) {
            const errorMessage = "Error submitting review: " + (error as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },


    getReviewsForStore: async (storeId: string, page: number, pageSize: number) => {
        const reviews = await reviewRepository.findByStoreId(storeId, page, pageSize);
        const totalCount = await reviewRepository.countByStoreId(storeId);

        return new ServiceResponse(
            ResponseStatus.Success,
            "Reviews retrieved successfully.",
            {
                data: reviews,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            },
            StatusCodes.OK
        );
    },
};