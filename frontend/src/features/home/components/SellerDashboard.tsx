import { useMyStoreOrders } from "@/hooks/useOrders";
import { useMyStore } from "@/hooks/useStores";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableOrderCard } from "./DraggableOrderCard";
import { useMoveOrderPosition } from "@/hooks/useOrders";
import { MdRestaurant, MdStorefront } from "react-icons/md";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiFilter,
} from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";
import { Order } from "@/types/response/order.response";

type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "COOKING"
  | "READY_FOR_PICKUP";
type ViewMode = "kanban" | "list";

export const SellerDashboard = () => {
  const { data: myStore, isLoading: isLoadingStore, isError } = useMyStore();

  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (isError || !myStore) {
    return (
      <div className="container mx-auto text-center p-10">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-12">
          <MdStorefront className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ยินดีต้อนรับ ผู้ขาย!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            คุณยังไม่ได้สร้างร้านค้า เริ่มต้นสร้างร้านเพื่อขายอาหารกันเลย!
          </p>
          <Link
            to="/my-store/create"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-lg rounded-full hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <MdStorefront className="w-6 h-6" />
            สร้างร้านค้าของคุณ
          </Link>
        </div>
      </div>
    );
  }

  return <StoreOrderQueue storeName={myStore.name} />;
};

