// @/hooks/useOrders.ts
import { getMyOrders } from "@/services/order.service";
import { useQuery } from "@tanstack/react-query";

type UseOrdersProps = {
    page?: number;
    pageSize?: number;
};

export const useMyOrders = ({ page = 1, pageSize = 10 }: UseOrdersProps = {}) => {
    return useQuery({
        queryKey: ['my-orders', { page, pageSize }],
        queryFn: () => getMyOrders({ page, pageSize }),
        staleTime: 1000 * 60, // 1 minute
    });
};