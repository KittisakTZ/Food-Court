import mainApi from "@/apis/main.api";
import { APIResponseType } from "@/types/response";
import { Store } from "@/types/response/store.response";

// เพิ่ม Type สำหรับ Paginated Response
export type PaginatedStoresResponse = {
    data: Store[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
};

// เปลี่ยนจาก /admin/all เป็น /admin/paginated
export const adminGetAllStores = async (
    page: number = 1,
    pageSize: number = 10,
    searchText?: string,
    filterStatus?: 'all' | 'pending' | 'approved'
) => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
    });

    if (searchText) {
        params.append('searchText', searchText);
    }

    if (filterStatus) {
        params.append('filterStatus', filterStatus);
    }

    const { data: response } = await mainApi.get<APIResponseType<PaginatedStoresResponse>>(
        `/v1/stores/admin/paginated?${params.toString()}`
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

// PATCH /v1/stores/admin/reject/:storeId
export const adminRejectStore = async (storeId: string) => {
    const { data: response } = await mainApi.patch<APIResponseType<Store>>(
        `/v1/stores/admin/reject/${storeId}`
    );
    return response.responseObject;
};

// GET /v1/stores/admin/stats - ดึงสถิติร้านค้าทั้งหมด
export const adminGetStoreStats = async () => {
    const { data: response } = await mainApi.get<APIResponseType<{
        total: number;
        approved: number;
        pending: number;
    }>>("/v1/stores/admin/stats");
    return response.responseObject;
};