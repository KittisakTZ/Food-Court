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

const logger = pino({ name: "server start" });
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());

// Routes
app.use("/v1/auth", authRouter);
app.use("/v1/stores", storeRouter);
app.use("/v1/reviews", reviewRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(errorHandler());
export { app, logger };