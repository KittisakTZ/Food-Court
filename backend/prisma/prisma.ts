import {env} from "../src/common/utils/envConfig"
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const prismaInstance = new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    prismaInstance.$use(async (params, next) => {
        // ตรวจสอบเงื่อนไขเหมือนเดิม
        if (
            params.model === 'Store' &&
            params.action === 'update' && // <-- ทำให้เฉพาะเจาะจงขึ้นสำหรับ 'update' ก่อน
            params.args.data?.isApproved === true
        ) {
            const { where } = params.args;

            // 1. ดึงข้อมูลร้านค้า *ก่อน* เริ่ม Transaction เพื่อเช็คสถานะเดิม
            const storeToUpdate = await prismaInstance.store.findUnique({
                where: where,
                select: { id: true, isApproved: true },
            });
            
            // 2. ตรวจสอบว่าร้านมีอยู่จริง และกำลังจะถูกเปลี่ยนสถานะจาก false -> true
            if (storeToUpdate && !storeToUpdate.isApproved) {
                const storeId = storeToUpdate.id;

                // 3. ใช้ transaction เพื่อรวมการ update และการสร้าง partition
                // ✨ FIX: เราจะเรียก `next(params)` *ภายใน* transaction
                return await prismaInstance.$transaction(async (tx) => {
                    //console.log(`[Middleware] Approving Store ID: ${storeId}. Running in transaction...`);
                    
                    // 3.1. ปล่อยให้ operation การ update เดิมทำงานต่อไป แต่ใช้ transaction client (tx)
                    // Prisma จะฉลาดพอที่จะเปลี่ยน `prisma.store.update` ให้เป็น `tx.store.update`
                    const updateResult = await next(params); 

                    // 3.2. หลังจาก update สำเร็จ ก็สร้าง partition
                    try {
                        //console.log(`[Middleware] Store updated. Now creating partitions for ${storeId}...`);
                        await tx.$executeRaw`SELECT create_store_partitions(${storeId});`;
                        //console.log(`[Middleware] Partitions for store ${storeId} created successfully.`);
                    } catch (e) {
                        //console.error(`[Middleware] FATAL: Failed to create partition for store ${storeId}. Transaction will be rolled back.`, e);
                        throw e; // โยน error เพื่อให้ transaction ล้มเหลวและ rollback การ update
                    }
                    
                    // 3.3. คืนค่าผลลัพธ์ของการ update
                    return updateResult;
                });
            }
        }
        
        // ถ้าเงื่อนไขไม่ตรง ก็ทำงานต่อไปตามปกติ
        return next(params);
    });

    return prismaInstance;
};

// --- ส่วนที่เหลือของโค้ดคุณยังคงเหมือนเดิมทุกประการ ---
declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;