// @modules/auth/authRepository.ts
import { User, Role } from "@prisma/client";
import prisma from "@src/db";
import { UserPayload, UpdateProfilePayload } from "@modules/auth/authModel";
import bcrypt from "bcrypt";

// Fields ที่ต้องการ select เวลา query
const UserSelect = {
    id: true,
    username: true,
    email: true,
    role: true,
    firstName: true,
    lastName: true,
    phone: true,
    gender: true,
    createdAt: true,
    updatedAt: true,
};

const UserSelectWithPassword = {
    ...UserSelect,
    password: true,
};

export const authRepository = {
    findByUsername: async (username: string) => {
        return prisma.user.findUnique({
            where: { username: username },
            select: UserSelectWithPassword,
        });
    },

    findByEmail: async (email: string) => {
        return prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });
    },

    findById: async (id: string) => {
        return prisma.user.findUnique({
            where: { id: id },
            select: UserSelect,
        });
    },

    updateProfile: async (id: string, payload: UpdateProfilePayload) => {
        return prisma.user.update({
            where: { id },
            data: {
                firstName: payload.firstName,
                lastName: payload.lastName,
                phone: payload.phone,
                email: payload.email,
                gender: payload.gender,
            },
            select: UserSelect,
        });
    },

    createUser: async (payload: UserPayload): Promise<Omit<User, 'password'>> => {
        const hashedPassword = await bcrypt.hash(payload.password, 10);
        
        const newUser = await prisma.user.create({
            data: {
                username: payload.username,
                password: hashedPassword,
                email: payload.email,
                role: payload.role,
            },
            select: UserSelect,
        });
        return newUser;
    },
};