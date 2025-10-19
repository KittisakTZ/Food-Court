// @modules/store/storeService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { storeRepository } from "./storeRepository";
import { StorePayload } from "./storeModel";
import { User, Role } from "@prisma/client";

export const storeService = {
    // สร้างร้านค้า
    create: async (payload: StorePayload, user: { id: string, role: Role }) => {
        // ตรวจสอบ: ผู้ใช้ต้องมี Role 'SELLER' เท่านั้น
        if (user.role !== Role.SELLER) {
            return new ServiceResponse(ResponseStatus.Failed, "Only sellers can create stores.", null, StatusCodes.FORBIDDEN);
        }

        // ตรวจสอบ: Seller 1 คน มีได้แค่ 1 ร้าน (ตาม Schema ที่ ownerId unique)
        const existingStoreByOwner = await storeRepository.findByOwnerId(user.id);
        if (existingStoreByOwner) {
            return new ServiceResponse(ResponseStatus.Failed, "You already own a store.", null, StatusCodes.CONFLICT);
        }

        // ตรวจสอบ: ชื่อร้านค้าต้องไม่ซ้ำ
        const existingStoreByName = await storeRepository.findByName(payload.name);
        if (existingStoreByName) {
            return new ServiceResponse(ResponseStatus.Failed, "Store name is already taken.", null, StatusCodes.CONFLICT);
        }

        const newStore = await storeRepository.create(payload, user.id);
        return new ServiceResponse(ResponseStatus.Success, "Store created successfully. Waiting for approval.", null, StatusCodes.CREATED);
    },

    // อัปเดตร้านค้า
    update: async (storeId: string, payload: Partial<StorePayload>, user: { id: string, role: Role }) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        // ตรวจสอบสิทธิ์: ผู้ใช้ต้องเป็นเจ้าของร้าน หรือเป็น ADMIN
        if (store.ownerId !== user.id && user.role !== Role.ADMIN) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to update this store.", null, StatusCodes.FORBIDDEN);
        }

        const updatedStore = await storeRepository.update(storeId, payload);
        return new ServiceResponse(ResponseStatus.Success, "Store updated successfully.", null, StatusCodes.OK);
    },

    // ดึงข้อมูลร้านค้าทั้งหมด
    findAllPublic: async (
        page: number,
        pageSize: number,
        searchText?: string
    ) => {

        // <--- (2) ส่ง searchText ไปยัง Repository
        const stores = await storeRepository.findAllPublic(page, pageSize, searchText);

        // <--- (3) ส่ง searchText ไปยังการนับด้วย (สำคัญมาก)
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

    // (ใหม่) Service สำหรับ Admin เพื่อดึงร้านค้าทั้งหมด
    findAllAdmin: async () => {
        const stores = await storeRepository.findAllAdmin();
        return new ServiceResponse(ResponseStatus.Success, "All stores retrieved successfully for admin.", stores, StatusCodes.OK);
    },

    // ดึงข้อมูลร้านค้าเดียว
    findById: async (storeId: string) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }
        return new ServiceResponse(ResponseStatus.Success, "Store found.", store, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับ Admin เพื่อ "อนุมัติ" ร้านค้า
    approveStore: async (storeId: string) => {
        const store = await storeRepository.findById(storeId);
        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        if (store.isApproved) {
            return new ServiceResponse(ResponseStatus.Failed, "Store has already been approved.", null, StatusCodes.BAD_REQUEST);
        }

        const approvedStore = await storeRepository.update(storeId, { isApproved: true });
        return new ServiceResponse(ResponseStatus.Success, "Store approved successfully.", null, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับ Admin เพื่อ "ปฏิเสธ/ยกเลิกอนุมัติ" ร้านค้า (เผื่อไว้)
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

    // (ใหม่) Service สำหรับดึงข้อมูลร้านค้าของ ID ที่ login อยู่ (My Store)
    findMyStore: async (user: { id: string }) => {
        const store = await storeRepository.findByOwnerId(user.id);

        if (!store) {
            // ในกรณีที่ Seller login เข้ามาแต่ยังไม่มีร้านค้า (อาจจะยังไม่ได้สร้าง)
            return new ServiceResponse(ResponseStatus.Failed, "You do not own a store yet.", null, StatusCodes.NOT_FOUND);
        }

        return new ServiceResponse(ResponseStatus.Success, "Your store information retrieved successfully.", store, StatusCodes.OK);
    },

    // (ใหม่) Service สำหรับเปลี่ยนสถานะ เปิด/ปิด ร้าน
    toggleStoreStatus: async (storeId: string, isOpen: boolean, user: { id: string, role: Role }) => {
        const store = await storeRepository.findById(storeId);

        if (!store) {
            return new ServiceResponse(ResponseStatus.Failed, "Store not found.", null, StatusCodes.NOT_FOUND);
        }

        // ตรวจสอบสิทธิ์: ผู้ใช้ต้องเป็นเจ้าของร้านเท่านั้น (ยังคงเงื่อนไขนี้ไว้)
        if (store.ownerId !== user.id) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to change this store's status.", null, StatusCodes.FORBIDDEN);
        }

        const updatedStore = await storeRepository.update(storeId, { isOpen: isOpen });
        const message = isOpen ? "Store is now open." : "Store is now closed.";

        return new ServiceResponse(ResponseStatus.Success, message, null, StatusCodes.OK);
    },
};