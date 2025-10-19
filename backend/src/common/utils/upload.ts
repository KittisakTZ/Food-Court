// @common/utils/upload.ts

import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// กำหนด Path ของโฟลเดอร์ที่จะเก็บไฟล์
const uploadDir = path.join(__dirname, '../../uploads');

// ตรวจสอบและสร้างโฟลเดอร์ uploads ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. การตั้งค่า Storage Engine
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        // บอก multer ให้เก็บไฟล์ไว้ในโฟลเดอร์ 'uploads'
        cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // สร้างชื่อไฟล์ใหม่ที่ไม่ซ้ำกัน: fieldname-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// 2. การสร้าง File Filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // อนุญาตเฉพาะไฟล์รูปภาพ (jpeg, jpg, png)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); // true = อนุญาตให้อัปโหลดไฟล์นี้
    } else {
        // ถ้าเป็นไฟล์ชนิดอื่น, ให้ปฏิเสธและส่ง Error กลับไป
        cb(new Error('Invalid file type, only JPEG and PNG is allowed!'));
    }
};

// 3. สร้าง Middleware การอัปโหลด
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // จำกัดขนาดไฟล์ไม่เกิน 5MB
    },
    fileFilter: fileFilter
});

export default upload;