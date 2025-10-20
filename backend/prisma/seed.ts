import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  const password = '123456'
  const hashPassword = await bcrypt.hash(password, 10)

  // 🔹 บัญชีผู้ใช้หลัก
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

  // 🔹 สร้างผู้ขายหลายคน
  const sellersData = [
    { username: 'seller1', email: 'seller1@foodcourt.com', storeName: 'ข้าวมันไก่คุณศรี' },
    { username: 'seller2', email: 'seller2@foodcourt.com', storeName: 'ก๋วยเตี๋ยวเรืออยุธยา' },
    { username: 'seller3', email: 'seller3@foodcourt.com', storeName: 'ชาไข่มุกคุณนุ่น' },
  ]

  for (const s of sellersData) {
    const seller = await prisma.user.upsert({
      where: { username: s.username },
      update: {},
      create: {
        username: s.username,
        password: hashPassword,
        email: s.email,
        role: Role.SELLER,
      },
    })

    // 🔹 สร้างร้านค้า
    const store = await prisma.store.upsert({
      where: { name: s.storeName },
      update: {},
      create: {
        name: s.storeName,
        description: `ร้าน ${s.storeName} ประจำโรงอาหาร`,
        location: 'โรงอาหารกลาง DPU',
        image: '/uploads/default_store.png',
        isApproved: true,
        isOpen: true,
        ownerId: seller.id,
      },
    })

    // 🔹 สร้างหมวดหมู่
    const categories = await Promise.all([
      prisma.menuCategory.create({
        data: { name: 'อาหารจานเดียว', storeId: store.id },
      }),
      prisma.menuCategory.create({
        data: { name: 'เครื่องดื่ม', storeId: store.id },
      }),
    ])

    // 🔹 เพิ่มเมนูตามร้าน
    if (s.storeName.includes('ข้าวมันไก่')) {
      await prisma.menu.createMany({
        data: [
          {
            name: 'ข้าวมันไก่ต้ม',
            description: 'ข้าวมันไก่ต้มเนื้อนุ่ม น้ำจิ้มเต้าเจี้ยว',
            price: 40,
            image: '/uploads/boiled_chicken_rice.png',
            storeId: store.id,
            categoryId: categories[0].id,
          },
          {
            name: 'ข้าวมันไก่ทอด',
            description: 'ข้าวมันไก่ทอดกรอบ น้ำจิ้มเต้าเจี้ยวพริกเผา',
            price: 45,
            image: '/uploads/fried_chicken_rice.png',
            storeId: store.id,
            categoryId: categories[0].id,
          },
          {
            name: 'ข้าวมันไก่รวม',
            description: 'รวมไก่ต้มและทอดในจานเดียว',
            price: 55,
            image: '/uploads/mixed_chicken_rice.png',
            storeId: store.id,
            categoryId: categories[0].id,
          },
        ],
      })
    } else if (s.storeName.includes('ก๋วยเตี๋ยว')) {
      await prisma.menu.createMany({
        data: [
          {
            name: 'ก๋วยเตี๋ยวเรือหมูน้ำตก',
            description: 'น้ำซุปเข้มข้น เส้นเหนียวนุ่ม',
            price: 40,
            image: '/uploads/noodle_pork.png',
            storeId: store.id,
            categoryId: categories[0].id,
          },
          {
            name: 'ก๋วยเตี๋ยวต้มยำรวมมิตร',
            description: 'จัดจ้านถึงใจ ใส่ลูกชิ้น หมูเด้ง หมูสับ',
            price: 50,
            image: '/uploads/noodle_tomyum.png',
            storeId: store.id,
            categoryId: categories[0].id,
          },
        ],
      })
    } else if (s.storeName.includes('ชาไข่มุก')) {
      await prisma.menu.createMany({
        data: [
          {
            name: 'ชาไทยไข่มุก',
            description: 'ชาไทยสูตรเข้มข้น หอม หวาน มัน',
            price: 35,
            image: '/uploads/thai_milk_tea.png',
            storeId: store.id,
            categoryId: categories[1].id,
          },
          {
            name: 'โกโก้ไข่มุก',
            description: 'โกโก้เข้มข้น หอมละมุน',
            price: 40,
            image: '/uploads/cocoa_milk_tea.png',
            storeId: store.id,
            categoryId: categories[1].id,
          },
          {
            name: 'มัทฉะลาเต้',
            description: 'มัทฉะแท้จากญี่ปุ่น หอมละมุน',
            price: 45,
            image: '/uploads/matcha_latte.png',
            storeId: store.id,
            categoryId: categories[1].id,
          },
        ],
      })
    }

    // 🔹 รีวิวจำลองจาก buyer
    await prisma.review.create({
      data: {
        rating: 5,
        comment: `อาหารจากร้าน ${s.storeName} อร่อยมาก!`,
        isVisible: true,
        storeId: store.id,
        userId: buyer.id,
      },
    })
  }

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
