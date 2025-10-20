// @/services/admin.service.ts

import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";
import { Store } from "@/types/response/store.response";

// GET /v1/stores/admin/all
export const adminGetAllStores = async () => {
    const { data: response } = await mainApi.get<APIResponseType<Store[]>>(
        "/v1/stores/admin/all"
    );
    return response.responseObject;
};

// PATCH /v1/stores/admin/approve/:storeId
export const adminApproveStore = async (storeId: string) => {
    const { data: response } = await mainApi.patch<APIResponseType<Store>>(
        `/v1/stores/admin/approve/${storeId}`
    );
    return response.responseObject;
};