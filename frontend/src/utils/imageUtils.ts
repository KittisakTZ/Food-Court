// @/utils/imageUtils.ts

/**
 * แปลง image path จาก backend เป็น full URL
 * @param imagePath - path ของรูปภาพจาก backend (อาจเป็น null, relative path, หรือ full URL)
 * @param fallbackImage - รูปภาพสำรองถ้าไม่มีรูป
 * @returns full URL ของรูปภาพ
 */
export const getImageUrl = (
    imagePath: string | null | undefined,
    fallbackImage: string = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
): string => {
    // ถ้าไม่มีรูป ให้ใช้รูปสำรอง
    if (!imagePath) {
        return fallbackImage;
    }

    // ถ้าเป็น full URL แล้ว (ขึ้นต้นด้วย http:// หรือ https://) ให้ return ตรงๆ
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // ถ้าเป็น relative path ให้เพิ่ม base URL
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

    // ลบ leading slash ถ้ามี เพื่อป้องกัน double slash
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * แปลง menu image path เป็น full URL
 */
export const getMenuImageUrl = (imagePath: string | null | undefined): string => {
    return getImageUrl(
        imagePath,
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    );
};

/**
 * แปลง store image path เป็น full URL
 */
export const getStoreImageUrl = (imagePath: string | null | undefined): string => {
    return getImageUrl(
        imagePath,
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
    );
};