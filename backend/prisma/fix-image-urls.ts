import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OLD_URL = 'http://localhost:5080';
const NEW_URL = 'https://food-court-api-ztao.onrender.com';

async function main() {
    const storeResult = await prisma.$executeRaw`
        UPDATE "Store"
        SET image = REPLACE(image, ${OLD_URL}, ${NEW_URL})
        WHERE image LIKE ${'%' + OLD_URL + '%'}
    `;

    const menuResult = await prisma.$executeRaw`
        UPDATE "Menu"
        SET image = REPLACE(image, ${OLD_URL}, ${NEW_URL})
        WHERE image LIKE ${'%' + OLD_URL + '%'}
    `;

    console.log(`✅ Updated ${storeResult} store(s), ${menuResult} menu(s)`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