// Kanban Column Component
const KanbanColumn = ({
  title,
  icon,
  color,
  orders,
  onDragEnd,
  selectedStatus,
  status,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  orders: Order[];
  onDragEnd: (event: DragEndEvent) => void;
  selectedStatus: OrderStatus | "ALL";
  status: OrderStatus;
}) => {
  const orderIds = orders.map((order) => order.id);

  const colorClasses =
    {
      yellow: "from-yellow-500 to-orange-500",
      blue: "from-blue-500 to-cyan-500",
      orange: "from-orange-500 to-red-500",
      green: "from-green-500 to-emerald-500",
    }[color] || "from-gray-500 to-gray-600";

  // เงื่อนไขในการซ่อนคอลัมน์ ถ้า filter ไม่ตรง
  if (selectedStatus !== "ALL" && selectedStatus !== status) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div
        className={`bg-gradient-to-r ${colorClasses} rounded-2xl p-4 mb-4 text-white shadow-lg`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-white/80">{orders.length} รายการ</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[400px]">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">ไม่มีออเดอร์</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={orderIds}
              strategy={verticalListSortingStrategy}
            >
              {orders.map((order, index) => (
                <DraggableOrderCard
                  key={order.id}
                  order={order}
                  isFirst={index === 0}
                  isLast={index === orders.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

const StoreOrderQueue = ({ storeName }: { storeName: string }) => {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    "ALL"
  );

  // สร้าง status array สำหรับ API call
  const statusFilter =
    selectedStatus === "ALL"
      ? ["PENDING", "AWAITING_PAYMENT", "COOKING", "READY_FOR_PICKUP"]
      : [selectedStatus];

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useMyStoreOrders({
    page,
    pageSize: 20,
    status: statusFilter as OrderStatus[],
  });

  const { mutate: moveOrder } = useMoveOrderPosition();

  // แบ่งออเดอร์ตามสถานะสำหรับ Kanban view
  const categorizedOrders = useMemo(() => {
    const orders = ordersData?.data ?? [];
    return {
      pending: orders.filter((o) => o.status === "PENDING"),
      awaitingPayment: orders.filter((o) => o.status === "AWAITING_PAYMENT"),
      cooking: orders.filter((o) => o.status === "COOKING"),
      readyForPickup: orders.filter((o) => o.status === "READY_FOR_PICKUP"),
    };
  }, [ordersData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const orders = ordersData?.data ?? [];

    if (over && active.id !== over.id) {
      const oldItem = orders.find((item) => item.id === active.id);
      const newItem = orders.find((item) => item.id === over.id);

      if (oldItem && newItem) {
        moveOrder({ orderId: oldItem.id, newPosition: newItem.position });
      }
    }
  };

  // Reset page เมื่อเปลี่ยน status
  const handleStatusChange = (status: OrderStatus | "ALL") => {
    setSelectedStatus(status);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-8 border-orange-200 border-t-orange-500 mx-auto"></div>
            <FiPackage className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            กำลังโหลดออเดอร์...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border-2 border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600">ไม่สามารถโหลดออเดอร์ได้</p>
        </div>
      </div>
    );
  }

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.totalCount ?? 0;

  // ข้อมูลสถิติสำหรับแสดงในการ์ด (จาก current page)
  const statsFromCurrentPage = {
    pending: categorizedOrders.pending.length,
    awaitingPayment: categorizedOrders.awaitingPayment.length,
    cooking: categorizedOrders.cooking.length,
    readyForPickup: categorizedOrders.readyForPickup.length,
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <IoFastFoodOutline className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">คิวออเดอร์</h1>
              <p className="text-orange-100 text-lg">
                ร้าน <span className="font-semibold">{storeName}</span>
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-orange-600 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              บอร์ด
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-orange-600 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              รายการ
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer">
            <FiClock className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{statsFromCurrentPage.pending}</p>
            <p className="text-sm text-orange-100">รอดำเนินการ</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer">
            <FiDollarSign className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {statsFromCurrentPage.awaitingPayment}
            </p>
            <p className="text-sm text-orange-100">รอชำระเงิน</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer">
            <MdRestaurant className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{statsFromCurrentPage.cooking}</p>
            <p className="text-sm text-orange-100">กำลังทำ</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer">
            <FiPackage className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {statsFromCurrentPage.readyForPickup}
            </p>
            <p className="text-sm text-orange-100">พร้อมรับ</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      
      {/* =================== KANBAN VIEW =================== */}
      {viewMode === "kanban" && (
        <>
          {totalOrders > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <KanbanColumn title="รอดำเนินการ" icon={<FiClock className="w-6 h-6" />} color="yellow" orders={categorizedOrders.pending} onDragEnd={handleDragEnd} selectedStatus={selectedStatus} status="PENDING" />
              <KanbanColumn title="รอชำระเงิน" icon={<FiDollarSign className="w-6 h-6" />} color="blue" orders={categorizedOrders.awaitingPayment} onDragEnd={handleDragEnd} selectedStatus={selectedStatus} status="AWAITING_PAYMENT" />
              <KanbanColumn title="กำลังทำอาหาร" icon={<MdRestaurant className="w-6 h-6" />} color="orange" orders={categorizedOrders.cooking} onDragEnd={handleDragEnd} selectedStatus={selectedStatus} status="COOKING" />
              <KanbanColumn title="พร้อมรับ" icon={<FiPackage className="w-6 h-6" />} color="green" orders={categorizedOrders.readyForPickup} onDragEnd={handleDragEnd} selectedStatus={selectedStatus} status="READY_FOR_PICKUP" />
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
              <FiPackage className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">ไม่มีออเดอร์</h2>
              <p className="text-gray-600 max-w-md mx-auto">ยังไม่มีออเดอร์ใหม่ในขณะนี้</p>
            </div>
          )}
        </>
      )}
      
      {/* =================== LIST VIEW =================== */}
      {viewMode === "list" && (
        <>
          {/* Status Filter Dropdown (แสดงผลตลอดเวลาใน List View) */}
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <FiFilter className="w-5 h-5 text-gray-500" />
              <label className="text-sm font-semibold text-gray-700">กรองตามสถานะ:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus | "ALL")}
                className="flex-1 min-w-[150px] max-w-xs px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-gray-700 bg-white hover:border-gray-300 transition-all cursor-pointer"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="PENDING">รอดำเนินการ</option>
                <option value="AWAITING_PAYMENT">รอชำระเงิน</option>
                <option value="COOKING">กำลังทำอาหาร</option>
                <option value="READY_FOR_PICKUP">พร้อมรับ</option>
              </select>
              <span className="text-sm text-gray-500 ml-auto">
                แสดง {orders.length} รายการ
              </span>
            </div>
          </div>

          {/* Conditional Content: แสดงรายการออเดอร์ หรือ ข้อความแจ้งเตือน */}
          {orders.length > 0 ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      isFirst={index === 0}
                      isLast={index === orders.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
              <FiPackage className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {selectedStatus === "ALL" ? "ยังไม่มีออเดอร์" : "ไม่พบออเดอร์ในสถานะนี้"}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {selectedStatus === "ALL"
                  ? "เมื่อมีลูกค้าสั่งอาหาร ออเดอร์จะแสดงที่นี่"
                  : "ลองเปลี่ยนการกรองเพื่อดูสถานะอื่น"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
          >
            <FiChevronLeft className="w-5 h-5" />
            หน้าก่อน
          </button>
          <span className="text-gray-700 font-semibold">
            หน้า {ordersData.currentPage} / {ordersData.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === ordersData.totalPages}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
          >
            หน้าถัดไป
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};