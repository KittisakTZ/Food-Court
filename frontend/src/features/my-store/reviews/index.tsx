// @/features/my-store/reviews/index.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyStore } from "@/hooks/useStores";
import { useGetReviewsForStore } from "@/hooks/useReviews";
import { FiStar, FiMessageSquare, FiUser, FiCalendar, FiChevronLeft, FiChevronRight, FiExternalLink, FiEyeOff } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

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
        return <div className="text-center p-8">Loading store information...</div>;
    }

    if (!storeId) {
        return <div className="text-center p-8 text-red-500">No store found for this user</div>;
    }

    if (isLoadingReviews) {
        return <div className="text-center p-8">Loading reviews...</div>;
    }

    if (isError) {
        return <div className="text-center p-8 text-red-500">Error loading reviews</div>;
    }

    const { data: reviews, totalPages } = reviewsData;

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Store Reviews</h1>

            {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <StarDisplay rating={review.rating} />
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <FiCalendar className="w-4 h-4" />
                                    {format(new Date(review.createdAt), 'd MMM yyyy, HH:mm')}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-gray-700 mt-3 flex items-start gap-2">
                                    <FiMessageSquare className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                                    <span>{review.comment}</span>
                                </p>
                            )}
                            <div className="flex justify-between items-center mt-4">
                                {review.order?.id ? (
                                    <Link to={`/my-store/orders/${review.order.id}`}>
                                        <Button variant="link" size="sm" className="text-orange-600">
                                            <FiExternalLink className="mr-2 h-4 w-4" />
                                            View Order
                                        </Button>
                                    </Link>
                                ) : (
                                    <div></div> // Placeholder to keep alignment
                                )}
                                <div className="text-right text-sm flex items-center justify-end gap-1.5">
                                    {review.isAnonymous ? (
                                        <>
                                            <FiEyeOff className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-400 italic">Anonymous User</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiUser className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">By: {review.user?.username || 'Anonymous'}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-white rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700">No reviews yet</h2>
                    <p className="text-gray-500 mt-2">When customers submit reviews, they will appear here</p>
                </div>
            )}

            {/* Pagination */}
            {reviews && reviews.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                        <FiChevronLeft className="mr-2" /> Previous
                    </Button>
                    <span className="font-semibold">
                        Page {page} of {totalPages}
                    </span>
                    <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                        Next <FiChevronRight className="ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StoreReviewsPage;
