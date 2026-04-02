import { useState, useEffect, useRef, useMemo } from 'react';
import { useSocket, ChatMessage } from '@/hooks/useSocket';
import { chatApi } from '@/apis/chat.api';
import { useAuthStore } from '@/zustand/useAuthStore';
import { useChatStore } from '@/zustand/useChatStore';
import { useMyOrders } from '@/hooks/useOrders';
import { Order } from '@/types/response/order.response';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';
import { OrderChatCard, OrderDetailView, STATUS_CFG } from './OrderChatSummary';

const ACTIVE_STATUSES: Order['status'][] = [
    'PENDING', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION', 'COOKING', 'READY_FOR_PICKUP',
];

export const ChatBox = () => {
    const { user } = useAuthStore();
    const {
        isOpen, setIsOpen, targetStoreId, closeChat,
        unreadCount, incrementUnread, resetUnread,
    } = useChatStore();

    const { socket, isConnected, sendMessage, joinRoom } = useSocket();
    const [rooms, setRooms] = useState<any[]>([]);
    const [activeRoom, setActiveRoom] = useState<any | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isOpenRef = useRef(isOpen);
    const activeRoomRef = useRef(activeRoom);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
    useEffect(() => { activeRoomRef.current = activeRoom; }, [activeRoom]);

    const isBuyer = user?.role === 'BUYER';
    const isSeller = user?.role === 'SELLER';

    // ── ดึงออเดอร์ BUYER เพื่อแสดง card และ indicator ──────────────────────
    const { data: ordersData } = useMyOrders({
        page: 1, pageSize: 50,
        refetchInterval: isOpen && isBuyer ? 30000 : undefined,
    });

    // ออเดอร์ล่าสุดของร้านที่กำลังแชทอยู่
    // เงื่อนไข: ต้องเป็นออเดอร์ของ user ปัจจุบัน + ตรงร้าน + ผ่าน PENDING แล้ว (store อนุมัติแล้ว)
    const currentStoreOrder = useMemo<Order | null>(() => {
        if (!isBuyer || !activeRoom || !ordersData?.data?.length) return null;
        const storeId: string | undefined = activeRoom.storeId ?? activeRoom.store?.id;
        if (!storeId) return null;
        return ordersData.data.find(o =>
            o.store?.id === storeId &&   // ตรงร้านที่กำลังแชท
            o.status !== 'PENDING'       // store อนุมัติแล้ว (ไม่ใช่รอดำเนินการ)
        ) ?? null;
    }, [activeRoom, ordersData, isBuyer]);

    // Map storeId → ออเดอร์ล่าสุด สำหรับ room list indicator เท่านั้น
    const orderByStoreId = useMemo(() => {
        if (!isBuyer || !ordersData?.data) return new Map<string, Order>();
        const map = new Map<string, Order>();
        for (const o of ordersData.data) {
            const sid = o.store?.id;
            if (sid && !map.has(sid)) map.set(sid, o);   // skip ถ้า store.id undefined
        }
        return map;
    }, [ordersData, isBuyer]);

    // นับ active orders สำหรับ floating badge
    const activeOrderCount = isBuyer
        ? (ordersData?.data?.filter(o => ACTIVE_STATUSES.includes(o.status)).length ?? 0)
        : 0;

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // เปิดแชทกับร้านที่ระบุ
    useEffect(() => {
        if (targetStoreId) {
            setShowOrderDetail(false);
            chatApi.startChatWithStore(targetStoreId).then(res => {
                if (res.responseObject) setActiveRoom(res.responseObject);
            });
        }
    }, [targetStoreId]);

    // โหลด room list
    useEffect(() => {
        if (isOpen && !activeRoom) {
            chatApi.getMyChatRooms().then(res => {
                if (res.responseObject) setRooms(res.responseObject);
            });
        }
    }, [isOpen, activeRoom]);

    // โหลดข้อความเมื่อเปิดห้อง
    useEffect(() => {
        if (activeRoom) {
            setShowOrderDetail(false);
            chatApi.getRoomMessages(activeRoom.id).then(res => {
                if (res.responseObject) {
                    setMessages(res.responseObject);
                    joinRoom(activeRoom.id);
                    setTimeout(scrollToBottom, 100);
                }
            });
        }
    }, [activeRoom]);

    // รับข้อความจาก socket
    useEffect(() => {
        if (!socket) return;
        const handle = (msg: ChatMessage) => {
            const room = activeRoomRef.current;
            const open = isOpenRef.current;
            if (room && msg.roomId === room.id) {
                setMessages(prev => [...prev, msg]);
                setTimeout(scrollToBottom, 100);
                if (!open) incrementUnread();
            } else {
                if (!open) incrementUnread();
            }
        };
        socket.on('receive_message', handle);
        return () => { socket.off('receive_message', handle); };
    }, [socket]);

    useEffect(() => { if (isOpen) resetUnread(); }, [isOpen]);

    const handleSend = () => {
        if (!inputText.trim() || !activeRoom) return;
        sendMessage(activeRoom.id, inputText);
        setInputText('');
    };

    const handleClose = () => { closeChat(); setActiveRoom(null); setShowOrderDetail(false); };

    const handleBack = () => {
        if (showOrderDetail) {
            setShowOrderDetail(false);                 // detail → chat
        } else if (activeRoom) {
            setActiveRoom(null);                        // chat → room list
            setShowOrderDetail(false);
            chatApi.getMyChatRooms().then(res => {
                if (res.responseObject) setRooms(res.responseObject);
            });
        }
    };

    if (!user) return null;

    const shouldShowButton = !isOpen && (isSeller || isBuyer);
    if (!isOpen && !shouldShowButton) return null;

    // ── Header ────────────────────────────────────────────────────────────────
    const showBackBtn = !!(activeRoom || showOrderDetail);
    const headerTitle = showOrderDetail
        ? 'รายละเอียดออเดอร์'
        : activeRoom
        ? (isBuyer ? activeRoom.store?.name : activeRoom.buyer?.username)
        : 'ข้อความของคุณ';

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">

            {/* ── Panel ────────────────────────────────────────────────────── */}
            {isOpen && (
                <div
                    className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
                    style={{ height: '490px' }}
                >
                    {/* Header */}
                    <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center shadow-sm flex-shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            {showBackBtn && (
                                <button onClick={handleBack} className="hover:bg-orange-600 p-1 rounded-md transition-colors flex-shrink-0">
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                            <h3 className="font-semibold select-none text-sm truncate">{headerTitle}</h3>
                        </div>
                        <button onClick={handleClose} className="hover:bg-orange-600 p-1 rounded-md transition-colors flex-shrink-0">
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── View: Order Detail ─────────────────────────────── */}
                    {showOrderDetail && currentStoreOrder && (
                        <OrderDetailView order={currentStoreOrder} />
                    )}

                    {/* ── View: Chat Room ────────────────────────────────── */}
                    {!showOrderDetail && activeRoom && (
                        <>
                            {/* Order Card — BUYER เท่านั้น */}
                            {isBuyer && currentStoreOrder && (
                                <OrderChatCard
                                    order={currentStoreOrder}
                                    onViewDetail={() => setShowOrderDetail(true)}
                                />
                            )}

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
                                <div className="p-3 flex flex-col gap-2">
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-24 gap-1">
                                            <MessageCircle size={24} className="text-slate-300" />
                                            <p className="text-xs text-slate-400">เริ่มการสนทนาได้เลย</p>
                                        </div>
                                    )}
                                    {messages.map(m => {
                                        const isMe = m.senderId === user.id;
                                        return (
                                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm
                                                    ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                                                    {m.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-1" />
                                </div>
                            </div>

                            {/* Input */}
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
                        </>
                    )}

                    {/* ── View: Room List ────────────────────────────────── */}
                    {!showOrderDetail && !activeRoom && (
                        <div className="flex-1 overflow-y-auto bg-slate-50 min-h-0">
                            {rooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-2">
                                    <MessageCircle size={32} className="text-gray-300" />
                                    <p className="text-gray-400 text-sm">ยังไม่มีข้อความ</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {rooms.map(r => {
                                        const rStoreId = r.store?.id ?? r.storeId;
                                        const roomOrder = isBuyer && rStoreId ? orderByStoreId.get(rStoreId) : undefined;
                                        const activeOrder = roomOrder && ACTIVE_STATUSES.includes(roomOrder.status) ? roomOrder : undefined;
                                        const dotCfg = activeOrder ? STATUS_CFG[activeOrder.status] : undefined;

                                        return (
                                            <div
                                                key={r.id}
                                                onClick={() => setActiveRoom(r)}
                                                className={`p-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 transition-colors
                                                    ${activeOrder?.status === 'READY_FOR_PICKUP' ? 'bg-emerald-50/40' :
                                                      activeOrder?.hasIssue ? 'bg-red-50/40' : ''}`}
                                            >
                                                {/* Store image / Avatar */}
                                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                                                    {r.store?.image ? (
                                                        <img src={r.store.image} alt={r.store?.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                                                            <span className="text-orange-600 font-black text-base uppercase">
                                                                {(isBuyer ? r.store?.name : r.buyer?.username)?.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Active dot */}
                                                    {activeOrder && (
                                                        <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${dotCfg?.dot ?? 'bg-orange-500'} animate-pulse`} />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">
                                                        {isBuyer ? r.store?.name : r.buyer?.username}
                                                    </p>
                                                    {activeOrder && dotCfg ? (
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCfg.dot} animate-pulse`} />
                                                            <p className={`text-xs font-semibold truncate ${dotCfg.color}`}>
                                                                {dotCfg.text}{activeOrder.queueNumber ? ` • Q${activeOrder.queueNumber}` : ''}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 mt-0.5">แตะเพื่อเปิดการสนทนา</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Floating Button ────────────────────────────────────────── */}
            {shouldShowButton && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm transition-all hover:scale-105 hover:shadow-xl"
                >
                    <MessageCircle size={18} />
                    <span>ข้อความ</span>
                    {unreadCount > 0 ? (
                        <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 border-2 border-white animate-bounce">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    ) : isBuyer && activeOrderCount > 0 ? (
                        <span className="min-w-[20px] h-5 bg-orange-200 text-orange-800 text-xs font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                            {activeOrderCount}
                        </span>
                    ) : null}
                </button>
            )}
        </div>
    );
};
