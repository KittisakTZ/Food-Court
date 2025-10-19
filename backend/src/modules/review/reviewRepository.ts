// @modules/review/reviewRepository.ts

import prisma from "@src/db";
import { ReviewPayload } from "@modules/review/reviewModel";

export const reviewRepository = {
    // ฟังชันสำหรับตรวจสอบว่า User เคยรีวิวร้านนี้ไปแล้วหรือยัง
    findUserReviewForStore: async (userId: string, storeId: string) => {
        return prisma.review.findFirst({
            where: {
                userId: userId,
                storeId: storeId,
            },
        });
    },

    // ฟังชันสำหรับสร้างรีวิวเเละคำนวนคะเเนนใหม่ใน Transacion เดียว
    createReviewAndUpdateOrder: async (orderId: string, storeId: string, userId: string, payload: ReviewPayload) => {
        return prisma.$transaction(async (tx) => {
            // 1. สร้างรีวิวใหม่
            const newReview = await tx.review.create({
                data: {
                    ...payload,
                    storeId: storeId,
                    userId: userId,
                    isVisible: true,
                },
            });

            // 2. อัปเดต Order ให้เป็น isReviewed: true
            await tx.order.update({
                where: { id: orderId },
                data: { isReviewed: true },
            });

            // 3. คำนวณคะแนนเฉลี่ยและจำนวนรีวิวใหม่ (Logic เดิม)
            const ratingAggregation = await tx.review.aggregate({
                where: { storeId: storeId },
                _avg: { rating: true },
                _count: { rating: true },
            });

            const newAvgRating = ratingAggregation._avg.rating || 0;
            const newReviewCount = ratingAggregation._count.rating || 0;

            // 4. อัปเดตค่าในตาราง Store (Logic เดิม)
            await tx.store.update({
                where: { id: storeId },
                data: {
                    avgRating: newAvgRating,
                    reviewCount: newReviewCount,
                },
            });

            return newReview;
        });
    },

    // ดึงรีวิวของร้านพร้อม pagination
    findByStoreId: async (storeId: string, page: number, pageSize: number) => {
        const skip = (page - 1) * pageSize;
        return prisma.review.findMany({
            where: { storeId: storeId, isVisible: true },
            skip: skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, username: true } } }
        });
    },

    //นับจำนวนรีวิวทั้งหมดของร้าน
    countByStoreId: async (storeId: string) => {
        return prisma.review.count({
            where: { storeId: storeId, isVisible: true, },
        });
    },

    // (ใหม่) ฟังก์ชันสำหรับค้นหา Order ที่รีวิวได้
    // เงื่อนไข: เป็นของ Buyer คนนี้, สั่งจากร้านนี้, สถานะพร้อมรีวิว, และยังไม่เคยถูกรีวิว
    findCompleterdOrderToReview: async (userId: string, storeId: string) => {
        return prisma.order.findFirst({
            where: {
                buyerId: userId,
                storeId: storeId,
                status: {
                    in: ['READY_FOR_PICKUP', 'COMPLETED']
                },
                isReviewed: false,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    },
}