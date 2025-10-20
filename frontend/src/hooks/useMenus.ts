// @/hooks/useMenus.ts

import { getMenusByStore } from "@/services/store.service";
import { useQuery } from "@tanstack/react-query";

type UseMenusProps = {
    storeId: string;
    page?: number;
    pageSize?: number;
    searchText?: string;
};

export const useMenus = ({ storeId, page = 1, pageSize = 12, searchText = "" }: UseMenusProps) => {
    return useQuery({
        queryKey: ['menus', storeId, { page, pageSize, searchText }],
        queryFn: () => getMenusByStore({ storeId, page, pageSize, searchText }),
        enabled: !!storeId, // จะเริ่มดึงข้อมูลก็ต่อเมื่อ storeId มีค่า
    });
};