import { useState } from "react";
import { useAdminStores, useAdminApproveStore, useAdminRejectStore, useAdminStoreStats } from "@/hooks/useAdmin";
import { Store } from "@/types/response/store.response";
import { Search, ChevronLeft, ChevronRight, Store as StoreIcon, CheckCircle, Clock, XCircle, Filter, TrendingUp } from "lucide-react";
import { ConfirmationDialog } from "@/components/customs/ConfirmationDialog";

type FilterStatus = 'all' | 'pending' | 'approved';

export const AdminDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: (() => void) | null;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
    });

    // Debounce search
    const handleSearchChange = (value: string) => {
        setSearchText(value);
        const timer = setTimeout(() => {
            setDebouncedSearch(value);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    };

    const handleFilterChange = (status: FilterStatus) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    // ดึงข้อมูล stats แยกต่างหาก (ไม่ขึ้นกับ filter)
    const { data: statsData } = useAdminStoreStats();

    const { data, isLoading, isError } = useAdminStores(
        currentPage,
        pageSize,
        debouncedSearch || undefined,
        filterStatus
    );
    const { mutate: approveStore, isPending: isApproving } = useAdminApproveStore();
    const { mutate: rejectStore, isPending: isRejecting } = useAdminRejectStore();

    const stores = data?.data || [];
    const totalPages = data?.totalPages || 0;
    const totalCount = data?.totalCount || 0;

    // ใช้ stats จาก API แทนการคำนวณจาก stores ที่แสดง
    const stats = {
        total: statsData?.total || 0,
        approved: statsData?.approved || 0,
        pending: statsData?.pending || 0,
    };

    const handleApprove = (storeId: string, storeName: string) => {
        setDialogState({
            isOpen: true,
            title: "ยืนยันการอนุมัติ",
            description: `คุณแน่ใจหรือไม่ที่จะอนุมัติร้านค้า "${storeName}"?`,
            onConfirm: () => approveStore(storeId),
        });
    };

    const handleReject = (storeId: string, storeName: string) => {
        setDialogState({
            isOpen: true,
            title: "ยืนยันการยกเลิก",
            description: `คุณแน่ใจหรือไม่ที่จะยกเลิกการอนุมัติร้านค้า "${storeName}"? ร้านค้านี้จะไม่สามารถให้บริการลูกค้าได้`,
            onConfirm: () => rejectStore(storeId),
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-indigo-600"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-indigo-400 opacity-20"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-red-200">
                    <div className="text-red-600 text-lg font-semibold flex items-center gap-3">
                        <XCircle className="w-8 h-8" />
                        ไม่สามารถโหลดข้อมูลร้านค้าได้
                    </div>
                    <p className="text-gray-500 mt-2">กรุณาลองใหม่อีกครั้งภายหลัง</p>
                </div>
            </div>
        );
    }

    const isPending = isApproving || isRejecting;

    const closeDialog = () => {
        setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm!}
                title={dialogState.title}
                description={dialogState.description}
            />
            <div className="container mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <div className="inline-flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                แดชบอร์ดผู้ดูแลระบบ
                            </h1>
                            <p className="text-gray-600 mt-1 font-medium">จัดการและอนุมัติการลงทะเบียนร้านค้า</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border-2 border-indigo-100 hover:shadow-2xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ร้านค้าทั้งหมด</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                                    {stats.total}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">รวมทุกสถานะ</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                <StoreIcon className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-white to-green-50 p-6 rounded-2xl shadow-lg border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">อนุมัติแล้ว</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                                    {stats.approved}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">พร้อมให้บริการ</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="group bg-gradient-to-br from-white to-yellow-50 p-6 rounded-2xl shadow-lg border-2 border-yellow-100 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">รออนุมัติ</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-2">
                                    {stats.pending}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">ต้องตรวจสอบ</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                <Clock className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex justify-center md:justify-start">
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-2 inline-flex gap-2">
                        <button
                            onClick={() => handleFilterChange('pending')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                filterStatus === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            รออนุมัติ
                        </button>
                        <button
                            onClick={() => handleFilterChange('approved')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                filterStatus === 'approved'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            อนุมัติแล้ว
                        </button>
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                filterStatus === 'all'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            ทั้งหมด
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาร้านค้าตามชื่อ..."
                                    value={searchText}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-indigo-200">
                                <label className="text-sm font-semibold text-gray-700">แสดง:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border-2 border-indigo-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        ข้อมูลร้านค้า
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        เจ้าของร้าน
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        วันที่สร้าง
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        การจัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y-2 divide-gray-100">
                                {stores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                                                    <StoreIcon className="w-16 h-16 text-gray-400" />
                                                </div>
                                                <p className="text-xl font-bold text-gray-700 mb-2">ไม่พบร้านค้า</p>
                                                <p className="text-sm text-gray-500">
                                                    {filterStatus === 'pending' && 'ไม่มีร้านค้าที่รออนุมัติ'}
                                                    {filterStatus === 'approved' && 'ยังไม่มีร้านค้าที่ได้รับการอนุมัติ'}
                                                    {filterStatus === 'all' && 'ลองปรับเปลี่ยนการค้นหาหรือตัวกรอง'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map((store: Store) => (
                                        <tr key={store.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start">
                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-md ${
                                                        store.isApproved
                                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                                            : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                                    }`}>
                                                        <StoreIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 mb-1">{store.name}</div>
                                                        <div className="text-sm text-gray-600 leading-relaxed">
                                                            {store.description || 'ไม่มีคำอธิบาย'}
                                                        </div>
                                                        {store.location && (
                                                            <div className="text-xs text-indigo-600 mt-1.5 font-medium">📍 {store.location}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {store.owner?.username ?? 'ไม่ระบุ'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {store.isApproved ? (
                                                    <span className="px-4 py-2 inline-flex items-center gap-2 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-sm">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                        อนุมัติแล้ว
                                                    </span>
                                                ) : (
                                                    <span className="px-4 py-2 inline-flex items-center gap-2 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-200 shadow-sm animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        รออนุมัติ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {new Date(store.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-3">
                                                    {store.isApproved ? (
                                                        <button
                                                            onClick={() => handleReject(store.id, store.name)}
                                                            disabled={isPending}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            {isRejecting ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApprove(store.id, store.name)}
                                                            disabled={isPending}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {isApproving ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm font-semibold text-gray-700">
                                แสดง <span className="text-indigo-600">{(currentPage - 1) * pageSize + 1}</span> ถึง{' '}
                                <span className="text-indigo-600">
                                    {Math.min(currentPage * pageSize, totalCount)}
                                </span>{' '}
                                จากทั้งหมด <span className="text-indigo-600">{totalCount}</span> ร้านค้า
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2.5 rounded-xl border-2 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-sm hover:shadow-md"
                                >
                                    <ChevronLeft className="w-5 h-5 text-indigo-600" />
                                </button>
                                <div className="flex gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${
                                                    currentPage === pageNumber
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                                                        : 'bg-white hover:bg-indigo-50 text-gray-700 border-2 border-gray-200 hover:border-indigo-300'
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2.5 rounded-xl border-2 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all shadow-sm hover:shadow-md"
                                >
                                    <ChevronRight className="w-5 h-5 text-indigo-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};