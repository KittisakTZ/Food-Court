// @/types/response/store.response.ts

// Type นี้ควรจะตรงกับข้อมูลที่ Backend ส่งกลับมา
export interface Store {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    image: string | null;
    promptPayId: string | null;
    isApproved: boolean;
    isOpen: boolean;
    closeReason: string | null;
    reopenAt: string | null;
    avgRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner?: { // ข้อมูลเจ้าของที่ include มา
        id: string;
        username: string;
    };
}