// @modules/menu-category/menuCategoryService.ts

import { StatusCodes } from "http-status-codes";
import { ServiceResponse, ResponseStatus } from "@common/models/serviceResponse";
import { menuCategoryRepository } from "./menuCategoryRepository";
import { MenuCategoryPayload } from "./menuCategoryModel";

export const menuCategoryService = {
    create: async (payload: MenuCategoryPayload, storeId: string) => {
        // ตรวจสอบ: ชื่อหมวดหมู่ซ้ำในร้านเดียวกันหรือไม่
        const existingCategory = await menuCategoryRepository.findByNameAndStore(payload.name, storeId);
        if (existingCategory) {
            return new ServiceResponse(ResponseStatus.Failed, "Category name already exists in this store.", null, StatusCodes.CONFLICT);
        }

        const newCategory = await menuCategoryRepository.create(payload, storeId);
        return new ServiceResponse(ResponseStatus.Success, "Category created successfully.", newCategory, StatusCodes.CREATED);
    },
    
    // Service นี้สำหรับ Public ไม่ต้องเช็คสิทธิ์
    findByStoreId: async (storeId: string) => {
        const categories = await menuCategoryRepository.findByStoreId(storeId);
        return new ServiceResponse(ResponseStatus.Success, "Categories retrieved successfully.", categories, StatusCodes.OK);
    },

    update: async (categoryId: string, payload: MenuCategoryPayload, storeId: string) => {
        const category = await menuCategoryRepository.findById(categoryId);
        if (!category) {
            return new ServiceResponse(ResponseStatus.Failed, "Category not found.", null, StatusCodes.NOT_FOUND);
        }
        
        // **การตรวจสอบสิทธิ์:** หมวดหมู่นี้เป็นของร้านค้าที่ถูกต้องหรือไม่
        if (category.storeId !== storeId) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to update this category.", null, StatusCodes.FORBIDDEN);
        }

        // ตรวจสอบชื่อซ้ำ (เผื่อเปลี่ยนชื่อไปซ้ำกับอันอื่น)
        const existingCategory = await menuCategoryRepository.findByNameAndStore(payload.name, storeId);
        if (existingCategory && existingCategory.id !== categoryId) {
            return new ServiceResponse(ResponseStatus.Failed, "Category name already exists in this store.", null, StatusCodes.CONFLICT);
        }

        const updatedCategory = await menuCategoryRepository.update(categoryId, payload);
        return new ServiceResponse(ResponseStatus.Success, "Category updated successfully.", updatedCategory, StatusCodes.OK);
    },

    delete: async (categoryId: string, storeId: string) => {
        const category = await menuCategoryRepository.findById(categoryId);
        if (!category) {
            return new ServiceResponse(ResponseStatus.Failed, "Category not found.", null, StatusCodes.NOT_FOUND);
        }
        
        // **การตรวจสอบสิทธิ์:**
        if (category.storeId !== storeId) {
            return new ServiceResponse(ResponseStatus.Failed, "You are not authorized to delete this category.", null, StatusCodes.FORBIDDEN);
        }

        // **ตรวจสอบเพิ่มเติม:** ห้ามลบหมวดหมู่ถ้ายังมีเมนูอยู่ข้างใน
        const menuCount = await menuCategoryRepository.countMenusInCategory(categoryId);
        if (menuCount > 0) {
            return new ServiceResponse(ResponseStatus.Failed, `Cannot delete category because it contains ${menuCount} menu(s).`, null, StatusCodes.BAD_REQUEST);
        }

        await menuCategoryRepository.delete(categoryId);
        return new ServiceResponse(ResponseStatus.Success, "Category deleted successfully.", null, StatusCodes.OK);
    },
};