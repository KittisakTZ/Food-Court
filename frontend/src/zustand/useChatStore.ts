import { create } from 'zustand';

interface ChatState {
    isOpen: boolean;
    targetStoreId: string | null;
    openChatWith: (storeId: string) => void;
    setIsOpen: (isOpen: boolean) => void;
    closeChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    targetStoreId: null,
    openChatWith: (storeId) => set({ isOpen: true, targetStoreId: storeId }),
    setIsOpen: (isOpen) => set({ isOpen }),
    closeChat: () => set({ isOpen: false, targetStoreId: null }),
}));
