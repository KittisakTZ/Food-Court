// @/types/response/menu.response.ts
import { MenuType } from "@/services/menuCategory.service";

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
    category: {
        id: string;
        name: string;
        menuType: MenuType;
    } | null;
}