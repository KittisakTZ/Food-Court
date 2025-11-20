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
    image: 'http://localhost:5080/uploads/stores/วัฟเฟิ่ล.jpg',
    categories: [
      {
        name: 'วาฟเฟิลไส้หวาน',
        menus: [
          { name: 'ผลไม้รวม', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ผลไม้รวม.png' },
          { name: 'เผือก', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/เผือก.png' },
          { name: 'ครีม', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ครีม.png' },
          { name: 'เนย น้ำตาล', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/เนยน้ำตาล.png' },
          { name: 'ลูกเกด', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ลูกเกด.png' },
          { name: 'สังขยา', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/สังขยา.png' },
          { name: 'ช็อกโกแลต', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ช็อกโกแลต.png' },
          { name: 'ฝอยทอง', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ฝอยทอง.png' },
          { name: 'ชีส', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ชีส.png' },
          { name: 'อัลมอนด์', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/อัลมอนด์.png' },
          { name: 'ข้าวโพด', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/ข้าวโพด.png' },
          { name: 'สตรอว์เบอร์รี่', price: 10, image: 'http://localhost:5080/uploads/menus/วัฟเฟิล/สตรอว์เบอร์รี่.png' }
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
    image: 'http://localhost:5080/uploads/stores/ลูกชิ้นระเบิด.jpg',
    categories: [
      {
        name: 'ลูกชิ้นทอด',
        menus: [
          { name: 'ลูกชิ้นปลา (S)', price: 35, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นปลาระเบิด.png' },
          { name: 'ลูกชิ้นปลา (M)', price: 45, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นปลาระเบิด.png' },
          { name: 'ลูกชิ้นปลา (L)', price: 55, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นปลาระเบิด.png' },
          { name: 'ลูกชิ้นปลา (XL)', price: 65, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นปลาระเบิด.png' },
          { name: 'ลูกชิ้นกุ้ง (S)', price: 35, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นกุ้งระเบิด.png' },
          { name: 'ลูกชิ้นกุ้ง (M)', price: 45, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นกุ้งระเบิด.png' },
          { name: 'ลูกชิ้นไก่ (S)', price: 35, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นไก่คอกเทล.png' },
          { name: 'ลูกชิ้นไก่ (M)', price: 45, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ลูกชิ้นไก่คอกเทล.png' },
        ],
      },
      {
        name: 'น้ำจิ้ม (สั่งเพิ่ม)',
        menus: [
          { name: 'น้ำจิ้มต้นตำรับ (ถ้วย)', price: 5, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/ซอสมะขาม.jpg' },
          { name: 'น้ำจิ้มซี้ดซ้าด (ถ้วย)', price: 5, image: 'http://localhost:5080/uploads/menus/ลูกชิ้นระเบิด/น้ำจิ้มสุดแซ่บ.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ร้านน้ำมอ.jpg',
    categories: [
      {
        name: 'น้ำชง',
        menus: [
          { name: 'นมเย็น', price: 25, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/นมเย็น.jpg' },
          { name: 'โกโก้เย็น', price: 25, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/โกโก้เย็น.jpg' },
          { name: 'ชามะนาว', price: 25, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/ชามะนาว.jpg' },
          { name: 'ชานมเย็น', price: 25, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/ชานมเย็น.jpg' },
          { name: 'ชาเขียวนม', price: 25, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/ชาเขียวนม.png' },
          { name: 'โอเลี้ยง', price: 20, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/โอเลี้ยง.jpg' },
          { name: 'กาแฟโบราณ', price: 20, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/กาแฟโบราณ.jpg' },
          { name: 'น้ำแดงมะนาวโซดา', price: 30, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/น้ำแดงมะนาวโซดา.jpg' },
          { name: 'น้ำผึ้งมะนาว', price: 30, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/น้ำผึ้งมะนาว.jpg' },
          { name: 'นมสดคาราเมล', price: 30, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/นมสดคาราเมล.jpg' },
        ]
      },
      {
        name: 'น้ำอัดลม',
        menus: [
          { name: 'โค้ก (แก้ว)', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/โค้ก (แก้ว).jpg' },
          { name: 'เป๊ปซี่ (แก้ว)', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/เป๊ปซี่ (แก้ว).jpg' },
          { name: 'แฟนต้า น้ำแดง (แก้ว)', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/แฟนต้า น้ำแดง (แก้ว).jpg' },
          { name: 'แฟนต้า น้ำส้ม (แก้ว)', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/แฟนต้า น้ำส้ม (แก้ว).jpg' },
          { name: 'สไปรท์ (แก้ว)', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/สไปรท์ (แก้ว).jpg' },
        ]
      },
      {
        name: 'นม',
        menus: [
          { name: 'นมจืด', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/นมวัวรสจืด.jpg' },
          { name: 'นมช็อกโกแลต', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/นมช็อกโกแลต.jpg' },
          { name: 'นมเปรี้ยว', price: 15, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/นมเปรี้ยว.jpg' },
        ]
      },
      {
        name: 'น้ำเปล่า',
        menus: [
          { name: 'น้ำเปล่า (ขวด)', price: 10, image: 'http://localhost:5080/uploads/menus/ร้านน้ำ/น้ำเปล่า (ขวด).jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ข้าวมันไก่.jpg',
    categories: [
      {
        name: 'ข้าวมันไก่',
        menus: [
          { name: 'ข้าวมันไก่ต้ม (ธรรมดา)', price: 40, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ต้ม.jpg' },
          { name: 'ข้าวมันไก่ต้ม (พิเศษ)', price: 45, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ต้ม.jpg' },
          { name: 'ข้าวมันไก่ทอด (ธรรมดา)', price: 40, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ทอด.jpg' },
          { name: 'ข้าวมันไก่ทอด (พิเศษ)', price: 45, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ทอด.jpg' },
          { name: 'ข้าวมันไก่ผสม (ต้ม+ทอด)', price: 50, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ผสม.jpg' },
          { name: 'ข้าวมันไก่ต้ม (ไม่หนัง)', price: 40, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันไก่ต้ม ไม่หนัง.jpg' },
          { name: 'ไก่ต้ม (กับ)', price: 60, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ไก่ต้ม (กับ).jpg' },
          { name: 'ไก่ทอด (กับ)', price: 60, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ไก่ทอด (กับ).jpg' },
          { name: 'ข้าวมันเปล่า', price: 10, image: 'http://localhost:5080/uploads/menus/ณิชา ข้าวมันไก่/ข้าวมันเปล่า.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ครัวปักใต้.jpg',
    categories: [
      {
        name: 'แกง',
        menus: [
          { name: 'แกงไตปลา', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/แกงไตปลา.jpg' },
          { name: 'แกงส้มปลา', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/แกงส้มปลา.jpg' },
          { name: 'แกงเหลืองหน่อไม้ดอง', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/แกงเหลืองหน่อไม้ดอง.jpg' },
          { name: 'พะแนงหมู', price: 65, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/พะแนงหมู.jpg' },
          { name: 'เขียวหวานไก่', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/เขียวหวานไก่.jpg' },
        ]
      },
      {
        name: 'ผัด',
        menus: [
          { name: 'คั่วกลิ้งหมูสับ', price: 65, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/คั่วกลิ้งหมูสับ.jpg' },
          { name: 'หมูผัดกะปิ', price: 65, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/หมูผัดกะปิ.jpg' },
          { name: 'ใบเหลียงผัดไข่', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ใบเหลียงผัดไข่.webp' },
          { name: 'ผัดสะตอกะปิกุ้ง', price: 80, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ผัดสะตอกะปิกุ้ง.jpg' },
          { name: 'ไก่ผัดขมิ้น', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ไก่ผัดขมิ้น.jpg' },
        ]
      },
      {
        name: 'ของทอด',
        menus: [
          { name: 'หมูทอด', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/หมูทอด.jpg' },
          { name: 'ไก่ทอดหาดใหญ่', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ไก่ทอดหาดใหญ่.jpg' },
          { name: 'ปลาทอดขมิ้น', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ปลาทอดขมิ้น.jpg' },
          { name: 'ไข่เจียว', price: 40, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ไข่เจียว.jpg' },
        ]
      },
      {
        name: 'เครื่องเคียงและอื่นๆ',
        menus: [
          { name: 'ไข่พะโล้', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ไข่พะโล้.jpg' },
          { name: 'น้ำพริกกะปิ + ผักสด', price: 45, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/น้ำพริกกะปิ.jpg' },
          { name: 'ขนมจีนน้ำยาปักษ์ใต้', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ขนมจีนน้ำยาปักษ์ใต้.jpg' },
          { name: 'ข้าวสวย', price: 10, image: 'http://localhost:5080/uploads/menus/ครัวปักษ์ใต้/ข้าวสวย.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/เด็กสมบูณร์.jpg',
    categories: [
      {
        name: 'ก๋วยเตี๋ยวต้มยำ',
        menus: [
          { name: 'เล็กต้มยำหมู', price: 50, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/เล็กต้มยำหมู.jpg' },
          { name: 'ใหญ่ต้มยำหมู', price: 50, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/ใหญ่ต้มยำหมู.jpg' },
          { name: 'หมี่ต้มยำหมู', price: 50, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/หมี่ต้มยำหมู.jpg' },
          { name: 'วุ้นเส้นต้มยำรวมมิตร', price: 60, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/วุ้นเส้นต้มยำรวมมิตร.jpg' },
        ]
      },
      {
        name: 'ก๋วยเตี๋ยวน้ำใส',
        menus: [
          { name: 'เล็กน้ำใสลูกชิ้นปลา', price: 45, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/เล็กน้ำใสลูกชิ้นปลา.jpg' },
          { name: 'ใหญ่น้ำใสหมู', price: 45, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/ใหญ่น้ำใสหมู.jpg' },
          { name: 'หมี่น้ำใสไก่', price: 45, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/หมี่น้ำใสไก่.jpg' },
        ]
      },
      {
        name: 'ก๋วยเตี๋ยวแห้ง',
        menus: [
          { name: 'บะหมี่แห้งหมูแดง', price: 50, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/บะหมี่แห้งหมูแดง.jpg' },
          { name: 'เล็กแห้งต้มยำ', price: 50, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/เล็กแห้งต้มยำ.jpg' },
        ]
      },
      {
        name: 'เย็นตาโฟ',
        menus: [
          { name: 'เย็นตาโฟ', price: 55, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/เย็นตาโฟ.jpg' },
          { name: 'เย็นตาโฟต้มยำ', price: 60, image: 'http://localhost:5080/uploads/menus/เด็กสมบูรณ์/เย็นตาโฟต้มยำ.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ครัวพระราม.jpg',
    categories: [
      {
        name: 'เมนูผัด',
        menus: [
          { name: 'กะเพราหมูสับ', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/กะเพราหมูสับ.jpg' },
          { name: 'คะน้าหมูกรอบ', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/คะน้าหมูกรอบ.jpg' },
          { name: 'ผัดพริกแกงไก่', price: 55, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ผัดพริกแกงไก่.jpeg' },
          { name: 'หมูทอดกระเทียม', price: 55, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/หมูทอดกระเทียม.jpg' },
          { name: 'ผัดผักรวมมิตร', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ผัดผักรวมมิตร.jpg' },
        ]
      },
      {
        name: 'เมนูต้ม',
        menus: [
          { name: 'ต้มยำกุ้ง', price: 80, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ต้มยำกุ้ง.jpg' },
          { name: 'ต้มข่าไก่', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ต้มข่าไก่.jpeg' },
          { name: 'แกงจืดเต้าหู้หมูสับ', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/แกงจืดเต้าหู้หมูสับ.jpg' },
        ]
      },
      {
        name: 'เมนูเส้น',
        menus: [
          { name: 'มาม่าผัดขี้เมาทะเล', price: 65, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/มาม่าผัดขี้เมาทะเล.jpg' },
          { name: 'สุกี้แห้ง', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/สุกี้แห้ง.jpg' },
          { name: 'ราดหน้าหมูหมัก', price: 55, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ราดหน้าหมูหมัก.jpg' },
        ]
      },
      {
        name: 'เมนูไข่',
        menus: [
          { name: 'ข้าวไข่เจียวหมูสับ', price: 45, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ข้าวไข่เจียวหมูสับ.jpg' },
          { name: 'ไข่ดาว', price: 10, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ไข่ดาว.jpg' },
        ]
      },
      {
        name: 'เมนูข้าวผัด',
        menus: [
          { name: 'ข้าวผัดหมู', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ข้าวผัดหมู.jpg' },
          { name: 'ข้าวผัดกุ้ง', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ข้าวผัดกุ้ง.jpg' },
          { name: 'ข้าวผัดอเมริกัน', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวพระราม/ข้าวผัดอเมริกัน.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ครัวอินเตอร์.jpg',
    categories: [
      {
        name: 'สปาเก็ตตี้',
        menus: [
          { name: 'สปาเก็ตตี้คาโบนาร่า', price: 89, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/สปาเก็ตตี้คาโบนาร่า.jpg' },
          { name: 'สปาเก็ตตี้ซอสหมู', price: 79, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/สปาเก็ตตี้ซอสหมู.jpg' },
          { name: 'สปาเก็ตตี้ขี้เมาทะเล', price: 99, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/สปาเก็ตตี้ขี้เมาทะเล.jpg' },
        ]
      },
      {
        name: 'สเต็ก',
        menus: [
          { name: 'สเต็กหมูพริกไทยดำ', price: 129, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/สเต็กหมูพริกไทยดำ.jpg' },
          { name: 'สเต็กไก่สไปซี่', price: 119, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/สเต็กไก่สไปซี่.jpg' },
          { name: 'ฟิชแอนด์ชิปส์', price: 109, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/ฟิชแอนด์ชิปส์.jpg' },
        ]
      },
      {
        name: 'ของทานเล่น',
        menus: [
          { name: 'ผักโขมอบชีส', price: 79, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/ผักโขมอบชีส.jpg' },
          { name: 'เฟรนช์ฟรายส์', price: 49, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/เฟรนช์ฟรายส์.jpg' },
          { name: 'นักเก็ตไก่', price: 59, image: 'http://localhost:5080/uploads/menus/ครัวอินเตอร์/นักเก็ตไก่.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ครัวช่อพุช.jpg',
    categories: [
      {
        name: 'ต้มเล้ง',
        menus: [
          { name: 'เล้งแซ่บ (ชาม)', price: 80, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/เล้งแซ่บ (ชาม).jpg' },
          { name: 'เล้งแซ่บ (หม้อไฟ)', price: 150, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/เล้งแซ่บ (หม้อไฟ).jpg' },
        ]
      },
      {
        name: 'ข้าวต้ม/โจ๊ก',
        menus: [
          { name: 'ข้าวต้มปลา', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/ข้าวต้มปลา.jpg' },
          { name: 'โจ๊กหมูใส่ไข่', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/โจ๊กหมูใส่ไข่.jpg' },
          { name: 'โจ๊กเปล่า', price: 20, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/โจ๊กเปล่า.jpg' },
        ]
      },
      {
        name: 'ต้มเลือดหมู',
        menus: [
          { name: 'ต้มเลือดหมู', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/ต้มเลือดหมู.jpg' },
          { name: 'เกาเหลาเลือดหมู', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/เกาเหลาเลือดหมู.jpg' },
        ]
      },
      {
        name: 'เกี๊ยว',
        menus: [
          { name: 'เกี๊ยวน้ำหมู', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/เกี๊ยวน้ำหมู.jpg' },
          { name: 'เกี๊ยวกุ้ง', price: 60, image: 'http://localhost:5080/uploads/menus/ครัวช่อพุช/เกี๊ยวกุ้ง.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ครัวฮาซัน.jpg',
    categories: [
      {
        name: 'ข้าวหมก',
        menus: [
          { name: 'ข้าวหมกไก่ต้ม', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/ข้าวหมกไก่ต้ม.jpg' },
          { name: 'ข้าวหมกไก่ทอด', price: 55, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/ข้าวหมกไก่ทอด.jpg' },
          { name: 'ข้าวหมกเนื้อ', price: 70, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/ข้าวหมกเนื้อ.jpg' },
          { name: 'พิเศษไก่', price: 65, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/พิเศษไก่.jpg' },
          { name: 'พิเศษเนื้อ', price: 80, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/พิเศษเนื้อ.jpg' },
        ]
      },
      {
        name: 'เมนูพิเศษ',
        menus: [
          { name: 'ซุปเนื้อ', price: 80, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/ซุปเนื้อ.jpg' },
          { name: 'กะเพราเนื้อราดข้าว', price: 75, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/กะเพราเนื้อราดข้าว.jpg' },
          { name: 'สลัดแขก', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวฮาซัน/สลัดแขก.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/กาแฟมอ.jpg',
    categories: [
      {
        name: 'กาแฟ',
        menus: [
          { name: 'เอสเพรสโซ่ (ร้อน)', price: 40, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/เอสเพรสโซ่ (ร้อน).jpg' },
          { name: 'อเมริกาโน่ (เย็น)', price: 50, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/อเมริกาโน่ (เย็น).jpg' },
          { name: 'ลาเต้ (เย็น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ลาเต้ (เย็น).jpg' },
          { name: 'คาปูชิโน่ (เย็น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/คาปูชิโน่ (เย็น).jpg' },
          { name: 'มอคค่า (เย็น)', price: 60, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/มอคค่า (เย็น).jpg' },
          { name: 'อเมริกาโน่ (ปั่น)', price: 60, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/อเมริกาโน่ (ปั่น).jpg' },
          { name: 'ลาเต้ (ปั่น)', price: 65, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ลาเต้ (ปั่น).jpg' },
        ]
      },
      {
        name: 'ชา',
        menus: [
          { name: 'ชาไทย (เย็น)', price: 45, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ชาไทย (เย็น).jpg' },
          { name: 'ชาเขียวมัทฉะ (เย็น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ชาเขียวมัทฉะ (เย็น).jpg' },
          { name: 'ชาพีช (เย็น)', price: 50, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ชาพีช (เย็น).jpg' },
          { name: 'ชาไทย (ปั่น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ชาไทย (ปั่น).jpg' },
          { name: 'ชาเขียวมัทฉะ (ปั่น)', price: 65, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/ชาเขียวมัทฉะ (ปั่น).jpg' },
        ]
      },
      {
        name: 'อื่นๆ',
        menus: [
          { name: 'โกโก้ (เย็น/ปั่น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/โกโก้ (เย็น/ปั่น).jpg' },
          { name: 'นมสดคาราเมล (เย็น/ปั่น)', price: 55, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/นมสดคาราเมล (เย็น/ปั่น).jpg' },
          { name: 'อิตาเลี่ยนโซดา', price: 45, image: 'http://localhost:5080/uploads/menus/กาแฟมอ/อิตาเลี่ยนโซดา.jpg' },
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
    image: 'http://localhost:5080/uploads/stores/ไข่เจียวทรงเครื่อง.jpg',
    categories: [
      {
        name: 'ไข่เจียวราดข้าว',
        menus: [
          { name: 'ไข่เจียวเปล่า (2ฟอง)', price: 35, image: 'http://localhost:5080/uploads/menus/ไข่เจียวทรงเครื่อง/ไข่เจียวเปล่า (2ฟอง).jpg' },
          { name: 'ไข่เจียวหมูสับ', price: 40, image: 'http://localhost:5080/uploads/menus/ไข่เจียวทรงเครื่อง/ไข่เจียวหมูสับ.jpg' },
          { name: 'ไข่เจียวแหนม', price: 40, image: 'http://localhost:5080/uploads/menus/ไข่เจียวทรงเครื่อง/ไข่เจียวแหนม.jpg' },
          { name: 'ไข่เจียวปูอัด', price: 40, image: 'http://localhost:5080/uploads/menus/ไข่เจียวทรงเครื่อง/ไข่เจียวปูอัด.jpg' },
        ]
      }
    ]
  },
  // 13. ครัวคุณทีป (KRUAW KHUNTEEP)'
  {
    storeName: 'ครัวคุณทีป (KRUAW KHUNTEEP)',
    username: 'seller_khunteep',
    email: 'seller_khunteep@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ข้าวขาหมู ข้าวหมูแดง ข้าวหมูกรอบ',
    categories: [
        {
            name: 'ข้าวขาหมู',
            menus: [
                { name: 'ข้าวขาหมูเปล่า', price: 45  , image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวขาหมูเปล่า.jpg'},
                { name: 'ข้าวขาหมูเปล่า (เพิ่มไข่)', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวขาหมูเปล่า (เพิ่มไข่).jpg'},
            ]
        },
        {
            name: 'ข้าวหมูแดง',
            menus: [
                { name: 'ข้าวหมูแดงเปล่า', price: 45 , image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวหมูแดงเปล่า.jpg'},
                { name: 'ข้าวหมูแดง(เพิ่มไข่)', price: 50, image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวหมูแดง(เพิ่มไข่).jpg'},
            ]
        },
        {
            name: 'ข้าวหมูกรอบ',
            menus: [
                { name: 'ข้าวหมูกรอบเปล่า', price: 45, image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวหมูกรอบเปล่า.jpg'},
                { name: 'ข้าวหมูกรอบ(เพิ่มไข่)', price: 50 , image: 'http://localhost:5080/uploads/menus/ครัวคุณทีป/ข้าวหมูกรอบ(เพิ่มไข่).jpg'},
            ]
        },
    ]
  },
   
  // 14. ครัวคุณทีป (KRUAW KHUNTEEP)'
  {
    storeName: 'ครัวรสเด็ด (KRUA ROSDED)',
    username: 'seller_khuarosded',
    email: 'seller_khuarosdep@foodcourt.com',
    promptPayId: '0639271202',
    description: 'กับข้าว อาหารรสเด็ด',
    categories: [
        {
            name: 'กับข้าว',
            menus: [
                { name: 'กะเพราไข่ดาว', price: 40 , image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/กะเพราไข่ดาว.jpg'},
                { name: 'กะเพราหมู', price: 45 , image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/กะเพราหมู.jpg'},
                { name: 'กะเพราไก่', price: 40 , image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/กะเพราไก่.jpg'},
                { name: 'ปลาสามรส', price: 40 , image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/ปลาสามรส.jpg'},
                { name: 'แกงเขียวหวาน', price: 45, image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/แกงเขียวหวาน.jpg'},
                { name: 'กระหล่ำปลีผัดน้ำปลา', price: 25, image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/กระหล่ำปลีผัดน้ำปลา.jpg'},
                { name: 'ห่อหมกปลากราย', price: 20, image: 'http://localhost:5080/uploads/menus/ครัวรสเด็ด/ห่อหมกปลากราย.jpg'},
            ]
        },
        
    ]
  },
  // 15. ก๋วยเตี๋ยวเรือนไทย (KUAI TIAO REUAN THAI)
  {
    storeName: 'ก๋วยเตี๋ยวเรือนไทย (KUAI TIAO REUAN THAI)',
    username: 'seller_kuaitiaoreuanthai',
    email: 'seller_kuaitiaoreuanthaip@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ก๋วยเตี๋ยวไก่ เรือนไทย',
    categories: [
        {
            name: 'ก๋วยเตี๋ยวไก่',
            menus: [
                { name: 'เส็นเล็ก', price: 45 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส็นเล็ก.jpg'},
                { name: 'เส็นเล็ก(พิเศษ)', price: 50 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส็นเล็ก(พิเศษ).jpg'},
                { name: 'เส็นใหญ่', price: 45 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส็นใหญ่.jpg'},
                { name: 'เส็นใหญ่(พิเศษ)', price: 50 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส็นใหญ่(พิเศษ).jpg'},
                { name: 'เส้นมาม่า', price: 45 ,  image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส้นมาม่า.jpg'},
                { name: 'เส้นมาม่า(พิเศษ)', price: 50, image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/เส้นมาม่า(พิเศษ).jpg'},
                { name: 'บะหมี่เหลือง', price: 45 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/บะหมี่เหลือง.jpg'},
                { name: 'บะหมี่เหลือง(พิเศษ)', price: 50, image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/บะหมี่เหลือง(พิเศษ).jpg'},
                { name: 'หมี่ขาว', price: 45 , image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/หมี่ขาว.jpg'},
                { name: 'หมี่ขาว(พิเศษ)', price: 50, image: 'http://localhost:5080/uploads/menus/ก๋วยเตี๋ยวเรือนไทย/หมี่ขาว(พิเศษ).jpg'},
            ]
        },
        
    ]
  },
  // 16. อาหารตามสั่ง (AHAN TAM SANG)
  {
    storeName: 'อาหารตามสั่ง (AHAN TAM SANG)',
    username: 'seller_ahantamsang',
    email: 'seller_ahantamsang@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารตามสั่ง',
    categories: [
        {
            name: 'เมนูผัด',
            menus: [
                { name: 'ผัดกะเพรา', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดกะเพรา.jpg'},
                { name: 'ผัดกะเพรา(พิเศษ)', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดกะเพรา(พิเศษ).jpg'},
                { name: 'ผัดคะน้าหมูกรอบ', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดคะน้าหมูกรอบ.jpg'},
                { name: 'ผัดผักรวม', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดผักรวม.jpg'},
                { name: 'ผัดพริกแกง', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดพริกแกง.jpg'},
                { name: 'ผัดหน่อไม้', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดหน่อไม้.jpg'},
                { name: 'ผัดมาม่า', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดมาม่า.jpg'},
                { name: 'ผัดซีอิ้ว', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดซีอิ้ว.jpg'},
                { name: 'ผัดพริกเผา', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดพริกเผา.jpg'},
                { name: 'ผัดผงกระหรี่', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดผงกระหรี่.jpg'},
                { name: 'ผัดผักบุ้งไฟแดง', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ผัดผักบุ้งไฟแดง.jpg'},
            ]
        },
         {
            name: 'ไข่เจียว',
            menus: [
                { name: 'ไข่เจียวหมู', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ไข่เจียวหมู.jpg'},
                { name: 'ไข่เจียวไก่', price: 40 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ไข่เจียวไก่.jpg'},
                { name: 'ไข่เจียวกุ้ง', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ไข่เจียวกุ้ง.jpg'},
                { name: 'ไข่เจียวหมึก', price: 45, image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ไข่เจียวหมึก.jpg'},
            ]
        },
         {
            name: 'ข้าวผัด',
            menus: [
                { name: 'ข้าวผัดแหนม', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวผัดแหนม.jpg'},
                { name: 'ข้าวผัดไก่', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวผัดไก่.jpg'},
                { name: 'ข้าวผัดหมู', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวผัดหมู.jpg'},
                { name: 'ข้าวผัดกุ้ง', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวผัดกุ้ง.jpg'},
            ]
        },
         {
            name: 'เมนูต้ม',
            menus: [
                { name: 'ข้าวต้มหมู', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวต้มหมู.jpg'},
                { name: 'ข้าวต้มไก่', price: 40 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ข้าวต้มไก่.jpg'},
                { name: 'สุกี้น้ำหมู', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/สุกี้น้ำหมู.jpg'},
                { name: 'สุกี้น้ำหมู (แห้ง)', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/สุกี้น้ำหมู (แห้ง).jpg'},
                { name: 'สุกี้น้ำทะเล', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/สุกี้น้ำทะเล.jpg'},
                { name: 'สุกี้น้ำทะเล (แห้ง)', price: 45 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/สุกี้น้ำทะเล (แห้ง).jpg'},
                { name: 'ต้มยำน้ำข้น', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ต้มยำน้ำข้น.jpg'},
                { name: 'ต้มยำน้ำใส', price: 50 , image: 'http://localhost:5080/uploads/menus/อาหารตามสั่ง/ต้มยำน้ำใส.jpg'},
            ]
        },
    ]
  },
  // 17. ขนมจีน น้ำยาปู (Knom Chine Nam Yap Poo)
  {
    storeName: 'ขนมจีน น้ำยาปู (Knom Chine Nam Yap Poo)',
    username: 'seller_knomchine',
    email: 'seller_knomchine@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อาหารตามสั่ง',
    categories: [
        {
            name: 'น้ำยาขนมจีน',
            menus: [
                { name: 'น้ำยาปู', price: 50 ,image : 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาปู.jpg'},
                { name: 'น้ำยากะทิ', price: 40 ,image : 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยากะทิ.jpg'},
                { name: 'น้ำยาพริกหวาน', price: 40 ,image : 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาพริกหวาน.jpg'},
                { name: 'น้ำเงี้ยว', price: 4 ,image : 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำเงี้ยว.jpg'},
                { name: 'น้ำยาแกงไตปลา', price: 40, image: 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาแกงไตปลา.jpg'},
                { name: 'น้ำยาป่า', price: 40, image: 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาป่า.jpg'},
                { name: 'น้ำยาแกงเขียวหวานไก่', price: 40, image: 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาแกงเขียวหวานไก่.jpg'},
                { name: 'น้ำยาแกงเขียวหวานเนื้อ', price: 50, image: 'http://localhost:5080/uploads/menus/ขนมจีน/น้ำยาแกงเขียวหวานเนื้อ.jpg'},
            ]
        },
         {
            name: 'เมนูอื่นๆ',
            menus: [
                { name: 'ข้าวซอยไก่', price: 45 , image: 'http://localhost:5080/uploads/menus/ขนมจีน/ข้าวซอยไก่.jpg'},
                { name: 'ข้าวคลุกกะปิ', price: 50, image: 'http://localhost:5080/uploads/menus/ขนมจีน/ข้าวคลุกกะปิ.jpg'},
                { name: 'ข้าวคลุกน้ำพริก(กล่อง)', price: 40, image: 'http://localhost:5080/uploads/menus/ขนมจีน/ข้าวคลุกน้ำพริก(กล่อง).jpg'},
            ]
        },
    ]
  },
  // 18. ลูกชิ้น เรือ 3 รำ (LOOK CHIEN REU SAM RAM
  {
    storeName: 'ลูกชิ้น เรือ 3 รำ (LOOK CHIEN REU SAM RAM)',
    username: 'seller_lukchien',
    email: 'seller_lukchien@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อร่อยมาก ต้องลอง!',
    categories: [
        {
            name: 'ลูกชิ้น',
            menus: [
                { name: 'ไก่', price: 10, image: 'http://localhost:5080/uploads/menus/ลูกชิ้น/ไก่.jpg'},
                { name: 'ปลา', price: 10, image: 'http://localhost:5080/uploads/menus/ลูกชิ้น/ปลา.jpg'},
                { name: 'เนื้อ', price: 10 , image: 'http://localhost:5080/uploads/menus/ลูกชิ้น/เนื้อ.jpg'},
                { name: 'หมู', price: 10 , image: 'http://localhost:5080/uploads/menus/ลูกชิ้น/หมู.jpg'},
                { name: 'ไส้กรอก', price: 10, image: 'http://localhost:5080/uploads/menus/ลูกชิ้น/ไส้กรอก.jpg'},
            ]
        },
    ]
  },
  // 19. ชานเสน ฟรายแอนด์ดริ้งส์ (CHANSEN FRIES AND DRINKS)
  {
    storeName: 'ชานเสน ฟรายแอนด์ดริ้งส์ (CHANSEN FRIES AND DRINKS)',
    username: 'seller_chansen',
    email: 'seller_chansene@foodcourt.com',
    promptPayId: '0639271202',
    description: 'สแน็คและเครื่องดื่ม',
    categories: [
        {
            name: 'สแน็ค',
            menus: [
                { name: 'เฟรนฟราย', price: 30 , image: 'http://localhost:5080/uploads/menus/ชานเสน/เฟรนฟราย.jpg'},
                { name: 'นัคเกต', price: 20 , image: 'http://localhost:5080/uploads/menus/ชานเสน/นัคเกต.jpg'},
            ]
        },
    ]
  },
   // 20. DEUM DAM
  {
    storeName: 'DEUM DAM & HERB AND HEALTHY',
    username: 'seller_deumdam',
    email: 'seller_deumdam@foodcourt.com',
    promptPayId: '0639271202',
    description: 'อร่อยมาก ต้องลอง!',
    categories: [
        {
            name: 'เครื่องดื่ม',
            menus: [
                { name: 'น้ำอัญชันมะนาว', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำอัญชันมะนาว.jpg'},
                { name: 'น้ำผึ้งมะนาว', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำผึ้งมะนาว.jpg'},
                { name: 'น้ำตาลสด', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำตาลสด.jpg'},
                { name: 'น้ำมะตูม', price: 25, image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำมะตูม.jpg'},
                { name: 'น้ำส้ม', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำส้ม.jpg'},
                { name: 'น้ำเลมอน', price: 25, image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำเลมอน.jpg'},
                { name: 'อเมริกาโน', price: 35, image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/อเมริกาโน.jpg'},
                { name: 'ชามะลิ', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/ชามะลิ.jpg'},
                { name: 'น้ำพั้นซ์', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำพั้นซ์.jpg'},
                { name: 'น้ำใบเตย', price: 25 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/เครื่องดื่ม/น้ำใบเตย.jpg'},
            ]
        },
        {
            name: 'ท็อปปิ้ง',
            menus: [
                { name: 'ไข่มุก', price: 10 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/ท็อปปิ้ง/ไข่มุก.jpg'},
                { name: 'วุ้น', price: 10 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/ท็อปปิ้ง/วุ้น.jpg'},
                { name: 'น้ำผึ้ง', price: 10 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/ท็อปปิ้ง/น้ำผึ้ง.jpg'},
                { name: 'ลอดช่อง', price: 10 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/ท็อปปิ้ง/ลอดช่อง.jpg'},
                { name: 'ลูกตาล', price: 10 , image: 'http://localhost:5080/uploads/menus/DEUM DAM/ท็อปปิ้ง/ลูกตาล.jpg'},
            ]
        },
    ]
  },
   // 21. ชาบูเสียบไม้ (SHABU SEIAB MAI)
  {
    storeName: 'ชาบูเสียบไม้ (SHABU SEIAB MAI)',
    username: 'seller_shabu',
    email: 'seller_shabu@foodcourt.com',
    promptPayId: '0639271202',
    description: 'น้ำจิ้มรสเด็ด เริ่มต้นไม้ละ 10 บาท',
    categories: [
        {
            name: 'ชาบูเสียบไม้',
            menus: [
                { name: 'หมู', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/หมู.jpg'},
                { name: 'กุ้ง', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/กุ้ง.jpg'},
                { name: 'ปลาดอรี่', price: 10 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ปลาดอรี่.jpg'},
                { name: 'สันคอหมูสไลซ์', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/สันคอหมูสไลซ์.jpg'},
                { name: 'หมูสามชั้นสไลซ์', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/หมูสามชั้นสไลซ์.jpg'},
                { name: 'ปลาหมึก', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ปลาหมึก.jpg'},
                { name: 'เนื้อ', price: 20 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/เนื้อ.jpg'},
                { name: 'ลูกชิ้นลาวา', price: 10 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ลูกชิ้นลาวา.jpg'},
                { name: 'ปูอัด', price: 10 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ปูอัด.jpg'},
                { name: 'ไส้กรอก', price: 10 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ไส้กรอก.jpg'},
            ]
        },
        {
            name: 'ผักและเห็ด',
            menus: [
                { name: 'เห็ดเข็มทอง', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/เห็ดเข็มทอง.jpg'},
                { name: 'ข้าวโพดอ่อน', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ข้าวโพดอ่อน.jpg'},
                { name: 'ฟักทอง', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ฟักทอง.jpg'},
                { name: 'แครอท', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/แครอท.jpg'},
                { name: 'ผักกาดขาว', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ผักกาดขาว.jpg'},
                { name: 'ผักบุ้ง', price: 25 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ผักบุ้ง.jpg'},
                { name: 'เห็ดออรินจิ', price: 35 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/เห็ดออรินจิ.jpg'},
            ]
        },
        {
            name: 'น้ำซุป',
            menus: [
                { name: 'น้ำดำ', price: 0 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/น้ำดำ.jpg'},
                { name: 'ปกติ', price: 0 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ปกติ.jpg'},
                { name: 'หม่าล่า', price: 10 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/หม่าล่า.jpg'},
            ]
        },
        {
            name: 'น้ำจิ้ม',
            menus: [
                { name: 'ซีฟู้ด', price: 0 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/ซีฟู้ด.jpg'},
                { name: 'น้ำจิ้มหม่าล่า ', price: 0 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/น้ำจิ้มหม่าล่า.jpg'},
                { name: 'น้ำจิ้มสุกี้', price: 0 , image: 'http://localhost:5080/uploads/menus/ชาบูเสียบไม้/น้ำจิ้มสุกี้.jpg'},
            ]
        },
    ]
  },
   // 22. ผล ละ ไม้ (Phol La Mai)
  {
    storeName: 'ผล ละ ไม้ (Phol La Mai)',
    username: 'seller_phollamai',
    email: 'seller_phollamai@foodcourt.com',
    promptPayId: '0639271202',
    description: 'สดใหม่จากธรรมชาติ',
    categories: [
        {
            name: 'ผลไม้',
            menus: [
                { name: 'สตอเบอร์รี่', price: 30, image: 'http://localhost:5080/uploads/menus/ผลไม้/สตอเบอร์รี่.jpg'},
                { name: 'มะม่วง', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/มะม่วง.jpg'},
                { name: 'อาโวคาโด', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/อาโวคาโด.jpg'},
                { name: 'กีวี', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/กีวี.jpg'},
                { name: 'ส้มโอ', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/ส้มโอ.jpg'},
                { name: 'ส้ม', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/ส้ม.jpg'},
                { name: 'ฝรั่งแช่บ๊วย', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/ฝรั่งแช่บ๊วย.jpg'},
                { name: 'แตงโม', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/แตงโม.jpg'},
                { name: 'มะละกอ', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/มะละกอ.jpg'},
                { name: 'สับปะรด', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/สับปะรด.jpg'},
                { name: 'ฝรั่ง', price: 30 , image: 'http://localhost:5080/uploads/menus/ผลไม้/ฝรั่ง.jpg'},
            ]
        },
        {
            name: 'เมนูยำ',
            menus: [
                { name: 'ยำมะม่วงปลากรอบ (ไม่ใส่ปลาร้า)', price: 40 , image: 'http://localhost:5080/uploads/menus/เมนูยำ/ยำมะม่วงปลากรอบ (ไม่ใส่ปลาร้า).jpg'},
                { name: 'ยำมะม่วงปลากรอบ(ปลาร้า)', price: 40 , image: 'http://localhost:5080/uploads/menus/เมนูยำ/ยำมะม่วงปลากรอบ(ปลาร้า).jpg'},
                { name: 'ยำผลไม้รวม', price: 40 , image: 'http://localhost:5080/uploads/menus/เมนูยำ/ยำผลไม้รวม.jpg'},
            ]
        },
    ]
  },
    //23. ซูซิ ปั้นคำ (Pun Khum Sushi)
  {
    storeName: 'ซูซิ ปั้นคำ (Pun Khum Sushi)',
    username: 'seller_punkhumsushi',
    email: 'seller_punkhumsushi@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ปั้นคำ ปั้นใหม่ทุกคำ',
    categories: [
        {
            name: 'ซูซิ',
            menus: [
                { name: 'แซลมอน', price: 15, image: 'http://localhost:5080/uploads/menus/ซูซิ/แซลมอน.jpg'},
                { name: 'ไข่กุ้ง', price: 15 , image: 'http://localhost:5080/uploads/menus/ซูซิ/ไข่กุ้ง.jpg'},
                { name: 'กุ้งหวาน', price: 15 , image: 'http://localhost:5080/uploads/menus/ซูซิ/กุ้งหวาน.jpg'},
                { name: 'ไข่ปลาแซลมอน', price: 15 , image: 'http://localhost:5080/uploads/menus/ซูซิ/ไข่ปลาแซลมอน.jpg'},
                { name: 'ปลาหมึก', price: 20 , image: 'http://localhost:5080/uploads/menus/ซูซิ/ปลาหมึก.jpg'},
                { name: 'ไข่หวาน', price: 10 , image: 'http://localhost:5080/uploads/menus/ซูซิ/ไข่หวาน.jpg'},
                { name: 'ปูอัด', price: 10, image: 'http://localhost:5080/uploads/menus/ซูซิ/ปูอัด.jpg'},
                { name: 'ทูน่า', price: 20, image: 'http://localhost:5080/uploads/menus/ซูซิ/ทูน่า.jpg'},
                { name: 'สาหร่าย', price: 15, image: 'http://localhost:5080/uploads/menus/ซูซิ/สาหร่าย.jpg'},
                { name: 'ปลาไหล', price: 20, image: 'http://localhost:5080/uploads/menus/ซูซิ/ปลาไหล.jpg'},
                { name: 'หอยลาย', price: 15, image: 'http://localhost:5080/uploads/menus/ซูซิ/หอยลาย.jpg'},
            ]
        },
    ]
  },
   //24. ไอ สโนว์ (I Snow)
  {
    storeName: 'ไอ สโนว์ (I Snow)',
    username: 'seller_isnow',
    email: 'seller_isnow@foodcourt.com',
    promptPayId: '0639271202',
    description: 'ไอ สโนว์ ไอศกรีม',
    categories: [
        {
            name: 'ไอศกรีม',
            menus: [
                { name: 'ซ็อกโกแลต', price: 10, image: 'http://localhost:5080/uploads/menus/ไอศกรีม/ซ็อกโกแลต.jpg'},
                { name: 'วานิลา', price: 10 , image: 'http://localhost:5080/uploads/menus/ไอศกรีม/วานิลา.jpg'},
                { name: 'มะนาว', price: 10 , image: 'http://localhost:5080/uploads/menus/ไอศกรีม/มะนาว.jpg'},
                { name: 'กระทิ', price: 10, image: 'http://localhost:5080/uploads/menus/ไอศกรีม/กระทิ.jpg'},
                { name: 'มะม่วง', price: 10, image: 'http://localhost:5080/uploads/menus/ไอศกรีม/มะม่วง.jpg'},
                { name: 'สตรอว์เบอร์รี่', price: 10 , image: 'http://localhost:5080/uploads/menus/ไอศกรีม/สตรอว์เบอร์รี่.jpg'},
                { name: 'ชาไทย', price: 10, image: 'http://localhost:5080/uploads/menus/ไอศกรีม/ชาไทย.jpg'},
            ]
        },
         {
            name: 'ของหวาน',
            menus: [
                { name: 'เฉาก๊วยนมสด', price: 30, image: 'http://localhost:5080/uploads/menus/ของหวาน/เฉาก๊วยนมสด.jpg'},
                { name: 'ลอดช่อง', price: 30, image: 'http://localhost:5080/uploads/menus/ของหวาน/ลอดช่อง.jpg'},
                { name: 'ลูกเดือยเปียกทรงเครื่อง', price: 30, image: 'http://localhost:5080/uploads/menus/ของหวาน/ลูกเดือยเปียกทรงเครื่อง.jpg'},
            ]
        },
    ]
  },
  //25. โนบิชา (Nobicha)'
  {
    storeName: 'โนบิชา (Nobicha)',
    username: 'seller_nobicha',
    email: 'seller_nobicha@foodcourt.com',
    promptPayId: '0639271202',
    description: 'โนบิชา ชา',
    categories: [
        {
            name: 'โซดา',
            menus: [
                { name: 'น้ำแดงโซดา', price: 19, image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/น้ำแดงโซดา.jpg'},
                { name: 'มะนาวโซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/มะนาวโซดา.jpg'},
                { name: 'เมล่อนโซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/เมล่อนโซดา.jpg'},
                { name: 'แอปเปิ้ลโซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/แอปเปิ้ลโซดา.jpg'},
                { name: 'น้าแดงมะนาวโซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/น้าแดงมะนาวโซดา.jpg'},
                { name: 'สตรอว์เบอร์รี่โซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/สตรอว์เบอร์รี่โซดา.jpg'},
                { name: 'ลิ้นจี่โซดา', price: 19 , image: 'http://localhost:5080/uploads/menus/โนบิชา/โซดา/ลิ้นจี่โซดา.jpg'},
            ]
        },
        {
            name: 'พรี่เมี่ยม',
            menus: [
                { name: 'มัทฉะลาเต้', price: 55, image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/มัทฉะลาเต้.jpg'},
                { name: 'นมสดน้ําผึ้ง', price: 39 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/นมสดน้ําผึ้ง.jpg'},
                { name: 'นมสดคาราเมล', price: 39 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/นมสดคาราเมล.jpg'},
                { name: 'นมสดโกโก้', price: 39 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/นมสดโกโก้.jpg'},
                { name: 'ชาเขียวน้ำผึ้ง', price: 34 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/ชาเขียวน้ำผึ้ง.jpg'},
                { name: 'ชาเขียวมะลิ', price: 39 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/ชาเขียวมะลิ.jpg'},
                { name: 'นมสดไข่มุกบราวน์ชูการ์', price: 34 , image: 'http://localhost:5080/uploads/menus/โนบิชา/พรี่เมี่ยม/นมสดไข่มุกบราวน์ชูการ์.jpg'},
            ]
        },
        {
            name: 'เมนูอื่นๆ',
            menus: [
                { name: 'นมชมพู', price: 24, image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/นมชมพู.jpg'},
                { name: 'โอวัลติน', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/โอวัลติน.jpg'},
                { name: 'โกโก้', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/โกโก้.jpg'},
                { name: 'เนสกาแฟ', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/เนสกาแฟ.jpg'},
                { name: 'มอคค่า', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/มอคค่า.jpg'},
                { name: 'ลาเต้', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/ลาเต้.jpg'},
                { name: 'น้ำผึ้งมะนาว', price: 24 , image: 'http://localhost:5080/uploads/menus/โนบิชา/เมนูอื่นๆ/น้ำผึ้งมะนาว.jpg'},
            ]
        },
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
        image: storeData.image || 'http://localhost:5080/uploads/stores/default_store.png',
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
        name: menu.name,
        price: menu.price,
        image: menu.image || 'http://localhost:5080/uploads/menus/default_menu.png',
        storeId: store.id,
        categoryId: category.id,
      }))

      if (menusToCreate.length > 0) {
        await prisma.menu.createMany({
          data: menusToCreate,
          skipDuplicates: true,
        })
        console.log(`      └─ 🍔 Created ${menusToCreate.length} menus for this category.`)
      }
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
      paymentSlip: 'http://localhost:5080/uploads/sample_slip.png',
      orderItems: {
        create: {
          storeId: nichaStore.id,
          menuId: nichaMenus[1].id,
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
          menuId: deksomburnMenus[0].id,
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