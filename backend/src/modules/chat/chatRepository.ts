import prisma from "@src/db";

export const chatRepository = {
    // ค้นหาห้องแชททั้งหมดของ User ปัจจุบัน (เป็นได้ทั้ง Buyer และคนขาย)
    getChatRoomsByUserId: async (userId: string) => {
        return prisma.chatRoom.findMany({
            where: {
                OR: [
                    { buyerId: userId },
                    { store: { ownerId: userId } }
                ]
            },
            include: {
                buyer: { select: { id: true, username: true } },
                store: { select: { id: true, name: true, image: true, ownerId: true } },
            },
            orderBy: { updatedAt: 'desc' }
        });
    },

    // ดึงห้องแชทระหว่าง Buyer และ Store (ค้นหาถ้ามี, สร้างถ้ายังไม่มี)
    findOrCreateRoom: async (buyerId: string, storeId: string) => {
        let room = await prisma.chatRoom.findUnique({
            where: { buyerId_storeId: { buyerId, storeId } }
        });

        if (!room) {
            room = await prisma.chatRoom.create({
                data: { buyerId, storeId }
            });
        }
        return room;
    },

    // ดึงข้อความทั้งหมดในห้องนั้นๆ
    getMessagesByRoomId: async (roomId: string) => {
        return prisma.chatMessage.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' }
        });
    },

    // บันทึกข้อความแชทใหม่ลงฐานข้อมูล
    createMessage: async (roomId: string, senderId: string, content: string) => {
        // อัปเดต updatedAt ของ ChatRoom ให้ล่าสุดเสมอ
        await prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() }
        });

        return prisma.chatMessage.create({
            data: { roomId, senderId, content }
        });
    }
};
