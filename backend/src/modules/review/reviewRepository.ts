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
    createAndReviewcalculateRating: async (userId: string, storeId: string, payload: ReviewPayload) => {
        return prisma.$transaction(async (tx) => {
            // สร้างรีวิวใหม่
            const newReview = await tx.review.create({
                data: {
                    ...payload,
                    storeId: storeId,
                    userId: userId,
                    isVisible: true, // ตั้งค่ารีวิวให้มองเห็นได้เลย
                },
            });

            // Aggregaion = การรวม
            // คำนวณคะแนนเฉลี่ยและจำนวนรีวิวใหม่ของร้านนี้
            const ratingAggregaion = await tx.review.aggregate({
                where: { storeId: storeId, },
                _avg: { rating: true },
                _count: { rating: true },
            });

            const newAvgRating = ratingAggregaion._avg.rating || 0;
            const newReviewCount = ratingAggregaion._count.rating || 0;

            // อัพเดตค่าในตราง store
            await tx.store.update({
                where: { id: storeId },
                data: {
                    avgRating: newAvgRating,
                    reviewCount: newReviewCount,
                },
            });

            return newReview;
        })
    },

    // ดึงรีวิวของร้านพร้อม pagination
    findByStoreId: async (storeId: string, page: number, pageSize: number) => {

        const skip = (page - 1) * pageSize;
        return prisma.review.findMany({
            where: { storeId: storeId, isVisible: true, },
            skip: skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, username: true } } } // ดึงข้อมูล User ที่รีวิวมาด้วย
        });
    },

    //นับจำนวนรีวิวทั้งหมดของร้าน
    countByStoreId: async (storeId: string) => {
        return prisma.review.count({
            where: { storeId: storeId, isVisible: true, },
        });
    },
}