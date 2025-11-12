// @/zustand/useAuthStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserAuthResponse } from '@/types/response/response.auth';
import { useCartStore } from './useCartStore';

interface AuthState {
    user: UserAuthResponse | null;
    isAuthenticated: boolean;
    setUser: (user: UserAuthResponse) => void;
    clearAuth: () => void; // ไม่มี logic ล้าง cache ที่นี่แล้ว
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    _hasHydrated: boolean;
    setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            _hasHydrated: false,

            setHasHydrated: (hydrated) => {
                set({
                    _hasHydrated: hydrated,
                });
            },

            setUser: (user) => set({ user: user, isAuthenticated: true, isLoading: false }),

            clearAuth: () => {
                useCartStore.getState().setCart(null);
                set({ user: null, isAuthenticated: false, isLoading: false });
            },

            setIsLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
