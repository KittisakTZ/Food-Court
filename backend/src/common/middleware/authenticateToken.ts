// @common/middleware/authenticateToken.ts (แก้ไข)

import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "@common/utils/envConfig";
import { Role } from "@prisma/client"; // **** 1. Import 'Role' enum เข้ามา ****

// กำหนด Type ของ Payload ให้ชัดเจน
interface CustomJwtPayload extends JwtPayload {
  uuid: string; // กลับมาใช้ uuid ตามเดิมเพื่อความสอดคล้องกับ jwtGenerator
  username: string;
  role: Role; // **** 2. เปลี่ยนจาก 'string' เป็น 'Role' ****
}

// แก้ไข Type Definition ของ Express
declare global {
  namespace Express {
    interface Request {
      token?: {
        payload: CustomJwtPayload;
      };
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication failed: No token provided' });
    return;
  }

  try {
    const decodedPayload = jwt.verify(token, env.JWT_SECRET) as CustomJwtPayload;
    req.token = { payload: decodedPayload };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: `Token is not valid: ${error.message}` });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An internal error occurred' });
    }
    return;
  }
};

export default authenticateToken;