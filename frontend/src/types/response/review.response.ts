// @/types/response/review.response.ts

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isVisible: boolean;
    isAnonymous: boolean;
    storeId: string;
    userId: string;
    createdAt: string;
    user?: {
        id: string;
        username: string;
    } | null;
    order?: {
        id: string;
    };
}
