import { env } from '@common/utils/envConfig';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const prismaInstance = new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    prismaInstance.$use(async (params, next) => {
        // ตรวจสอบเงื่อนไขเหมือนเดิม
        if (
            params.model === 'Store' &&
            params.action === 'update' &&
            params.args.data?.isApproved === true
        ) {
            const { where } = params.args;

            // 1. ดึงข้อมูลร้านค้า *ก่อน* ที่จะทำการอัปเดต เพื่อเก็บสถานะเดิมไว้
            const storeBeforeUpdate = await prismaInstance.store.findUnique({
                where: where,
                select: { id: true, isApproved: true },
            });
            
            // 2. ปล่อยให้ operation การ update เดิมทำงานไปให้เสร็จก่อน
            const updateResult = await next(params);

            // 3. ✨ AFTER HOOK LOGIC ✨: ทำงานหลังจาก `next()` เสร็จแล้ว
            // ตรวจสอบว่าร้านมีอยู่จริง และสถานะเดิมคือ `false`
            if (storeBeforeUpdate && !storeBeforeUpdate.isApproved) {
                const storeId = storeBeforeUpdate.id;
                
                //console.log(`[Middleware-After] Store ID: ${storeId} was approved.`);
                //console.log(`[Middleware-After] Triggering partition creation...`);
                
                try {
                    // 4. เรียกใช้คำสั่งสร้าง Partition โดยตรง (ไม่ต้องใช้ transaction แล้ว)
                    // เราเรียก `prismaInstance` ตัวหลักได้เลย เพราะ operation นี้แยกขาดจาก `update` เดิม
                    await prismaInstance.$executeRaw`SELECT create_store_partitions(${storeId});`;
                    //console.log(`[Middleware-After] Partitions for store ${storeId} created successfully.`);
                } catch (e) {
                    // จัดการ Error ที่อาจเกิดขึ้นจากการสร้าง Partition
                    // เช่น อาจจะส่ง email แจ้งเตือน Admin ว่าการสร้าง partition ล้มเหลว
                    console.error(`[Middleware-After] FATAL: Failed to create partition for store ${storeId} after it was approved. Please check manually.`, e);
                }
            }
            
            // 5. คืนค่าผลลัพธ์ของการ update กลับไป
            return updateResult;
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