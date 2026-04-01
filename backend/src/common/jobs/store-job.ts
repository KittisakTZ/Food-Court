import cron from 'node-cron';
import prisma from '@src/db';
import { pino } from 'pino';

const logger = pino({ name: 'store-job' });

const checkStoreReopenTimes = async () => {
    try {
        const now = new Date();
        const storesToReopen = await prisma.store.findMany({
            where: {
                isOpen: false,
                reopenAt: { lte: now },
            },
            select: { id: true, name: true },
        });

        if (storesToReopen.length === 0) return;

        logger.info(`Auto-reopening ${storesToReopen.length} store(s)...`);

        await prisma.store.updateMany({
            where: { id: { in: storesToReopen.map(s => s.id) } },
            data: { isOpen: true, closeReason: null, reopenAt: null },
        });

        logger.info(`Reopened stores: ${storesToReopen.map(s => s.name).join(', ')}`);
    } catch (error) {
        logger.error({ error }, 'Error checking store reopen times.');
    }
};

export const startStoreReopenJob = () => {
    cron.schedule('* * * * *', checkStoreReopenTimes); // ทุก 1 นาที
    logger.info('Store reopen job scheduled.');
};
