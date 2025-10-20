// @/services/order.service.ts

import mainApi from "@/apis/main.api";
import { APIResponseType, APIPaginationType } from "@/types/response";
import { Order } from "@/types/response/order.response";
// เราอาจจะต้องสร้าง Order Response Type ในอนาคต
// import { Order } from "@/types/response/order.response";

// Type สำหรับ Payload ที่จะส่งไปสร้าง Order
interface CreateOrderPayload {
    storeId: string;
    items: {
        menuId: string;
        quantity: number;
    }[];
    scheduledPickupTime?: string; // HH:mm format
}

export const createOrder = async (payload: CreateOrderPayload) => {
    const { data: response } = await mainApi.post<APIResponseType<any>>( // ใช้ any ไปก่อน
        "/v1/orders",
        payload
    );
    return response;
};

type GetOrdersParams = {
    page?: number;
    pageSize?: number;
}

export const getMyOrders = async (params: GetOrdersParams) => {
    const { data: response } = await mainApi.get<APIResponseType<APIPaginationType<Order[]>>>(
        "/v1/orders/my-orders",
        { params }
    );
    return response.responseObject;
};