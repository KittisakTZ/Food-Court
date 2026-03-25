import mainApi from "./main.api";

export const chatApi = {
    getMyChatRooms: async () => {
        const response = await mainApi.get("/v1/chats");
        return response.data;
    },

    startChatWithStore: async (storeId: string) => {
        const response = await mainApi.post(`/v1/chats/store/${storeId}`);
        return response.data;
    },

    getRoomMessages: async (roomId: string) => {
        const response = await mainApi.get(`/v1/chats/${roomId}/messages`);
        return response.data;
    }
};
