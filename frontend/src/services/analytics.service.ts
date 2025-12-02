import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";

export interface DashboardData {
    stats: {
        totalRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
    };
    salesChart: {
        date: string;
        amount: number;
    }[];
    topMenus: {
        id: string;
        name: string;
        image: string;
        quantity: number;
        sales: number;
    }[];
}

export const analyticsService = {
    getDashboardData: async (storeId: string, startDate?: string, endDate?: string, interval?: "day" | "month") => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (interval) params.append("interval", interval);

        const response = await mainApi.get<APIResponseType<DashboardData>>(`/v1/analytics/dashboard/${storeId}?${params.toString()}`);
        return response.data;
    },
};
