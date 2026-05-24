import { create } from 'zustand';

interface ChatState {
    isOpen: boolean;
    targetStoreId: string | null;
    targetOrderId: string | null;
    unreadCount: number;
    // เคยเปิดแชทในเซสชันนี้หรือยัง (ใช้ตัดสินใจว่าจะแสดง unread badge หรือเปล่า)
    hasSession: boolean;
    openChatWith: (storeId: string, orderId?: string) => void;
    setIsOpen: (isOpen: boolean) => void;
    closeChat: () => void;
    incrementUnread: () => void;
    resetUnread: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    targetStoreId: null,
    targetOrderId: null,
    unreadCount: 0,
    hasSession: false,
    openChatWith: (storeId, orderId) => set({ isOpen: true, targetStoreId: storeId, targetOrderId: orderId || null, unreadCount: 0, hasSession: true }),
    setIsOpen: (isOpen) => set((state) => ({
        isOpen,
        unreadCount: isOpen ? 0 : state.unreadCount,
        hasSession: isOpen ? true : state.hasSession,
    })),
    closeChat: () => set({ isOpen: false, targetStoreId: null, targetOrderId: null }),
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    resetUnread: () => set({ unreadCount: 0 }),
}));
