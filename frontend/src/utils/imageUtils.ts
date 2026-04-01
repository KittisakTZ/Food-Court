// @/utils/imageUtils.ts

export const NO_STORE_IMAGE = '/images/no-store.svg';
export const NO_FOOD_IMAGE = '/images/no-food.svg';

/**
 * แปลง image path จาก backend เป็น full URL
 */
export const getImageUrl = (
    imagePath: string | null | undefined,
    fallbackImage: string = NO_STORE_IMAGE
): string => {
    if (!imagePath) return fallbackImage;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
};

export const getMenuImageUrl = (imagePath: string | null | undefined): string =>
    getImageUrl(imagePath, NO_FOOD_IMAGE);

export const getStoreImageUrl = (imagePath: string | null | undefined): string =>
    getImageUrl(imagePath, NO_STORE_IMAGE);

/** ใช้กับ onError ของ <img> เพื่อแสดง placeholder เมื่อโหลดภาพไม่ได้ */
export const onImgError = (fallback: string) =>
    (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
        }
    };
