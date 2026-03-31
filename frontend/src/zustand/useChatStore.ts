import { create } from 'zustand';

interface ChatState {
    isOpen: boolean;
    targetStoreId: string | null;
    unreadCount: number;
    // เคยเปิดแชทในเซสชันนี้หรือยัง (ใช้ตัดสินใจว่าจะแสดง unread badge หรือเปล่า)
    hasSession: boolean;
    openChatWith: (storeId: string) => void;
    setIsOpen: (isOpen: boolean) => void;
    closeChat: () => void;
    incrementUnread: () => void;
    resetUnread: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    targetStoreId: null,
    unreadCount: 0,
    hasSession: false,
    openChatWith: (storeId) => set({ isOpen: true, targetStoreId: storeId, unreadCount: 0, hasSession: true }),
    setIsOpen: (isOpen) => set((state) => ({
        isOpen,
        unreadCount: isOpen ? 0 : state.unreadCount,
        hasSession: isOpen ? true : state.hasSession,
    })),
    closeChat: () => set({ isOpen: false, targetStoreId: null }),
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    resetUnread: () => set({ unreadCount: 0 }),
}));
