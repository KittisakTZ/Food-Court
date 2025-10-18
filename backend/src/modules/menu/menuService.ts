// @modules/menu/menuService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { menuRepository } from "./menuRepository";
import { MenuPayload } from "./menuModel";
import { menuCategoryRepository } from "@modules/menu-category/menuCategoryRepository"; // Import เข้ามาเพื่อตรวจสอบ

export const menuService = {
    create: async (payload: MenuPayload, storeId: string) => {
        // ตรวจสอบ: Category ID ที่ส่งมา มีอยู่จริงและเป็นของร้านค้านี้หรือไม่
        const category = await menuCategoryRepository.findById(payload.categoryId);
        if (!category || category.storeId !== storeId) {
            return new ServiceResponse(ResponseStatus.Failed, "Category not found or does not belong to this store.", null, StatusCodes.BAD_REQUEST);
        }

        const newMenu = await menuRepository.create(payload, storeId);
        return new ServiceResponse(ResponseStatus.Success, "Menu created successfully.", null, StatusCodes.CREATED);
    },

    findByStoreId: async (storeId: string) => {
        const menus = await menuRepository.findByStoreId(storeId);
        return new ServiceResponse(ResponseStatus.Success, "Menus retrieved successfully.", menus, StatusCodes.OK);
    },

    update: async (menuId: string, payload: Partial<MenuPayload>, storeId: string) => {
        const menu = await menuRepository.findById(menuId);
        if (!menu) {
            return new ServiceResponse(ResponseStatus.Failed, "Menu not found.", null, StatusCodes.NOT_FOUND);
        }
        
        // **การตรวจสอบสิทธิ์:** เมนูนี้เป็นของร้านค้าที่ถูกต้องหรือไม่
        if (menu.storeId !== storeId) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to update this menu.", null, StatusCodes.FORBIDDEN);
        }

        // (ตรวจสอบเพิ่มเติม) ถ้ามีการเปลี่ยน categoryId, ต้องเช็คว่า categoryId ใหม่นั้นเป็นของร้านนี้จริง
        if (payload.categoryId) {
            const newCategory = await menuCategoryRepository.findById(payload.categoryId);
            if (!newCategory || newCategory.storeId !== storeId) {
                return new ServiceResponse(ResponseStatus.Failed, "New category not found or does not belong to this store.", null, StatusCodes.BAD_REQUEST);
            }
        }

        const updatedMenu = await menuRepository.update(menuId, payload);
        return new ServiceResponse(ResponseStatus.Success, "Menu updated successfully.", null, StatusCodes.OK);
    },

    delete: async (menuId: string, storeId: string) => {
        const menu = await menuRepository.findById(menuId);
        if (!menu) {
            return new ServiceResponse(ResponseStatus.Failed, "Menu not found.", null, StatusCodes.NOT_FOUND);
        }
        
        // **การตรวจสอบสิทธิ์:**
        if (menu.storeId !== storeId) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to delete this menu.", null, StatusCodes.FORBIDDEN);
        }

        await menuRepository.delete(menuId);
        return new ServiceResponse(ResponseStatus.Success, "Menu deleted successfully.", null, StatusCodes.OK);
    },
};