//server.ts
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import errorHandler from "@common/middleware/errorHandler";
import cookieParser from "cookie-parser";
import path from 'path';

import { env } from "@common/utils/envConfig";
import { pino } from "pino";
import { authRouter } from "@modules/auth/authRouter";
import { storeRouter } from "@modules/store/storeRouter";
import { reviewRouter } from "@modules/review/reviewRouter";
import { orderRouter } from "@modules/order/orderRouter";
import { cartRouter } from "@modules/cart/cartRouter";
import { analyticsRouter } from "@modules/analytics/analyticsRouter";
import { chatRouter } from "@modules/chat/chatRouter";

const logger = pino({ name: "server start" });
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// ✅ เพิ่ม CORS headers สำหรับ static files (uploads)
app.use('/uploads', (req, res, next) => {
    // อนุญาตให้ทุก origin เข้าถึงรูปภาพ (สำหรับ development)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // หรือถ้าต้องการเฉพาะ origin ของคุณ
    // res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// เสิร์ฟ static files
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')));

// Routes
app.use("/v1/auth", authRouter);
app.use("/v1/stores", storeRouter);
app.use("/v1/reviews", reviewRouter);
app.use("/v1/orders", orderRouter);
app.use("/v1/cart", cartRouter);
app.use("/v1/analytics", analyticsRouter);
app.use("/v1/chats", chatRouter);

app.use(errorHandler() as any);
export { app, logger };

// Trigger restart