import dotenv from "dotenv";
import path from "path";
import { cleanEnv, host, num, port, str, url } from "envalid"; // ✨ 1. import `url` เพิ่ม

// Load .env from the project root (one level up from backend/)
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "test", "production"] }),
  HOST: host(),
  PORT: port(),
  CORS_ORIGIN: str(),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num(),
  COMMON_RATE_LIMIT_WINDOW_MS: num(),
  JWT_SECRET: str(),
  ACCESS_EXPIRATION_MINUTES: num(),
  REFRESH_EXPIRATION_DAYS: num(),
  REDIS_URI: str(),

  // ✨ 2. เพิ่ม 2 บรรทัดนี้เข้าไป
  PAYMENT_QR_CODE_EXPIRATION_MINUTES: num({ default: 15 }),
  PROMPTPAY_API_BASE_URL: url({ default: "https://promptpay.io" }),
});