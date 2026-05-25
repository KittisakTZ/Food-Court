import { env } from '@common/utils/envConfig';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;
