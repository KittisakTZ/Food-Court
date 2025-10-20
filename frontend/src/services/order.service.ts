// @/services/order.service.ts

import mainApi from "@/apis/main.api";
import { APIPaginationType, APIResponseType } from "@/types/response";
import { Order } from "@/types/response/order.response";

// ===== Services สำหรับ Buyer (โค้ดเดิม) =====
interface CreateOrderPayload {
    storeId: string;
    items: {
        menuId: string;
        quantity: number;
    }[];
    scheduledPickupTime?: string;
}

export const createOrder = async (payload: CreateOrderPayload) => {
    const { data: response } = await mainApi.post<APIResponseType<any>>(
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


// ===== Services สำหรับ Seller (ส่วนที่แก้ไข) =====

// (แก้ไข) ดึง Type ของ status มาจาก 'Order' Type ของเราเอง
type OrderStatusString = Order['status'];

type GetStoreOrdersParams = {
    page?: number;
    pageSize?: number;
    status?: OrderStatusString[]; // <-- ใช้ Type ที่ถูกต้อง
}

export const getMyStoreOrders = async (params: GetStoreOrdersParams) => {
    // **แก้ไข Typo ตรงนี้**
    const { data: response } = await mainApi.get<APIResponseType<APIPaginationType<Order[]>>>(
        "/v1/stores/my-store/orders",
        { 
            params,
            paramsSerializer: {
                indexes: null 
            }
        }
    );
    return response.responseObject;
};

type UpdateOrderStatusParams = {
    orderId: string;
    action: "APPROVE" | "REJECT" | "CONFIRM_PAYMENT" | "PREPARE_COMPLETE" | "CUSTOMER_PICKED_UP";
}

export const updateOrderStatus = async ({ orderId, action }: UpdateOrderStatusParams) => {
    const { data: response } = await mainApi.patch<APIResponseType<Order>>(
        `/v1/stores/my-store/orders/${orderId}`,
        { action }
    );
    return response.responseObject;
};

// (ใหม่) Type สำหรับ Parameter การย้ายตำแหน่ง
type MoveOrderParams = {
    orderId: string;
    newPosition: number;
}

// (ใหม่) ฟังก์ชันย้ายตำแหน่ง Order
export const moveOrderPosition = async ({ orderId, newPosition }: MoveOrderParams) => {
    const { data: response } = await mainApi.patch<APIResponseType<null>>(
        `/v1/stores/my-store/orders/${orderId}/move`,
        { newPosition }
    );
    return response;
};