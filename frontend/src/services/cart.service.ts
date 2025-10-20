// @/services/cart.service.ts

import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";
import { Cart } from "@/types/response/cart.response";

// GET /v1/cart
export const getCart = async () => {
    const { data: response } = await mainApi.get<APIResponseType<Cart>>("/v1/cart");
    return response.responseObject;
};

// POST /v1/cart/items
export const addItemToCart = async (payload: { menuId: string; quantity: number }) => {
    const { data: response } = await mainApi.post<APIResponseType<Cart>>("/v1/cart/items", payload);
    return response.responseObject;
};

// PATCH /v1/cart/items/:itemId
export const updateCartItem = async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
    const { data: response } = await mainApi.patch<APIResponseType<Cart>>(
        `/v1/cart/items/${itemId}`,
        { quantity }
    );
    return response.responseObject;
};

// DELETE /v1/cart
export const clearCart = async () => {
    const { data: response } = await mainApi.delete<APIResponseType<null>>("/v1/cart");
    return response;
};