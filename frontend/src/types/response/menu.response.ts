// @/types/response/menu.response.ts

// Type นี้ควรจะตรงกับข้อมูล Menu ที่ Backend ส่งกลับมา
export interface Menu {
    id: string;
    name: string;
    description: string | null;
    price: number;
    cookingTime: number;
    image: string | null;
    isAvailable: boolean;
    categoryId: string | null;
    storeId: string;
    // ข้อมูล category ที่เรา include มา
    category: {
        id: string;
        name: string;
    } | null;
}