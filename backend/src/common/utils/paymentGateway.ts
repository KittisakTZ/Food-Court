// @common/utils/paymentGateway.ts

/**
 * จำลอง Payment Gateway
 * ในโลกจริง ส่วนนี้อาจจะเรียก API ของ Third-party จริงๆ
 */
export const paymentGateway = {
    /**
     * สร้าง QR Code สำหรับ PromptPay โดยใช้ promptpay.io
     * @param promptPayId - เบอร์โทรศัพท์ หรือเลขบัตรประชาชน
     * @param amount - จำนวนเงิน
     * @returns URL ของรูปภาพ QR Code
     */
    generateQrCode: async (promptPayId: string, amount: number): Promise<string> => {
        // ทำการ format amount ให้มีทศนิยม 2 ตำแหน่งเสมอ
        const formattedAmount = amount.toFixed(2);
        const qrCodeUrl = `https://promptpay.io/${promptPayId}/${formattedAmount}.png`;
        // ในสถานการณ์จริง อาจมีการตรวจสอบความถูกต้องของ ID หรือเรียก API อื่นๆ
        // แต่สำหรับ promptpay.io แค่นี้ก็เพียงพอ
        return Promise.resolve(qrCodeUrl);
    }
};