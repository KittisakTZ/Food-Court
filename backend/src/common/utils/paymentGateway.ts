// @common/utils/paymentGateway.ts
import { env } from "@common/utils/envConfig"; // ✨ (เพิ่ม)

export const paymentGateway = {
    generateQrCode: async (promptPayId: string, amount: number): Promise<string> => {
        const formattedAmount = amount.toFixed(2);
        // ✨ (ปรับปรุง) ใช้ค่าจาก env แทน Hardcode
        const qrCodeUrl = `${env.PROMPTPAY_API_BASE_URL}/${promptPayId}/${formattedAmount}.png`;
        return Promise.resolve(qrCodeUrl);
    }
};