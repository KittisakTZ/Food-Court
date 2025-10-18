// @modules/review/reviewService.ts

import { StatusCodes } from 'http-status-codes';
import { ServiceResponse, ResponseStatus } from '@common/models/serviceResponse';
import { reviewRepository } from '@modules/review/reviewRepository';
import { ReviewPayload } from '@modules/review/reviewModel';

export const reviewService = {
    createReview: async (storeId: string, payload: ReviewPayload, user: { id: string }) => {
        // ดูก่อนว่าผู้ใช้เคยรีวิวร้านค้านี้แล้วหรือยัง
        const existingReview = await reviewRepository.findUserReviewForStore(storeId, user.id);
        if (existingReview) {
            return new ServiceResponse(ResponseStatus.Failed, "You have already reviewed this store.", null, StatusCodes.CONFLICT);
        }

        try {
            const newReview = await reviewRepository.createAndReviewcalculateRating(storeId, user.id, payload);
            return new ServiceResponse(ResponseStatus.Success, "Review created successfully.", newReview, StatusCodes.CREATED);
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