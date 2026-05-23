// @/types/requests/request.auth.ts

export type PayloadLogin = {
    identifier: string;
    password: string;
};

// เพิ่ม Type นี้เข้ามา
export type PayloadRegister = {
    username: string;
    password: string;
    email?: string;
    role?: 'BUYER' | 'SELLER';
};

export type PayloadUpdateProfile = {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED' | null;
};