// @/hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addItemToCart, updateCartItem, clearCart } from '@/services/cart.service';
import { useAuthStore } from '@/zustand/useAuthStore';
import { useEffect } from 'react';
import { useCartStore } from '@/zustand/useCartStore';

const CART_QUERY_KEY = 'cart';

// ===== HOOK สำหรับ "อ่าน" ข้อมูลตะกร้า =====
export const useCart = () => {
    const { isAuthenticated } = useAuthStore();
    const { setCart } = useCartStore();

    const query = useQuery({
        queryKey: [CART_QUERY_KEY],
        queryFn: getCart,
        enabled: isAuthenticated, // จะดึงข้อมูลตะกร้าก็ต่อเมื่อ Login แล้วเท่านั้น
        staleTime: 1000 * 60 * 5, // 5 นาที
    });

    // เมื่อ React Query ได้ข้อมูลตะกร้า ให้ sync ไปที่ Zustand
    useEffect(() => {
        if (query.data) {
            setCart(query.data);
        }
    }, [query.data, setCart]);

    return query;
};

// ===== HOOK สำหรับเพิ่มของลงตะกร้า =====
export const useAddItemToCart = () => {
    const queryClient = useQueryClient();
    const { setCart } = useCartStore();

    return useMutation({
        mutationFn: addItemToCart,
        onSuccess: (updatedCart) => {
            // อัปเดตทั้ง React Query cache และ Zustand store
            queryClient.setQueryData([CART_QUERY_KEY], updatedCart);
            setCart(updatedCart);
        },
    });
};

// ===== HOOK สำหรับอัปเดต/ลบของในตะกร้า =====
export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();
    const { setCart } = useCartStore();

    return useMutation({
        mutationFn: updateCartItem,
        onSuccess: (updatedCart) => {
            queryClient.setQueryData([CART_QUERY_KEY], updatedCart);
            setCart(updatedCart);
        },
    });
};

// ===== HOOK สำหรับล้างตะกร้า =====
export const useClearCart = () => {
    const queryClient = useQueryClient();
    const { setCart } = useCartStore();

    return useMutation({
        mutationFn: clearCart,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: [CART_QUERY_KEY] });
            setCart(null); // ✅ ใช้ null แทน object ว่าง เพื่อให้ type-safe
        },
    });
};
