// @/zustand/useAuthStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserAuthResponse } from '@/types/response/response.auth';

// 1. กำหนด Type ของ State และ Actions
interface AuthState {
    user: UserAuthResponse | null;
    isAuthenticated: boolean;
    setUser: (user: UserAuthResponse) => void;
    clearAuth: () => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

// 2. สร้าง Store ด้วย persist middleware เพื่อบันทึก state ลง localStorage
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true, // เริ่มต้นให้เป็น true เพื่อจัดการตอนโหลดหน้าครั้งแรก

            setUser: (user) => set({ user: user, isAuthenticated: true, isLoading: false }),

            clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),

            setIsLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage', // ชื่อ key ใน localStorage
            storage: createJSONStorage(() => localStorage), // (optional) ใช้ localStorage
        }
    )
);