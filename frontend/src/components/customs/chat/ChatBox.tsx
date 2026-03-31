import { useState, useEffect, useRef } from 'react';
import { useSocket, ChatMessage } from '@/hooks/useSocket';
import { chatApi } from '@/apis/chat.api';
import { useAuthStore } from '@/zustand/useAuthStore';
import { useChatStore } from '@/zustand/useChatStore';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';

export const ChatBox = () => {
    const { user } = useAuthStore();
    const {
        isOpen, setIsOpen, targetStoreId, closeChat,
        unreadCount, incrementUnread, resetUnread,
        hasSession,
    } = useChatStore();

    const { socket, isConnected, sendMessage, joinRoom } = useSocket();
    const [rooms, setRooms] = useState<any[]>([]);
    const [activeRoom, setActiveRoom] = useState<any | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ใช้ ref เพื่อหลีกเลี่ยง stale closure ใน socket handler
    const isOpenRef = useRef(isOpen);
    const activeRoomRef = useRef(activeRoom);

    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // เปิดห้องแชทกับร้านค้าที่ระบุ
    useEffect(() => {
        if (targetStoreId) {
            chatApi.startChatWithStore(targetStoreId).then(res => {
                if (res.responseObject) setActiveRoom(res.responseObject);
            });
        }
    }, [targetStoreId]);

    // โหลดรายการห้องเมื่อเปิด panel และไม่มี active room
    useEffect(() => {
        if (isOpen && !activeRoom) {
            chatApi.getMyChatRooms().then(res => {
                if (res.responseObject) setRooms(res.responseObject);
            });
        }
    }, [isOpen, activeRoom]);

    // โหลดข้อความเมื่อเลือกห้อง
    useEffect(() => {
        if (activeRoom) {
            chatApi.getRoomMessages(activeRoom.id).then(res => {
                if (res.responseObject) {
                    setMessages(res.responseObject);
                    joinRoom(activeRoom.id);
                    setTimeout(scrollToBottom, 100);
                }
            });
        }
    }, [activeRoom]);

    // รับข้อความจาก socket — ใช้ ref หลีกเลี่ยง stale closure
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (newMessage: ChatMessage) => {
            const currentRoom = activeRoomRef.current;
            const currentIsOpen = isOpenRef.current;

            if (currentRoom && newMessage.roomId === currentRoom.id) {
                // ข้อความจากห้องที่กำลังดูอยู่
                setMessages(prev => [...prev, newMessage]);
                setTimeout(scrollToBottom, 100);
                // ถ้า panel ปิดอยู่ → นับ unread
                if (!currentIsOpen) incrementUnread();
            } else {
                // ข้อความจากห้องอื่น
                if (!currentIsOpen) incrementUnread();
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        return () => { socket.off('receive_message', handleReceiveMessage); };
    }, [socket]); // ไม่ใส่ isOpen/activeRoom ใน deps — ใช้ ref แทน

    // Reset unread เมื่อเปิด chat
    useEffect(() => {
        if (isOpen) resetUnread();
    }, [isOpen]);

    const handleSend = () => {
        if (!inputText.trim() || !activeRoom) return;
        sendMessage(activeRoom.id, inputText);
        setInputText('');
    };

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        closeChat();
        setActiveRoom(null);
    };

    const handleBackToList = () => {
        setActiveRoom(null);
        chatApi.getMyChatRooms().then(res => {
            if (res.responseObject) setRooms(res.responseObject);
        });
    };

    if (!user) return null;

    // Seller เห็น chat button เสมอ (ต้องรับข้อความจาก Buyer)
    // Buyer เห็นเฉพาะเมื่อเคยเปิดแชท หรือมี unread
    const isSeller = user.role === 'SELLER';
    const shouldShowUnreadBubble = !isOpen && (unreadCount > 0 && (hasSession || isSeller));
    const shouldShowChatButton = !isOpen && isSeller && unreadCount === 0;
    const shouldShowPanel = isOpen;

    if (!shouldShowPanel && !shouldShowUnreadBubble && !shouldShowChatButton) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">

            {/* Chat Panel */}
            {shouldShowPanel && (
                <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
                    style={{ height: '420px' }}>

                    {/* Header */}
                    <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center shadow-sm flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {activeRoom && (
                                <button
                                    onClick={handleBackToList}
                                    className="hover:bg-orange-600 p-1 rounded-md transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            <h3 className="font-semibold select-none text-sm">
                                {activeRoom
                                    ? (user.role === 'BUYER' ? activeRoom.store?.name : activeRoom.buyer?.username)
                                    : 'ข้อความของคุณ'}
                            </h3>
                        </div>
                        <button
                            onClick={handleClose}
                            className="hover:bg-orange-600 p-1 rounded-md transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
                        {!activeRoom ? (
                            <div className="divide-y divide-gray-100">
                                {rooms.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 gap-2">
                                        <MessageCircle size={32} className="text-gray-300" />
                                        <p className="text-gray-400 text-sm">ยังไม่มีข้อความ</p>
                                    </div>
                                ) : (
                                    rooms.map(r => (
                                        <div
                                            key={r.id}
                                            onClick={() => setActiveRoom(r)}
                                            className="p-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold uppercase text-sm flex-shrink-0">
                                                {(user.role === 'BUYER' ? r.store?.name : r.buyer?.username)?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate">
                                                    {user.role === 'BUYER' ? r.store?.name : r.buyer?.username}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">แตะเพื่อเปิดการสนทนา</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="p-3 flex flex-col gap-2">
                                {messages.map(m => {
                                    const isMe = m.senderId === user.id;
                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${isMe
                                                ? 'bg-orange-500 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                            }`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    {activeRoom && (
                        <div className="bg-white border-t border-gray-200 p-2 flex gap-2 items-center flex-shrink-0">
                            <input
                                type="text"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="พิมพ์ข้อความ..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || !isConnected}
                                className="bg-orange-500 text-white h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-orange-600 transition-all shadow-sm flex-shrink-0"
                            >
                                <Send size={15} className="-ml-0.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Unread bubble — แสดงเมื่อมี unread และ panel ปิด */}
            {shouldShowUnreadBubble && (
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm transition-all hover:scale-105 hover:shadow-xl"
                >
                    <MessageCircle size={18} />
                    <span>ข้อความ</span>
                    <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 border-2 border-white animate-bounce">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                </button>
            )}

            {/* Chat button สำหรับ Seller (ไม่มี unread) */}
            {shouldShowChatButton && (
                <button
                    onClick={handleOpen}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm transition-all hover:scale-105 hover:shadow-xl"
                >
                    <MessageCircle size={18} />
                    <span>ข้อความ</span>
                </button>
            )}
        </div>
    );
};
