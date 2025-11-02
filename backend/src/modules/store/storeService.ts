// @modules/store/storeService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { storeRepository } from "./storeRepository";
import { StorePayload } from "./storeModel";
import { User, Role } from "@prisma/client";

export const storeService = {
    // 🔄 CHANGED: เพิ่ม parameter 'file' เข้ามา
    create: async (payload: StorePayload, user: { id: string, role: Role }, file?: Express.Multer.File) => {
        if (user.role !== Role.SELLER) {
            return new ServiceResponse(ResponseStatus.Failed, "Only sellers can create stores.", null, StatusCodes.FORBIDDEN);
        }

        const existingStoreByOwner = await storeRepository.findByOwnerId(user.id);
        if (existingStoreByOwner) {
            return new ServiceResponse(ResponseStatus.Failed, "You already own a store.", null, StatusCodes.CONFLICT);
        }

        const existingStoreByName = await storeRepository.findByName(payload.name);
        if (existingStoreByName) {
            return new ServiceResponse(ResponseStatus.Failed, "Store name is already taken.", null, StatusCodes.CONFLICT);
        }

        // ✅ ADDED: จัดการไฟล์รูปภาพที่อัปโหลดเข้ามา
        if (file) {
            // สร้าง URL เต็มของรูปภาพ
            payload.image = `${process.env.APP_URL}/uploads/${file.filename}`;
        }

        await storeRepository.create(payload, user.id);
        return new ServiceResponse(ResponseStatus.Success, "Store created successfully. Waiting for approval.", null, StatusCodes.CREATED);
    },

    // 🔄 CHANGED: เพิ่ม parameter 'file' เข้ามา
    update: async (storeId: string, payload: Partial<StorePayload>, user: { id: string, role: Role }, file?: Express.Multer.File) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        if (store.ownerId !== user.id && user.role !== Role.ADMIN) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to update this store.", null, StatusCodes.FORBIDDEN);
        }

        if (payload.name) {
            const existingStore = await storeRepository.findByName(payload.name);
            if (existingStore && existingStore.id !== storeId) {
                return new ServiceResponse(ResponseStatus.Failed, "Store name is already taken.", null, StatusCodes.CONFLICT);
            }
        }

        // ✅ ADDED: จัดการไฟล์รูปภาพที่อัปโหลดเข้ามา (สำหรับการอัปเดต)
        if (file) {
            // TODO: อาจจะเพิ่ม logic ลบไฟล์รูปเก่าที่ server หากมี
            payload.image = `${process.env.APP_URL}/uploads/${file.filename}`;
        }

        const updatedStore = await storeRepository.update(storeId, payload);
        return new ServiceResponse(ResponseStatus.Success, "Store updated successfully.", updatedStore, StatusCodes.OK);
    },

    // ... (ส่วนที่เหลือของ service เหมือนเดิม)
    findAllPublic: async (
        page: number,
        pageSize: number,
        searchText?: string
    ) => {

        const stores = await storeRepository.findAllPublic(page, pageSize, searchText);
        const totalCount = await storeRepository.countPublic(searchText);

        return new ServiceResponse(
            ResponseStatus.Success,
            "Approved stores retrieved successfully.",
            {
                data: stores,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            },
            StatusCodes.OK
        );
    },

    findAllAdmin: async () => {
        const stores = await storeRepository.findAllAdmin();
        return new ServiceResponse(ResponseStatus.Success, "All stores retrieved successfully for admin.", stores, StatusCodes.OK);
    },

    findById: async (storeId: string) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }
        return new ServiceResponse(ResponseStatus.Success, "Store found.", store, StatusCodes.OK);
    },

    approveStore: async (storeId: string) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        if (store.isApproved) {
            return new ServiceResponse(ResponseStatus.Failed, "Store has already been approved.", null, StatusCodes.BAD_REQUEST);
        }

        await storeRepository.update(storeId, { isApproved: true });
        return new ServiceResponse(ResponseStatus.Success, "Store approved successfully.", null, StatusCodes.OK);
    },

    rejectStore: async (storeId: string) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        if (!store.isApproved) {
            return new ServiceResponse(ResponseStatus.Failed, "Store has not been approved yet.", null, StatusCodes.BAD_REQUEST);
        }

        const rejectedStore = await storeRepository.update(storeId, { isApproved: false });
        return new ServiceResponse(ResponseStatus.Success, "Store approval has been revoked.", rejectedStore, StatusCodes.OK);
    },

    findMyStore: async (user: { id: string }) => {
        const store = await storeRepository.findByOwnerId(user.id);

        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store yet.", null, StatusCodes.NOT_FOUND);
        }

        return new ServiceResponse(ResponseStatus.Success, "Your store information retrieved successfully.", store, StatusCodes.OK);
    },

    toggleStoreStatus: async (storeId: string, isOpen: boolean, user: { id: string, role: Role }) => {
        const store = await storeRepository.findById(storeId);

        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        if (store.ownerId !== user.id) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to change this store's status.", null, StatusCodes.FORBIDDEN);
        }

        await storeRepository.update(storeId, { isOpen: isOpen });
        const message = isOpen ? "Store is now open." : "Store is now closed.";

        return new ServiceResponse(ResponseStatus.Success, message, null, StatusCodes.OK);
    },

    findAllAdminPaginated: async (
        page: number,
        pageSize: number,
        searchText?: string,
        filterStatus?: string
    ) => {
        const stores = await storeRepository.findAllAdminPaginated(page, pageSize, searchText, filterStatus);
        const totalCount = await storeRepository.countAdmin(searchText, filterStatus);

        return new ServiceResponse(
            ResponseStatus.Success,
            "All stores retrieved successfully for admin.",
            {
                data: stores,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
            },
            StatusCodes.OK
        );
    },

    getStoreStats: async () => {
        const total = await storeRepository.countAllStores();
        const approved = await storeRepository.countApprovedStores();
        const pending = await storeRepository.countPendingStores();

        return new ServiceResponse(
            ResponseStatus.Success,
            "Store statistics retrieved successfully.",
            {
                total,
                approved,
                pending,
            },
            StatusCodes.OK
        );
    },
};