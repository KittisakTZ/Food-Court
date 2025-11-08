// @/types/response/review.response.ts

export interface Review {
    id: string;
    rating: number;
    comment: string | null;
    isVisible: boolean;
    storeId: string;
    userId: string;
    createdAt: string;
    user?: { // User might not always be included
        id: string;
        username: string;
    };
}
