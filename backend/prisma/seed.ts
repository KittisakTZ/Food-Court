import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 🔹 สร้างผู้ใช้หลัก 3 บัญชี (Admin / Seller / Buyer)
  const password = '123456'
  const hashPassword = await bcrypt.hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashPassword,
      email: 'admin@foodcourt.com',
      role: Role.ADMIN,
    },
  })

  const seller = await prisma.user.upsert({
    where: { username: 'seller' },
    update: {},
    create: {
      username: 'seller',
      password: hashPassword,
      email: 'seller@foodcourt.com',
      role: Role.SELLER,
    },
  })

  const buyer = await prisma.user.upsert({
    where: { username: 'buyer' },
    update: {},
    create: {
      username: 'buyer',
      password: hashPassword,
      email: 'buyer@foodcourt.com',
      role: Role.BUYER,
    },
  })

  // 🔹 สร้างร้านค้า (ยังไม่ approved)
  const store = await prisma.store.upsert({
    where: { name: 'ข้าวมันไก่คุณศรี' },
    update: {},
    create: {
      name: 'ข้าวมันไก่คุณศรี',
      description: 'ข้าวมันไก่ต้ม น้ำจิ้มรสเด็ดประจำมหาวิทยาลัย',
      location: 'อาคารโรงอาหารกลาง มหาวิทยาลัย DPU',
      image: '/uploads/khaomunkai.png',
      isApproved: false, // ✅ ต้องให้ admin อนุมัติก่อน
      ownerId: seller.id,
    },
  })

  // 🔹 สร้างหมวดหมู่เมนู
  const category = await prisma.menuCategory.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      name: 'อาหารจานเดียว',
      storeId: store.id,
    },
  })

  // 🔹 สร้างเมนูอาหาร
  const menu1 = await prisma.menu.create({
    data: {
      name: 'ข้าวมันไก่ต้ม',
      description: 'ข้าวมันไก่ต้มเนื้อนุ่ม น้ำจิ้มเต้าเจี้ยว',
      price: 40,
      image: '/uploads/boiled_chicken_rice.png',
      storeId: store.id,
      categoryId: category.id,
    },
  })

  const menu2 = await prisma.menu.create({
    data: {
      name: 'ข้าวมันไก่ทอด',
      description: 'ข้าวมันไก่ทอดกรอบ น้ำจิ้มเต้าเจี้ยวพริกเผา',
      price: 45,
      image: '/uploads/fried_chicken_rice.png',
      storeId: store.id,
      categoryId: category.id,
    },
  })

  // 🔹 สร้างรีวิวจากลูกค้า
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'อาหารอร่อยมาก บริการดีเยี่ยม!',
      isVisible: false, // ✅ feedback ภายในเท่านั้น
      storeId: store.id,
      userId: buyer.id,
    },
  })

  console.log('✅ Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })