import { PrismaClient, Role, OrderStatus, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // --- 1. SETUP INITIAL DATA ---
  const password = '123123'
  const hashPassword = await bcrypt.hash(password, 10)

  // --- 2. CREATE CORE USERS ---
  console.log('👤 Creating core users (admin, buyer)...')
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

  // --- 3. CREATE SELLERS AND THEIR STORES ---
  console.log('🏪 Creating sellers and stores...')
  const sellersData = [
    // ✨ (ปรับปรุง) เพิ่ม key: promptPayId เข้าไป
    { username: 'seller1', email: 'seller1@foodcourt.com', storeName: 'ข้าวมันไก่คุณศรี', promptPayId: '0812345671' },
    { username: 'seller2', email: 'seller2@foodcourt.com', storeName: 'ก๋วยเตี๋ยวเรืออยุธยา', promptPayId: '0812345672' },
    { username: 'seller3', email: 'seller3@foodcourt.com', storeName: 'ชาไข่มุกคุณนุ่น', promptPayId: '0812345673' },
  ]

  for (const s of sellersData) {
    // 🔹 สร้างผู้ขาย
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
      update: {
        ownerId: seller.id,
        promptPayId: s.promptPayId, // ✨ (เพิ่ม) เพิ่มการอัปเดตเผื่อรันซ้ำ
      },
      create: {
        name: s.storeName,
        description: `ร้าน ${s.storeName} ประจำโรงอาหาร`,
        location: 'โรงอาหารกลาง DPU',
        image: '/uploads/default_store.png',
        promptPayId: s.promptPayId, // ✨ (เพิ่ม) เพิ่มตอนสร้างข้อมูลใหม่
        isApproved: true,
        isOpen: true,
        ownerId: seller.id,
      },
    })

    // ✨ [SOLUTION] ที่เคยทำไว้ยังคงอยู่เหมือนเดิม ไม่ต้องเอาออก
    console.log(`  └─ 🗂️  Creating partitions for store: ${store.name}`);
    await prisma.$executeRaw`SELECT create_store_partitions(${store.id})`;


    // 🔹 สร้างหมวดหมู่
    // หมายเหตุ: เพื่อให้ upsert ทำงานได้ ควรมั่นใจว่าใน schema.prisma ของ MenuCategory มี `@@unique([name, storeId])`
    const mainCategory = await prisma.menuCategory.upsert({
      where: { name_storeId: { name: 'อาหารจานเดียว', storeId: store.id } },
      update: {},
      create: { name: 'อาหารจานเดียว', storeId: store.id },
    })
    const drinkCategory = await prisma.menuCategory.upsert({
      where: { name_storeId: { name: 'เครื่องดื่ม', storeId: store.id } },
      update: {},
      create: { name: 'เครื่องดื่ม', storeId: store.id },
    })

    // (ส่วนที่เหลือของไฟล์เหมือนเดิมทุกประการ)
    // ...

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
            categoryId: mainCategory.id,
          },
          {
            name: 'ข้าวมันไก่ทอด',
            description: 'ข้าวมันไก่ทอดกรอบ น้ำจิ้มเต้าเจี้ยวพริกเผา',
            price: 45,
            image: '/uploads/fried_chicken_rice.png',
            storeId: store.id,
            categoryId: mainCategory.id,
          },
          {
            name: 'ข้าวมันไก่รวม',
            description: 'รวมไก่ต้มและทอดในจานเดียว',
            price: 55,
            image: '/uploads/mixed_chicken_rice.png',
            storeId: store.id,
            categoryId: mainCategory.id,
          },
        ],
        skipDuplicates: true,
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
            categoryId: mainCategory.id,
          },
          {
            name: 'ก๋วยเตี๋ยวต้มยำรวมมิตร',
            description: 'จัดจ้านถึงใจ ใส่ลูกชิ้น หมูเด้ง หมูสับ',
            price: 50,
            image: '/uploads/noodle_tomyum.png',
            storeId: store.id,
            categoryId: mainCategory.id,
          },
        ],
        skipDuplicates: true,
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
            categoryId: drinkCategory.id,
          },
          {
            name: 'โกโก้ไข่มุก',
            description: 'โกโก้เข้มข้น หอมละมุน',
            price: 40,
            image: '/uploads/cocoa_milk_tea.png',
            storeId: store.id,
            categoryId: drinkCategory.id,
          },
          {
            name: 'มัทฉะลาเต้',
            description: 'มัทฉะแท้จากญี่ปุ่น หอมละมุน',
            price: 45,
            image: '/uploads/matcha_latte.png',
            storeId: store.id,
            categoryId: drinkCategory.id,
          },
        ],
        skipDuplicates: true,
      })
    }
  }

  // =================================================================
  // --- 4. CREATE SAMPLE ORDERS ---
  // =================================================================
  console.log('🛒 Seeding sample orders...')

  await prisma.order.deleteMany({
    where: { buyerId: buyer.id },
  })

  const khaoManKaiStore = await prisma.store.findUnique({ where: { name: 'ข้าวมันไก่คุณศรี' } })
  const noodleStore = await prisma.store.findUnique({ where: { name: 'ก๋วยเตี๋ยวเรืออยุธยา' } })

  if (!khaoManKaiStore || !noodleStore) {
    console.error('❌ Could not find stores for order seeding. Aborting.')
    return
  }

  const khaoManKaiMenus = await prisma.menu.findMany({ where: { storeId: khaoManKaiStore.id } })
  const noodleMenus = await prisma.menu.findMany({ where: { storeId: noodleStore.id } })

  if (khaoManKaiMenus.length < 2 || noodleMenus.length < 1) {
    console.error('❌ Could not find menus for order seeding. Aborting.')
    return
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- ออร์เดอร์ที่ 1: จ่ายด้วย PromptPay, รอร้านตรวจสอบสลิป (AWAITING_CONFIRMATION) ---
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: khaoManKaiStore.id,
      status: OrderStatus.AWAITING_CONFIRMATION,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 45,
      position: 1,
      queueNumber: 1,
      orderDate: today,
      confirmedAt: new Date(Date.now() - 10 * 60 * 1000),
      paymentQrCode: `https://promptpay.io/0812345678/45.00.png`,
      paymentSlip: '/uploads/sample_slip.png',
      orderItems: {
        create: {
          storeId: khaoManKaiStore.id,
          menuId: khaoManKaiMenus[1].id,
          quantity: 1,
          subtotal: 45,
        },
      },
    },
  })

  // --- ออร์เดอร์ที่ 2: จ่ายเงินสดหน้าร้าน, กำลังทำ (COOKING) ---
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: noodleStore.id,
      status: OrderStatus.COOKING,
      paymentMethod: PaymentMethod.CASH_ON_PICKUP,
      totalAmount: 40,
      position: 2,
      queueNumber: 2,
      orderDate: today,
      confirmedAt: new Date(Date.now() - 5 * 60 * 1000),
      orderItems: {
        create: {
          storeId: noodleStore.id,
          menuId: noodleMenus[0].id,
          quantity: 1,
          subtotal: 40,
        },
      },
    },
  })

  // --- ออร์เดอร์ที่ 3: ออร์เดอร์ที่เสร็จสมบูรณ์แล้วจากเมื่อวาน (COMPLETED) ---
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const completedOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: khaoManKaiStore.id,
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 95,
      position: 1,
      queueNumber: 1,
      orderDate: yesterday,
      createdAt: new Date(yesterday.getTime() + 12 * 3600 * 1000),
      confirmedAt: new Date(yesterday.getTime() + 12 * 3600 * 1000 + 60000),
      paidAt: new Date(yesterday.getTime() + 12 * 3600 * 1000 + 120000),
      completedAt: new Date(yesterday.getTime() + 12 * 3600 * 1000 + 900000),
      orderItems: {
        createMany: {
          data: [
            { storeId: khaoManKaiStore.id, menuId: khaoManKaiMenus[0].id, quantity: 1, subtotal: 40 },
            { storeId: khaoManKaiStore.id, menuId: khaoManKaiMenus[2].id, quantity: 1, subtotal: 55 },
          ]
        }
      }
    }
  })

  // --- ออร์เดอร์ที่ 4: เพิ่งสร้าง, รอร้านยืนยัน (PENDING) ---
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: khaoManKaiStore.id,
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 40,
      position: 3,
      queueNumber: 3,
      orderDate: today,
      createdAt: new Date(Date.now() - 60 * 1000),
      orderItems: {
        create: {
          storeId: khaoManKaiStore.id,
          menuId: khaoManKaiMenus[0].id,
          quantity: 1,
          subtotal: 40,
        },
      },
    }
  });

  // --- ออร์เดอร์ที่ 5: ร้านยืนยันแล้ว, รอจ่ายเงิน (AWAITING_PAYMENT) ---
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: noodleStore.id,
      status: OrderStatus.AWAITING_PAYMENT,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 50,
      position: 4,
      queueNumber: 4,
      orderDate: today,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
      confirmedAt: new Date(Date.now() - 30 * 1000),
      paymentQrCode: `https://promptpay.io/0812345678/50.00.png`,
      paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      orderItems: {
        create: {
          storeId: noodleStore.id,
          menuId: noodleMenus[1].id,
          quantity: 1,
          subtotal: 50,
        },
      },
    }
  });

  // --- 5. CREATE SAMPLE REVIEW FOR COMPLETED ORDER ---
  console.log('📝 Seeding sample review...');
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'อร่อยมากครับ! สั่งเมื่อวาน ได้รับของเร็วมาก',
      isVisible: true,
      storeId: completedOrder.storeId,
      userId: completedOrder.buyerId,
      orderId: completedOrder.id,
    }
  });


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