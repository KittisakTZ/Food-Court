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
  FiSearch,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";
import { Order } from "@/types/response/order.response";

type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "COOKING"
  | "READY_FOR_PICKUP";
type ViewMode = "kanban" | "list";

// Status Configuration
const STATUS_CONFIG = {
  PENDING: {
    label: "รอดำเนินการ",
    icon: <FiClock className="w-4 h-4" />,
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-300",
  },
  AWAITING_PAYMENT: {
    label: "รอชำระเงิน",
    icon: <FiDollarSign className="w-4 h-4" />,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-300",
  },
  COOKING: {
    label: "กำลังทำอาหาร",
    icon: <MdRestaurant className="w-4 h-4" />,
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-300",
  },
  READY_FOR_PICKUP: {
    label: "พร้อมรับ",
    icon: <FiPackage className="w-4 h-4" />,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-300",
  },
};

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

  if (selectedStatus !== "ALL" && selectedStatus !== status) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
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
              {/* ✨ FIX: แก้ไขตรงนี้ ✨ */}
              {orders.map((order, index) => (
                <DraggableOrderCard
                  key={order.id}
                  order={order}
                  // ✨ เพิ่ม prop ที่ขาดไป ✨
                  queueDisplayNumber={index + 1}
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
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const statusFilter =
    selectedStatus === "ALL"
      ? ["PENDING", "AWAITING_PAYMENT", "COOKING", "READY_FOR_PICKUP"]
      : [selectedStatus];

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useMyStoreOrders({
    page,
    pageSize,
    status: statusFilter as OrderStatus[],
  });

  const { mutate: moveOrder } = useMoveOrderPosition();

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    const orders = ordersData?.data ?? [];
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.buyer.username?.toLowerCase().includes(query)
    );
  }, [ordersData, searchQuery]);

  // Categorize filtered orders
  const categorizedOrders = useMemo(() => {
    return {
      pending: filteredOrders.filter((o) => o.status === "PENDING"),
      awaitingPayment: filteredOrders.filter((o) => o.status === "AWAITING_PAYMENT"),
      cooking: filteredOrders.filter((o) => o.status === "COOKING"),
      readyForPickup: filteredOrders.filter((o) => o.status === "READY_FOR_PICKUP"),
    };
  }, [filteredOrders]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldItem = filteredOrders.find((item) => item.id === active.id);
      const newItem = filteredOrders.find((item) => item.id === over.id);

      if (oldItem && newItem) {
        moveOrder({ orderId: oldItem.id, newPosition: newItem.position });
      }
    }
  };

  const handleStatusChange = (status: OrderStatus | "ALL") => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const clearSearch = () => {
    setSearchQuery("");
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
          <p className="text-gray-600 mb-6">ไม่สามารถโหลดออเดอร์ได้</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg font-semibold"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const totalOrders = ordersData?.totalCount ?? 0;
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

          {/* View Mode Toggle & Refresh */}
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all disabled:opacity-50"
              title="รีเฟรช"
            >
              <FiRefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === "kanban"
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
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === "list"
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleStatusChange("PENDING")}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
          >
            <FiClock className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{statsFromCurrentPage.pending}</p>
            <p className="text-sm text-orange-100">รอดำเนินการ</p>
          </button>
          <button
            onClick={() => handleStatusChange("AWAITING_PAYMENT")}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
          >
            <FiDollarSign className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {statsFromCurrentPage.awaitingPayment}
            </p>
            <p className="text-sm text-orange-100">รอชำระเงิน</p>
          </button>
          <button
            onClick={() => handleStatusChange("COOKING")}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
          >
            <MdRestaurant className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">{statsFromCurrentPage.cooking}</p>
            <p className="text-sm text-orange-100">กำลังทำ</p>
          </button>
          <button
            onClick={() => handleStatusChange("READY_FOR_PICKUP")}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/30 transition-all cursor-pointer"
          >
            <FiPackage className="w-6 h-6 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {statsFromCurrentPage.readyForPickup}
            </p>
            <p className="text-sm text-orange-100">พร้อมรับ</p>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขออเดอร์หรือชื่อลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-medium text-gray-700 bg-white hover:border-gray-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-all"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4 relative">
            <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) =>
                handleStatusChange(e.target.value as OrderStatus | "ALL")
              }
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-gray-700 bg-white hover:border-gray-300 transition-all cursor-pointer appearance-none"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="PENDING">รอดำเนินการ</option>
              <option value="AWAITING_PAYMENT">รอชำระเงิน</option>
              <option value="COOKING">กำลังทำอาหาร</option>
              <option value="READY_FOR_PICKUP">พร้อมรับ</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="md:col-span-3 relative">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-gray-700 bg-white hover:border-gray-300 transition-all cursor-pointer appearance-none"
            >
              <option value={10}>10 รายการ/หน้า</option>
              <option value={20}>20 รายการ/หน้า</option>
              <option value={50}>50 รายการ/หน้า</option>
              <option value={100}>100 รายการ/หน้า</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {selectedStatus !== "ALL" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-semibold">
              {STATUS_CONFIG[selectedStatus].label}
              <button
                onClick={() => handleStatusChange("ALL")}
                className="hover:bg-orange-200 rounded-full p-0.5 transition-all"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
              ค้นหา: "{searchQuery}"
              <button
                onClick={clearSearch}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-all"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            แสดง {filteredOrders.length} รายการจากทั้งหมด {totalOrders} รายการ
          </span>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "kanban" && (
        <>
          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <KanbanColumn
                title="รอดำเนินการ"
                icon={<FiClock className="w-6 h-6" />}
                color="yellow"
                orders={categorizedOrders.pending}
                onDragEnd={handleDragEnd}
                selectedStatus={selectedStatus}
                status="PENDING"
              />
              <KanbanColumn
                title="รอชำระเงิน"
                icon={<FiDollarSign className="w-6 h-6" />}
                color="blue"
                orders={categorizedOrders.awaitingPayment}
                onDragEnd={handleDragEnd}
                selectedStatus={selectedStatus}
                status="AWAITING_PAYMENT"
              />
              <KanbanColumn
                title="กำลังทำอาหาร"
                icon={<MdRestaurant className="w-6 h-6" />}
                color="orange"
                orders={categorizedOrders.cooking}
                onDragEnd={handleDragEnd}
                selectedStatus={selectedStatus}
                status="COOKING"
              />
              <KanbanColumn
                title="พร้อมรับ"
                icon={<FiPackage className="w-6 h-6" />}
                color="green"
                orders={categorizedOrders.readyForPickup}
                onDragEnd={handleDragEnd}
                selectedStatus={selectedStatus}
                status="READY_FOR_PICKUP"
              />
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
              <FiPackage className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {searchQuery ? "ไม่พบออเดอร์ที่ค้นหา" : "ไม่มีออเดอร์"}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? "ลองค้นหาด้วยคำอื่นหรือเคลียร์ตัวกรอง"
                  : "ยังไม่มีออเดอร์ใหม่ในขณะนี้"}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg font-semibold"
                >
                  เคลียร์การค้นหา
                </button>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === "list" && (
        <>
          {filteredOrders.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredOrders.map((o) => o.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      // ✨ FIX: ส่ง index เข้าไปเป็น prop ใหม่ชื่อ queueDisplayNumber ✨
                      queueDisplayNumber={index + 1}
                      isFirst={index === 0}
                      isLast={index === filteredOrders.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-200">
              <FiPackage className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                {searchQuery
                  ? "ไม่พบออเดอร์ที่ค้นหา"
                  : selectedStatus === "ALL"
                    ? "ยังไม่มีออเดอร์"
                    : "ไม่พบออเดอร์ในสถานะนี้"}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchQuery
                  ? "ลองค้นหาด้วยคำอื่นหรือเคลียร์ตัวกรอง"
                  : selectedStatus === "ALL"
                    ? "เมื่อมีลูกค้าสั่งอาหาร ออเดอร์จะแสดงที่นี่"
                    : "ลองเปลี่ยนการกรองเพื่อดูสถานะอื่น"}
              </p>
              {(searchQuery || selectedStatus !== "ALL") && (
                <button
                  onClick={() => {
                    clearSearch();
                    handleStatusChange("ALL");
                  }}
                  className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg font-semibold"
                >
                  เคลียร์ตัวกรอง
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-lg p-6">
            {/* Page Info */}
            <div className="text-sm text-gray-600 font-medium">
              แสดงหน้า <span className="font-bold text-gray-900">{ordersData.currentPage}</span> จาก{" "}
              <span className="font-bold text-gray-900">{ordersData.totalPages}</span> หน้า
              <span className="text-gray-400 ml-2">
                (ทั้งหมด {totalOrders} รายการ)
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all font-semibold text-sm"
                title="หน้าแรก"
              >
                ««
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all font-semibold"
              >
                <FiChevronLeft className="w-4 h-4" />
                ก่อนหน้า
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const totalPages = ordersData.totalPages;
                  const currentPage = ordersData.currentPage;

                  // Always show first page
                  if (currentPage > 3) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => setPage(1)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all font-semibold min-w-[40px]"
                      >
                        1
                      </button>
                    );
                    if (currentPage > 4) {
                      pages.push(
                        <span key="dots1" className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                  }

                  // Show pages around current page
                  for (
                    let i = Math.max(1, currentPage - 2);
                    i <= Math.min(totalPages, currentPage + 2);
                    i++
                  ) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-2 border-2 rounded-lg transition-all font-semibold min-w-[40px] ${i === currentPage
                          ? "border-orange-500 bg-orange-500 text-white shadow-md"
                          : "border-gray-200 hover:border-orange-400 hover:bg-orange-50"
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Always show last page
                  if (currentPage < totalPages - 2) {
                    if (currentPage < totalPages - 3) {
                      pages.push(
                        <span key="dots2" className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setPage(totalPages)}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all font-semibold min-w-[40px]"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-700">
                {page} / {ordersData.totalPages}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === ordersData.totalPages}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all font-semibold"
              >
                ถัดไป
                <FiChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(ordersData.totalPages)}
                disabled={page === ordersData.totalPages}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transition-all font-semibold text-sm"
                title="หน้าสุดท้าย"
              >
                »»
              </button>
            </div>
          </div>

          {/* Quick Jump */}
          {ordersData.totalPages > 5 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
                ไปที่หน้า:
              </label>
              <input
                type="number"
                min={1}
                max={ordersData.totalPages}
                value={page}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= ordersData.totalPages) {
                    setPage(value);
                  }
                }}
                className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 font-semibold text-center"
              />
              <span className="text-sm text-gray-500">
                / {ordersData.totalPages}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 bg-white rounded-xl shadow-xl px-6 py-3 flex items-center gap-3 z-50 border-2 border-orange-200">
          <FiRefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
          <span className="font-semibold text-gray-700">กำลังอัพเดท...</span>
        </div>
      )}
    </div>
  );
};