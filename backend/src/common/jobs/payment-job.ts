import cron from 'node-cron';
import prisma from '@src/db';
import { OrderStatus } from '@prisma/client';
import { pino } from 'pino';

const logger = pino({ name: 'payment-job' });

// ฟังก์ชันสำหรับทำงาน
const checkExpiredPayments = async () => {
    logger.info('Running job: Checking for expired payments...');
    try {
        const now = new Date();

        // 1. ค้นหา Orders ทั้งหมดที่สถานะเป็น AWAITING_PAYMENT และหมดเวลาแล้ว
        const expiredOrders = await prisma.order.findMany({
            where: {
                status: OrderStatus.AWAITING_PAYMENT,
                paymentExpiresAt: {
                    lt: now, // less than now
                },
            },
            select: {
                id: true, // เลือกมาแค่ ID เพื่อประสิทธิภาพ
            }
        });

        if (expiredOrders.length === 0) {
            logger.info('No expired payments found.');
            return;
        }

        const orderIds = expiredOrders.map(o => o.id);
        logger.warn(`Found ${orderIds.length} expired orders. Cancelling them... IDs: ${orderIds.join(', ')}`);

        // 2. อัปเดตสถานะ Orders ทั้งหมดที่หมดอายุเป็น CANCELLED และล้าง QR code
        const { count } = await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: {
                status: OrderStatus.CANCELLED,
                paymentQrCode: null,
                paymentExpiresAt: null,
            },
        });

        logger.info(`Successfully cancelled ${count} orders.`);

    } catch (error) {
        logger.error({ error }, 'An error occurred while checking for expired payments.');
    }
};

// ตั้งเวลาให้ทำงานทุกๆ 5 นาที
// รูปแบบคือ: '(นาที) (ชั่วโมง) (วัน) (เดือน) (วันในสัปดาห์)'
// '*/5 * * * *' = Run every 5 minutes
export const startPaymentExpirationJob = () => {
    cron.schedule('*/5 * * * *', checkExpiredPayments);
    logger.info('Payment expiration job scheduled to run every 5 minutes.');
};