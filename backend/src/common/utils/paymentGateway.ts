// @common/utils/paymentGateway.ts

// Service จำลองสำหรับสร้าง QR Code
export const paymentGateway = {
    // ในอนาคต ฟังก์ชันนี้จะรับข้อมูล PromptPay ของร้านค้าและจำนวนเงิน
    // แล้ว return เป็น URL ของรูป QR Code หรือ Base64 string
    generateQrCode: async (storePromptPayId: string, amount: number): Promise<string> => {
        console.log(`Generating QR Code for ${storePromptPayId} with amount ${amount}...`);
        // *** นี่คือส่วนจำลอง ***
        // ในการใช้งานจริง จะเรียก library qrcode ที่นี่
        // ตอนนี้เราจะ return URL รูปภาพ QR Code จำลองไปก่อน
        return `https://quickchart.io/qr?text=promptpay://${storePromptPayId}/${amount}&size=200`;
    }
}