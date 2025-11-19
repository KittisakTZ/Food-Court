import { PrismaClient, Role, OrderStatus, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// --- DATA STRUCTURE FOR STORES ---
const storesData = [
  // 1. Me waffle
  {
    storeName: 'Me waffle',
    username: 'seller_waffle',
    email: 'seller.waffle@foodcourt.com',
    promptPayId: '0942874935',
    description: 'วาฟเฟิลฮ่องกงร้อนๆ กรอบนอกนุ่มใน ไส้แน่นทุกชิ้น',
    categories: [
      {
        name: 'วาฟเฟิลไส้หวาน',
        menus: [
          { name: 'ผลไม้รวม', price: 10 },
          { name: 'เผือก', price: 10 },
          { name: 'ครีม', price: 10 },
          { name: 'เนย น้ำตาล', price: 10 },
          { name: 'ลูกเกด', price: 10 },
          { name: 'สังขยา', price: 10 },
          { name: 'ช็อกโกแลต', price: 10 },
          { name: 'ฝอยทอง', price: 10 },
          { name: 'ชีส', price: 10 },
          { name: 'อัลมอนด์', price: 10 },
          { name: 'ข้าวโพด', price: 10 },
          { name: 'สตรอว์เบอร์รี่', price: 10 },
        ],
      },
    ],
  },
  // 2. ไจแอ้นลูกชิ้นระเบิด
  {
    storeName: 'ไจแอ้นลูกชิ้นระเบิด',
    username: 'seller_giant',
    email: 'seller.giant@foodcourt.com',
    promptPayId: '0852535588',
    description: 'ลูกชิ้นระเบิด กรอบสะใจ น้ำจิ้มรสเด็ด',
    categories: [
      {
        name: 'ลูกชิ้นทอด',
        menus: [
          { name: 'ลูกชิ้นปลา (S)', price: 35 },
          { name: 'ลูกชิ้นปลา (M)', price: 45 },
          { name: 'ลูกชิ้นปลา (L)', price: 55 },
          { name: 'ลูกชิ้นปลา (XL)', price: 65 },
          { name: 'ลูกชิ้นกุ้ง (S)', price: 35 },
          { name: 'ลูกชิ้นกุ้ง (M)', price: 45 },
          { name: 'ลูกชิ้นไก่ (S)', price: 35 },
          { name: 'ลูกชิ้นไก่ (M)', price: 45 },
          { name: 'ผสมสามเกลอ (ปลา, กุ้ง, ไก่) (M)', price: 50 },
          { name: 'ผสมสามเกลอ (ปลา, กุ้ง, ไก่) (L)', price: 60 },
        ],
      },
      {
        name: 'น้ำจิ้ม (สั่งเพิ่ม)',
        menus: [
            { name: 'น้ำจิ้มต้นตำรับ (ถ้วย)', price: 5 },
            { name: 'น้ำจิ้มซี้ดซ้าด (ถ้วย)', price: 5 },
        ]
      }
    ],
  },
  // 3. ร้านน้ำมอ (RAAN-NAM-MORE)
  {
    storeName: 'ร้านน้ำมอ(RAAN-NAM-MORE)',
    username: 'seller_nammore',
    email: 'seller.nammore@foodcourt.com',
    promptPayId: '0639271202',
    description: 'รวมเครื่องดื่มทุกชนิด สดชื่นทุกเวลา',
    categories: [
        {
            name: 'น้ำชง',
            menus: [
                { name: 'นมเย็น', price: 25 },
                { name: 'โกโก้เย็น', price: 25 },
                { name: 'ชามะนาว', price: 25 },
                { name: 'ชานมเย็น', price: 25 },
                { name: 'ชาเขียวนม', price: 25 },
                { name: 'โอเลี้ยง', price: 20 },
                { name: 'กาแฟโบราณ', price: 20 },
                { name: 'น้ำแดงมะนาวโซดา', price: 30 },
                { name: 'น้ำผึ้งมะนาว', price: 30 },
                { name: 'นมสดคาราเมล', price: 30 },
            ]
        },
        {
            name: 'น้ำอัดลม',
            menus: [
                { name: 'โค้ก (แก้ว)', price: 15 },
                { name: 'เป๊ปซี่ (แก้ว)', price: 15 },
                { name: 'แฟนต้า น้ำแดง (แก้ว)', price: 15 },
                { name: 'แฟนต้า น้ำส้ม (แก้ว)', price: 15 },
                { name: 'สไปรท์ (แก้ว)', price: 15 },
            ]
        },
        {
            name: 'นม',
            menus: [
                { name: 'นมจืด', price: 15 },
                { name: 'นมช็อกโกแลต', price: 15 },
                { name: 'นมเปรี้ยว', price: 15 },
            ]
        },
         {
            name: 'น้ำเปล่า',
            menus: [
                { name: 'น้ำเปล่า (ขวด)', price: 10 },
            ]
        }
    ]
  },
  // 4. ณิชา ข้าวมันไก่ (NICHA CHICKEN RICE)
  {
    storeName: 'ณิชา ข้าวมันไก่(NICHA CHICKEN RICE)',
    username: 'seller_nicha',
    email: 'seller.nicha@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ข้าวมันไก่สูตรเด็ด ไก่นุ่ม ข้าวมันหอม น้ำจิ้มรสเลิศ',
    categories: [
      {
        name: 'ข้าวมันไก่',
        menus: [
          { name: 'ข้าวมันไก่ต้ม (ธรรมดา)', price: 40 },
          { name: 'ข้าวมันไก่ต้ม (พิเศษ)', price: 45 },
          { name: 'ข้าวมันไก่ทอด (ธรรมดา)', price: 40 },
          { name: 'ข้าวมันไก่ทอด (พิเศษ)', price: 45 },
          { name: 'ข้าวมันไก่ผสม (ต้ม+ทอด)', price: 50 },
          { name: 'ข้าวมันไก่ต้ม (ไม่หนัง)', price: 40 },
          { name: 'ไก่ต้ม (จาน)', price: 60 },
          { name: 'ไก่ทอด (จาน)', price: 60 },
          { name: 'ข้าวมันเปล่า', price: 10 },
          { name: 'ซุป', price: 5 },
        ],
      },
    ],
  },
  // 5. ครัวปักษ์ใต้ (KRUAW PAKS TAI)
  {
    storeName: 'ครัวปักษ์ใต้(KRUAW PAKS TAI)',
    username: 'seller_pakstai',
    email: 'seller.pakstai@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารใต้รสจัดจ้าน ถึงเครื่องแกงใต้แท้ๆ',
    categories: [
        {
            name: 'แกง',
            menus: [
                { name: 'แกงไตปลา', price: 60 },
                { name: 'แกงส้มปลา', price: 70 },
                { name: 'แกงเหลืองหน่อไม้ดอง', price: 70 },
                { name: 'พะแนงหมู', price: 65 },
                { name: 'เขียวหวานไก่', price: 60 },
            ]
        },
        {
            name: 'ผัด',
            menus: [
                { name: 'คั่วกลิ้งหมูสับ', price: 65 },
                { name: 'หมูผัดกะปิ', price: 65 },
                { name: 'ใบเหลียงผัดไข่', price: 60 },
                { name: 'ผัดสะตอกะปิกุ้ง', price: 80 },
                { name: 'ไก่ผัดขมิ้น', price: 60 },
            ]
        },
        {
            name: 'ของทอด',
            menus: [
                { name: 'หมูทอด', price: 50 },
                { name: 'ไก่ทอดหาดใหญ่', price: 50 },
                { name: 'ปลาทอดขมิ้น', price: 70 },
                { name: 'ไข่เจียว', price: 40 },
            ]
        },
        {
            name: 'เครื่องเคียงและอื่นๆ',
            menus: [
                { name: 'ไข่พะโล้', price: 50 },
                { name: 'น้ำพริกกะปิ + ผักสด', price: 45 },
                { name: 'ขนมจีนน้ำยาปักษ์ใต้', price: 50 },
                { name: 'ข้าวราดแกง 1 อย่าง', price: 45 },
                { name: 'ข้าวราดแกง 2 อย่าง', price: 55 },
                { name: 'ข้าวสวย', price: 10 },
            ]
        }
    ]
  },
  // 6. เด็กสมบูรณ์ (DEKSOMBURN)
  {
    storeName: 'เด็กสมบูรณ์(DEKSOMBURN)',
    username: 'seller_deksomburn',
    email: 'seller.deksomburn@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ก๋วยเตี๋ยวรสเด็ด น้ำซุปกลมกล่อม',
    categories: [
        {
            name: 'ก๋วยเตี๋ยวต้มยำ',
            menus: [
                { name: 'เล็กต้มยำหมู', price: 50 },
                { name: 'ใหญ่ต้มยำหมู', price: 50 },
                { name: 'หมี่ต้มยำหมู', price: 50 },
                { name: 'วุ้นเส้นต้มยำรวมมิตร', price: 60 },
            ]
        },
        {
            name: 'ก๋วยเตี๋ยวน้ำใส',
            menus: [
                { name: 'เล็กน้ำใสลูกชิ้นปลา', price: 45 },
                { name: 'ใหญ่น้ำใสหมู', price: 45 },
                { name: 'หมี่น้ำใสไก่', price: 45 },
            ]
        },
        {
            name: 'ก๋วยเตี๋ยวแห้ง',
            menus: [
                { name: 'บะหมี่แห้งหมูแดง', price: 50 },
                { name: 'เล็กแห้งต้มยำ', price: 50 },
            ]
        },
        {
            name: 'เย็นตาโฟ',
            menus: [
                { name: 'เย็นตาโฟ', price: 55 },
                { name: 'เย็นตาโฟต้มยำ', price: 60 },
            ]
        },
    ]
  },
  // 7. ครัวพระราม (KRUA-PRA-RAM)
  {
    storeName: 'ครัวพระราม(KRUA-PRA-RAM)',
    username: 'seller_prarama',
    email: 'seller.prarama@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารตามสั่งจานด่วน สดใหม่ทุกจาน (ระบุได้ เช่น ไม่ใส่ผัก, เผ็ดน้อย)',
    categories: [
        {
            name: 'เมนูผัด',
            menus: [
                { name: 'กะเพราหมูสับ', price: 50 },
                { name: 'คะน้าหมูกรอบ', price: 60 },
                { name: 'ผัดพริกแกงไก่', price: 55 },
                { name: 'หมูทอดกระเทียม', price: 55 },
                { name: 'ผัดผักรวมมิตร', price: 50 },
            ]
        },
        {
            name: 'เมนูต้ม',
            menus: [
                { name: 'ต้มยำกุ้ง', price: 80 },
                { name: 'ต้มข่าไก่', price: 70 },
                { name: 'แกงจืดเต้าหู้หมูสับ', price: 60 },
            ]
        },
        {
            name: 'เมนูเส้น',
            menus: [
                { name: 'มาม่าผัดขี้เมาทะเล', price: 65 },
                { name: 'สุกี้แห้ง', price: 60 },
                { name: 'ราดหน้าหมูหมัก', price: 55 },
            ]
        },
        {
            name: 'เมนูไข่',
            menus: [
                { name: 'ข้าวไข่เจียวหมูสับ', price: 45 },
                { name: 'ไข่ดาว', price: 10 },
            ]
        },
        {
            name: 'เมนูข้าวผัด',
            menus: [
                { name: 'ข้าวผัดหมู', price: 50 },
                { name: 'ข้าวผัดกุ้ง', price: 60 },
                { name: 'ข้าวผัดอเมริกัน', price: 70 },
            ]
        },
    ]
  },
  // 8. ครัวอินเตอร์ (KRUA-INTER)
  {
    storeName: 'ครัวอินเตอร์(KRUA-INTER)',
    username: 'seller_inter',
    email: 'seller.inter@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารนานาชาติและฟิวชั่น อร่อยหลากหลายสไตล์',
    categories: [
        {
            name: 'สปาเก็ตตี้',
            menus: [
                { name: 'สปาเก็ตตี้คาโบนาร่า', price: 89 },
                { name: 'สปาเก็ตตี้ซอสหมู', price: 79 },
                { name: 'สปาเก็ตตี้ขี้เมาทะเล', price: 99 },
            ]
        },
        {
            name: 'สเต็ก',
            menus: [
                { name: 'สเต็กหมูพริกไทยดำ', price: 129 },
                { name: 'สเต็กไก่สไปซี่', price: 119 },
                { name: 'ฟิชแอนด์ชิปส์', price: 109 },
            ]
        },
        {
            name: 'ของทานเล่น',
            menus: [
                { name: 'ผักโขมอบชีส', price: 79 },
                { name: 'เฟรนช์ฟรายส์', price: 49 },
                { name: 'นักเก็ตไก่', price: 59 },
            ]
        },
    ]
  },
  // 9. ครัวช่อพุด (CHOPUD KITCHEN)
  {
    storeName: 'ครัวช่อพุด(CHOPUD KITCHEN)',
    username: 'seller_chopud',
    email: 'seller.chopud@foodcourt.com',
    promptPayId: '0639271202',
    description: 'มื้อเช้าและมื้อดึก อุ่นร้อนคล่องคอ',
    categories: [
        {
            name: 'ต้มเล้ง',
            menus: [
                { name: 'เล้งแซ่บ (ชาม)', price: 80 },
                { name: 'เล้งแซ่บ (หม้อไฟ)', price: 150 },
            ]
        },
        {
            name: 'ข้าวต้ม/โจ๊ก',
            menus: [
                { name: 'ข้าวต้มปลา', price: 60 },
                { name: 'โจ๊กหมูใส่ไข่', price: 50 },
                { name: 'โจ๊กเปล่า', price: 20 },
            ]
        },
        {
            name: 'ต้มเลือดหมู',
            menus: [
                { name: 'ต้มเลือดหมู', price: 60 },
                { name: 'เกาเหลาเลือดหมู', price: 60 },
            ]
        },
        {
            name: 'เกี๊ยว',
            menus: [
                { name: 'เกี๊ยวน้ำหมู', price: 50 },
                { name: 'เกี๊ยวกุ้ง', price: 60 },
            ]
        }
    ]
  },
  // 10. ฮาซัน (Hason)
  {
    storeName: 'ฮาซัน(Hason)',
    username: 'seller_hason',
    email: 'seller.hason@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารมุสลิม ข้าวหมกหอมเครื่องเทศ ซุปเนื้อรสเด็ด',
    categories: [
        {
            name: 'ข้าวหมก',
            menus: [
                { name: 'ข้าวหมกไก่ต้ม', price: 50 },
                { name: 'ข้าวหมกไก่ทอด', price: 55 },
                { name: 'ข้าวหมกเนื้อ', price: 70 },
                { name: 'พิเศษไก่', price: 65 },
                { name: 'พิเศษเนื้อ', price: 80 },
            ]
        },
        {
            name: 'เมนูพิเศษ',
            menus: [
                { name: 'ซุปเนื้อ', price: 80 },
                { name: 'กะเพราเนื้อราดข้าว', price: 75 },
                { name: 'สลัดแขก', price: 50 },
            ]
        }
    ]
  },
  // 11. กาแฟมอ (COFFEE'S MORE)
  {
    storeName: 'กาแฟมอ(COFFEE\'S MORE)',
    username: 'seller_coffeemore',
    email: 'seller.coffeemore@foodcourt.com',
    promptPayId: '0639271202',
    description: 'กาแฟสด ชาพรีเมี่ยม และเครื่องดื่มหลากหลาย',
    categories: [
        {
            name: 'กาแฟ',
            menus: [
                { name: 'เอสเพรสโซ่ (ร้อน)', price: 40 },
                { name: 'อเมริกาโน่ (เย็น)', price: 50 },
                { name: 'ลาเต้ (เย็น)', price: 55 },
                { name: 'คาปูชิโน่ (เย็น)', price: 55 },
                { name: 'มอคค่า (เย็น)', price: 60 },
                { name: 'อเมริกาโน่ (ปั่น)', price: 60 },
                { name: 'ลาเต้ (ปั่น)', price: 65 },
            ]
        },
        {
            name: 'ชา',
            menus: [
                { name: 'ชาไทย (เย็น)', price: 45 },
                { name: 'ชาเขียวมัทฉะ (เย็น)', price: 55 },
                { name: 'ชาพีช (เย็น)', price: 50 },
                { name: 'ชาไทย (ปั่น)', price: 55 },
                { name: 'ชาเขียวมัทฉะ (ปั่น)', price: 65 },
            ]
        },
        {
            name: 'อื่นๆ',
            menus: [
                { name: 'โกโก้ (เย็น/ปั่น)', price: 55 },
                { name: 'นมสดคาราเมล (เย็น/ปั่น)', price: 55 },
                { name: 'อิตาเลี่ยนโซดา', price: 45 },
            ]
        }
    ]
  },
  // 12. ไข่เจียวทรงเครื่อง (KAI-JIAO-SONG-KRUENG)
  {
    storeName: 'ไข่เจียวทรงเครื่อง(KAI-JIAO-SONG-KRUENG)',
    username: 'seller_kaijiao',
    email: 'seller.kaijiao@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ไข่เจียวร้อนๆ เลือกเครื่องได้ตามใจชอบ',
    categories: [
        {
            name: 'ไข่เจียวราดข้าว',
            menus: [
                { name: 'ไข่เจียวเปล่า (2ฟอง)', price: 35 },
                { name: 'ไข่เจียวหมูสับ', price: 40 },
                { name: 'ไข่เจียวแหนม', price: 40 },
                { name: 'ไข่เจียวปูอัด', price: 40 },
                { name: 'ไข่เจียวทรงเครื่อง (เลือก 2 อย่าง)', price: 45 },
                { name: 'ไข่เจียวทรงเครื่อง (เลือก 3 อย่าง)', price: 50 },
                { name: 'เพิ่มชีส', price: 10 },
                { name: 'เพิ่มซอส (พริก/มะเขือเทศ)', price: 0 },
            ]
        }
    ]
  },
]


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

  // --- 3. CREATE SELLERS, STORES, CATEGORIES, AND MENUS ---
  console.log('🏪 Creating sellers and stores from new data structure...')

  for (const storeData of storesData) {
    // 🔹 Create Seller
    const seller = await prisma.user.upsert({
      where: { username: storeData.username },
      update: {},
      create: {
        username: storeData.username,
        password: hashPassword,
        email: storeData.email,
        role: Role.SELLER,
      },
    })
    console.log(`  └─ 👤 Created seller: ${seller.username}`)

    // 🔹 Create Store
    const store = await prisma.store.upsert({
      where: { name: storeData.storeName },
      update: {
        ownerId: seller.id,
        promptPayId: storeData.promptPayId,
      },
      create: {
        name: storeData.storeName,
        description: storeData.description,
        location: 'โรงอาหารกลาง DPU',
        image: '/uploads/default_store.png',
        promptPayId: storeData.promptPayId,
        isApproved: true,
        isOpen: true,
        ownerId: seller.id,
      },
    })
    console.log(`  └─ 🏪 Created store: ${store.name}`)


    // 🔹 Create Partitions for the new store
    console.log(`  └─ 🗂️  Creating partitions for store: ${store.name}`);
    await prisma.$executeRaw`SELECT create_store_partitions(${store.id})`;


    // 🔹 Create Categories and Menus for the store
    for (const categoryData of storeData.categories) {
      const category = await prisma.menuCategory.upsert({
        where: { name_storeId: { name: categoryData.name, storeId: store.id } },
        update: {},
        create: { name: categoryData.name, storeId: store.id },
      })
      console.log(`    └─ 📜 Created category: ${category.name}`)


      const menusToCreate = categoryData.menus.map(menu => ({
        ...menu,
        storeId: store.id,
        categoryId: category.id,
        image: `/uploads/default_menu.png`, // Default image
      }))

      await prisma.menu.createMany({
        data: menusToCreate,
        skipDuplicates: true,
      })
      console.log(`      └─ 🍔 Created ${menusToCreate.length} menus for this category.`)
    }
  }


  // =================================================================
  // --- 4. CREATE SAMPLE ORDERS ---
  // =================================================================
  console.log('🛒 Seeding sample orders...')

  // Clear previous orders for the sample buyer to avoid duplicates
  await prisma.order.deleteMany({
    where: { buyerId: buyer.id },
  })

  // **สำคัญ**: อัปเดตชื่อร้านค้าให้ตรงกับข้อมูลใหม่
  const nichaStore = await prisma.store.findUnique({ where: { name: 'ณิชา ข้าวมันไก่(NICHA CHICKEN RICE)' } })
  const deksomburnStore = await prisma.store.findUnique({ where: { name: 'เด็กสมบูรณ์(DEKSOMBURN)' } })

  if (!nichaStore || !deksomburnStore) {
    console.error('❌ Could not find stores for order seeding. Aborting.')
    return
  }

  const nichaMenus = await prisma.menu.findMany({ where: { storeId: nichaStore.id } })
  const deksomburnMenus = await prisma.menu.findMany({ where: { storeId: deksomburnStore.id } })

  if (nichaMenus.length < 2 || deksomburnMenus.length < 1) {
    console.error('❌ Could not find menus for order seeding. Aborting.')
    return
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- ออร์เดอร์ที่ 1: จ่ายด้วย PromptPay, รอร้านตรวจสอบสลิป (AWAITING_CONFIRMATION) ---
  await prisma.order.create({
    data: {
      buyerId: buyer.id,
      storeId: nichaStore.id,
      status: OrderStatus.AWAITING_CONFIRMATION,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 45,
      position: 1,
      queueNumber: 1,
      orderDate: today,
      confirmedAt: new Date(Date.now() - 10 * 60 * 1000),
      paymentQrCode: `https://promptpay.io/${nichaStore.promptPayId}/45.00.png`,
      paymentSlip: '/uploads/sample_slip.png',
      orderItems: {
        create: {
          storeId: nichaStore.id,
          menuId: nichaMenus[1].id, // ข้าวมันไก่ต้ม (พิเศษ)
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
      storeId: deksomburnStore.id,
      status: OrderStatus.COOKING,
      paymentMethod: PaymentMethod.CASH_ON_PICKUP,
      totalAmount: 50,
      position: 2,
      queueNumber: 2,
      orderDate: today,
      confirmedAt: new Date(Date.now() - 5 * 60 * 1000),
      orderItems: {
        create: {
          storeId: deksomburnStore.id,
          menuId: deksomburnMenus[0].id, // เล็กต้มยำหมู
          quantity: 1,
          subtotal: 50,
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
      storeId: nichaStore.id,
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.PROMPTPAY,
      totalAmount: 90,
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
            { storeId: nichaStore.id, menuId: nichaMenus[0].id, quantity: 1, subtotal: 40 },
            { storeId: nichaStore.id, menuId: nichaMenus[4].id, quantity: 1, subtotal: 50 },
          ]
        }
      }
    }
  })

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