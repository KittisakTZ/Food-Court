// @/features/my-store/reviews/index.tsx
import { useState } from "react";
import { useMyStore } from "@/hooks/useStores";
import { useGetReviewsForStore } from "@/hooks/useReviews";
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => (
            <FiStar key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        ))}
    </div>
);

const StoreReviewsPage = () => {
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const { data: myStore, isLoading: isLoadingStore } = useMyStore();
    const storeId = myStore?.id;

    const { data: reviewsData, isLoading: isLoadingReviews, isError } = useGetReviewsForStore(storeId!, page, pageSize);

    if (isLoadingStore) {
        return <div className="text-center p-8">กำลังโหลดข้อมูลร้านค้า...</div>;
    }

    if (!storeId) {
        return <div className="text-center p-8 text-red-500">ไม่พบข้อมูลร้านค้าสำหรับผู้ใช้นี้</div>;
    }

    if (isLoadingReviews) {
        return <div className="text-center p-8">กำลังโหลดรีวิว...</div>;
    }

    if (isError) {
        return <div className="text-center p-8 text-red-500">เกิดข้อผิดพลาดในการโหลดรีวิว</div>;
    }

    const { data: reviews, totalPages } = reviewsData;

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">รีวิวร้านค้าของคุณ</h1>

            {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <StarDisplay rating={review.rating} />
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FiCalendar className="w-4 h-4" />
                                    {format(new Date(review.createdAt), 'd MMM yyyy, HH:mm', { locale: th })} น.
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-gray-700 mt-3 flex items-start gap-2">
                                    <FiMessageSquare className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                                    <span>{review.comment}</span>
                                </p>
                            )}
                            <div className="text-right text-sm text-gray-600 mt-3 flex items-center justify-end gap-2">
                                <FiUser className="w-4 h-4" />
                                <span>โดย: {review.user?.username || 'ไม่ระบุชื่อ'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700">ยังไม่มีรีวิว</h2>
                    <p className="text-gray-500 mt-2">เมื่อลูกค้าส่งรีวิว, รีวิวจะแสดงที่นี่</p>
                </div>
            )}

            {/* Pagination */}
            {reviews && reviews.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                        <FiChevronLeft className="mr-2" /> ก่อนหน้า
                    </Button>
                    <span className="font-semibold">
                        หน้า {page} / {totalPages}
                    </span>
                    <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                        ถัดไป <FiChevronRight className="ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StoreReviewsPage;
