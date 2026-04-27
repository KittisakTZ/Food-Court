// @modules/auth/authService.ts
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { authRepository } from '@modules/auth/authRepository';
import { UserPayload, UpdateProfilePayload, LoginPayload } from '@modules/auth/authModel';
import bcrypt from 'bcrypt';
import { jwtGenerator } from '@common/utils/jwtGenerator';
import { env } from '@common/utils/envConfig';

export const authService = {
    register: async (payload: UserPayload) => {
        try {
            const existingUser = await authRepository.findByUsername(payload.username);
            if (existingUser) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Username already exists.",
                    null,
                    StatusCodes.CONFLICT
                );
            }

            const newUser = await authRepository.createUser(payload);

            return new ServiceResponse(
                ResponseStatus.Success,
                "User registered successfully.",
                null,
                StatusCodes.CREATED
            );
        } catch (ex) {
            const errorMessage = "Error registering user: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    login: async (payload: LoginPayload, res: Response) => {
        try {
            const user = await authRepository.findByIdentifier(payload.identifier);
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed, "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง", null, StatusCodes.BAD_REQUEST
                );
            }

            const isValidPassword = await bcrypt.compare(payload.password, user.password);
            if (!isValidPassword) {
                return new ServiceResponse(
                    ResponseStatus.Failed, "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง", null, StatusCodes.BAD_REQUEST
                );
            }

            // =========================================================
            // **** แก้ไข Payload ตรงนี้ครับ ****
            // =========================================================
            const tokenPayload = {
                uuid: user.id,        // เปลี่ยนจาก uuid เป็น id เพื่อความชัดเจน
                username: user.username, // เพิ่ม username เข้าไป มีประโยชน์สำหรับการแสดงผลหรือ Logging
                role: user.role,    // field นี้มีอยู่แล้วและสำคัญมาก
            };
            // =========================================================

            const token = await jwtGenerator.generate(tokenPayload);

            res.cookie('token', token, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                maxAge: (10 * 60 * 60 * 1000) // 10 hours
            });

            return new ServiceResponse(
                ResponseStatus.Success,
                "User authenticated successfully.",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error during login: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    logout: (res: Response) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return new ServiceResponse(
                ResponseStatus.Success,
                "User logged out successfully.",
                null,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error during logout: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    authStatus: (req: Request) => {
        try {
            const token = req.cookies.token;
            if (token) {
                return new ServiceResponse(
                    ResponseStatus.Success,
                    "User is authenticated.",
                    null,
                    StatusCodes.OK
                );
            } else {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Authentication required.",
                    null,
                    StatusCodes.UNAUTHORIZED
                );
            }
        } catch (ex) {
            const errorMessage = "Error checking auth status: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // (ใหม่) Service สำหรับดึงข้อมูลผู้ใช้ที่ Login อยู่
    me: async (userId: string) => {
        try {
            const user = await authRepository.findById(userId);
            if (!user) {
                return new ServiceResponse(ResponseStatus.Failed, "User not found.", null, StatusCodes.NOT_FOUND);
            }
            return new ServiceResponse(ResponseStatus.Success, "User profile retrieved successfully.", user, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = "Error retrieving user profile: " + (ex as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },

    // (ใหม่) Service สำหรับ Update Profile
    updateProfile: async (userId: string, payload: UpdateProfilePayload) => {
        try {
            // ตรวจสอบว่า email ซ้ำกับคนอื่นหรือไม่
            if (payload.email) {
                const existingUser = await authRepository.findByEmail(payload.email);
                if (existingUser && existingUser.id !== userId) {
                    return new ServiceResponse(
                        ResponseStatus.Failed,
                        "อีเมลนี้ถูกใช้งานแล้ว",
                        null,
                        StatusCodes.CONFLICT
                    );
                }
            }

            const updatedUser = await authRepository.updateProfile(userId, payload);
            return new ServiceResponse(
                ResponseStatus.Success,
                "อัปเดตโปรไฟล์สำเร็จ",
                updatedUser,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error updating profile: " + (ex as Error).message;
            return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    },
};