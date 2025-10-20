// @/services/auth.service.ts
import { LOGIN, REGISTER, AUTH_STATUS, LOGOUT, ME } from "@/apis/endpoint.api";
import mainApi from "@/apis/main.api";
import { PayloadLogin, PayloadRegister } from "@/types/requests/request.auth";
import { APIResponseType } from "@/types/response/index";
import { UserAuthResponse } from "@/types/response/response.auth";

// ฟังก์ชัน Register ใหม่
export const postRegister = async (data: PayloadRegister) => {
    // Backend จะตอบกลับเป็นข้อมูล User ที่สร้างใหม่
    const { data: response } = await mainApi.post<APIResponseType<UserAuthResponse>>(
        REGISTER, // Endpoint: /v1/auth/register
        data
    );
    return response;
};

export const postLogin = async (data: PayloadLogin) => {
    // สำหรับ Login, data ที่ได้กลับมาจะเป็น null
    const { data: response } = await mainApi.post<APIResponseType<null>>(
        LOGIN, // Endpoint: /v1/auth/login
        data
    );
    return response;
};

export const getAuthStatus = async () => {
    const { data: response } = await mainApi.get<APIResponseType<null>>(
        AUTH_STATUS // Endpoint: /v1/auth/auth-status
    );
    return response;
};

export const getLogout = async () => {
    const { data: response } = await mainApi.get<APIResponseType<null>>(
        LOGOUT // Endpoint: /v1/auth/logout
    );
    return response;
};

// (ใหม่) ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ที่ Login อยู่
export const getMe = async () => {
    const { data: response } = await mainApi.get<APIResponseType<UserAuthResponse>>(ME);
    return response;
};