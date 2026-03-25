import { useState, useEffect, useRef } from 'react';
import { useSocket, ChatMessage } from '@/hooks/useSocket';
import { chatApi } from '@/apis/chat.api';
import { useAuthStore } from '@/zustand/useAuthStore';
import { useChatStore } from '@/zustand/useChatStore';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';

export const ChatBox = () => {
    const { user } = useAuthStore();
    const { isOpen, setIsOpen, targetStoreId, closeChat } = useChatStore();
    const { socket, isConnected, sendMessage, joinRoom } = useSocket();
    const [rooms, setRooms] = useState<any[]>([]);
    const [activeRoom, setActiveRoom] = useState<any | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (targetStoreId) {
            chatApi.startChatWithStore(targetStoreId).then(res => {
                if(res.responseObject) setActiveRoom(res.responseObject);
            });
        }
    }, [targetStoreId]);

    // Load rooms when opening the modal
    useEffect(() => {
        if (isOpen && !activeRoom) {
            chatApi.getMyChatRooms().then((res) => {
                if(res.responseObject) setRooms(res.responseObject);
            });
        }
    }, [isOpen, activeRoom]);

    // Load messages when joining a room
    useEffect(() => {
        if (activeRoom) {
            chatApi.getRoomMessages(activeRoom.id).then((res) => {
                if(res.responseObject) {
                    setMessages(res.responseObject);
                    joinRoom(activeRoom.id);
                    setTimeout(scrollToBottom, 100);
                }
            });
        }
    }, [activeRoom]);

    // Receive message socket event
    useEffect(() => {
        if (!socket) return;
        const handleReceiveMessage = (newMessage: ChatMessage) => {
            console.info("[ChatBox] Received message from socket:", newMessage);
            if (activeRoom && newMessage.roomId === activeRoom.id) {
                setMessages((prev) => [...prev, newMessage]);
                setTimeout(scrollToBottom, 100);
            }
        };
        socket.on("receive_message", handleReceiveMessage);
        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, activeRoom]);

    const handleSend = () => {
        if (!inputText.trim() || !activeRoom) return;
        console.info(`[ChatBox] Emitting send_message to room ${activeRoom.id}`);
        sendMessage(activeRoom.id, inputText);
        setInputText("");
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen && (
                <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden mb-4 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-2">
                            {activeRoom && (
                                <button onClick={() => setActiveRoom(null)} className="hover:bg-orange-600 p-1 rounded-md transition-colors">
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            <h3 className="font-semibold select-none">
                                {activeRoom 
                                    ? (user.role === 'BUYER' ? activeRoom.store?.name : activeRoom.buyer?.username) 
                                    : "ข้อความของคุณ"}
                            </h3>
                        </div>
                        <button onClick={closeChat} className="hover:bg-orange-600 p-1 rounded-md transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                        {!activeRoom ? (
                            <div className="divide-y divide-gray-100">
                                {rooms.length === 0 ? (
                                    <p className="text-center text-gray-500 mt-10 text-sm">ยังไม่มีข้อความ</p>
                                ) : (
                                    rooms.map(r => (
                                        <div 
                                            key={r.id} 
                                            onClick={() => setActiveRoom(r)}
                                            className="p-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold uppercase shadow-sm">
                                                {(user.role === 'BUYER' ? r.store?.name : r.buyer?.username)?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 text-sm truncate">
                                                    {user.role === 'BUYER' ? r.store?.name : r.buyer?.username}
                                                </p>
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
                                            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {activeRoom && (
                        <div className="bg-white border-t border-gray-200 p-2 flex gap-2 items-center">
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
                                className="bg-orange-500 text-white h-9 w-9 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-orange-600 transition-all shadow-sm"
                            >
                                <Send size={15} className="-ml-0.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-xl text-white rounded-full flex items-center justify-center transition-transform hover:scale-105"
                >
                    <MessageCircle size={26} />
                </button>
            )}
        </div>
    );
};
