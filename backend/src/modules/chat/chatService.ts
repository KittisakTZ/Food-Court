import { StatusCodes } from "http-status-codes";
import { ResponseStatus, ServiceResponse } from "@common/models/serviceResponse";
import { chatRepository } from "./chatRepository";

export const chatService = {
    // 1. ดึงห้องแชทของฉัน
    getMyChatRooms: async (userId: string) => {
        try {
            const rooms = await chatRepository.getChatRoomsByUserId(userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Fetch chat rooms successfully",
                rooms,
                StatusCodes.OK
            );
        } catch (error) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error fetching chat rooms",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // 2. ขอคุยกับร้าน/หาห้องแชท หรือสร้างใหม่
    startChatWithStore: async (buyerId: string, storeId: string) => {
        try {
            const room = await chatRepository.findOrCreateRoom(buyerId, storeId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Chat room retrieved successfully",
                room,
                StatusCodes.OK
            );
        } catch (error) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error starting chat",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    // 3. ดึงประวัติข้อความ (ตรวจสอบสิทธิ์ก่อน)
    getRoomMessages: async (roomId: string, userId: string) => {
        try {
            const isMember = await chatRepository.isRoomMember(roomId, userId);
            if (!isMember) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "You do not have access to this chat room.",
                    null,
                    StatusCodes.FORBIDDEN
                );
            }
            const messages = await chatRepository.getMessagesByRoomId(roomId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Messages fetched successfully",
                messages,
                StatusCodes.OK
            );
        } catch (error) {
            return new ServiceResponse(
                ResponseStatus.Failed,
                "Error fetching messages",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
};
