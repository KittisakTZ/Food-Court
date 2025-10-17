// @/types/requests/request.auth.ts

export type PayloadLogin = {
    username: string;
    password: string;
};

// เพิ่ม Type นี้เข้ามา
export type PayloadRegister = {
    username: string;
    password: string;
    email?: string;
};