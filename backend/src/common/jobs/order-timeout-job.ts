import cron from 'node-cron';
import prisma from '@src/db';
import { OrderStatus } from '@prisma/client';
import { pino } from 'pino';
import { emitOrderUpdate, emitKdsUpdate } from '@src/socket';

const logger = pino({ name: 'order-timeout-job' });

const PENDING_TIMEOUT_MINUTES = 5;

const cancelTimedOutOrders = async () => {
    logger.info('Running job: Checking for timed-out pending orders...');
    try {
        const cutoff = new Date(Date.now() - PENDING_TIMEOUT_MINUTES * 60 * 1000);

        const timedOutOrders = await prisma.order.findMany({
            where: {
                status: OrderStatus.PENDING,
                createdAt: { lt: cutoff },
            },
            select: { id: true, storeId: true },
        });

        if (timedOutOrders.length === 0) {
            logger.info('No timed-out pending orders found.');
            return;
        }

        const orderIds = timedOutOrders.map(o => o.id);
        logger.warn(`Found ${orderIds.length} timed-out orders. Cancelling... IDs: ${orderIds.join(', ')}`);

        await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: {
                status: OrderStatus.CANCELLED,
                issueReason: 'Order automatically cancelled — store did not respond within 5 minutes.',
            },
        });

        for (const order of timedOutOrders) {
            emitOrderUpdate(order.id, {
                status: 'CANCELLED',
                cancelReason: 'Order automatically cancelled — store did not respond within 5 minutes.',
            });
            emitKdsUpdate(order.storeId, 'kds:order_update', { id: order.id, status: 'CANCELLED' });
        }

        logger.info(`Successfully cancelled ${orderIds.length} timed-out orders.`);

    } catch (error) {
        logger.error({ error }, 'An error occurred in the order timeout job.');
    }
};

export const startOrderTimeoutJob = () => {
    cron.schedule('* * * * *', cancelTimedOutOrders);
    logger.info('Order timeout job scheduled to run every minute.');
};
