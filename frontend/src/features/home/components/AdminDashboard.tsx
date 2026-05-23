import { useState } from "react";
import { useAdminStores, useAdminApproveStore, useAdminRejectStore, useAdminStoreStats } from "@/hooks/useAdmin";
import { Store } from "@/types/response/store.response";
import { FiSearch, FiChevronLeft, FiChevronRight, FiShoppingBag, FiCheckCircle, FiClock, FiXCircle, FiSliders } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
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

    const closeDialog = () => {
        setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-500 text-sm font-medium">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="bg-white p-8 rounded-2xl shadow border border-red-100 text-center">
                    <FiXCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-slate-700 font-semibold">ไม่สามารถโหลดข้อมูลร้านค้าได้</p>
                    <p className="text-slate-400 text-sm mt-1">กรุณาลองใหม่อีกครั้งภายหลัง</p>
                </div>
            </div>
        );
    }

    const isPending = isApproving || isRejecting;

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm!}
                title={dialogState.title}
                description={dialogState.description}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-8">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 flex-shrink-0">
                        <MdRestaurant className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">แดชบอร์ดผู้ดูแลระบบ</h1>
                        <p className="text-sm text-slate-400 mt-0.5">จัดการและอนุมัติการลงทะเบียนร้านค้า</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">ร้านค้าทั้งหมด</p>
                                <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                                <p className="text-xs text-slate-400 mt-1">รวมทุกสถานะ</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                <FiShoppingBag className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">อนุมัติแล้ว</p>
                                <p className="text-3xl font-black text-emerald-600">{stats.approved}</p>
                                <p className="text-xs text-slate-400 mt-1">พร้อมให้บริการ</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <FiCheckCircle className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">รออนุมัติ</p>
                                <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
                                <p className="text-xs text-slate-400 mt-1">ต้องตรวจสอบ</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-5 flex gap-2">
                    {([
                        { key: 'pending', label: 'รออนุมัติ', icon: <FiClock className="w-4 h-4" /> },
                        { key: 'approved', label: 'อนุมัติแล้ว', icon: <FiCheckCircle className="w-4 h-4" /> },
                        { key: 'all', label: 'ทั้งหมด', icon: <FiSliders className="w-4 h-4" /> },
                    ] as { key: FilterStatus; label: string; icon: React.ReactNode }[]).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                filterStatus === tab.key
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Search & Controls */}
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-80">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="ค้นหาร้านค้า..."
                                value={searchText}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>แสดง</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>รายการ</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">ข้อมูลร้านค้า</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">เจ้าของร้าน</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">สถานะ</th>
                                    <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">วันที่สร้าง</th>
                                    <th className="px-5 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wide">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center">
                                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <FiShoppingBag className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <p className="font-semibold text-slate-600 mb-1">ไม่พบร้านค้า</p>
                                            <p className="text-sm text-slate-400">
                                                {filterStatus === 'pending' && 'ไม่มีร้านค้าที่รออนุมัติ'}
                                                {filterStatus === 'approved' && 'ยังไม่มีร้านค้าที่ได้รับการอนุมัติ'}
                                                {filterStatus === 'all' && 'ลองปรับเปลี่ยนการค้นหาหรือตัวกรอง'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map((store: Store) => (
                                        <tr key={store.id} className="hover:bg-orange-50/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        store.isApproved ? 'bg-emerald-100' : 'bg-amber-100'
                                                    }`}>
                                                        <FiShoppingBag className={`w-5 h-5 ${store.isApproved ? 'text-emerald-600' : 'text-amber-600'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{store.name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{store.description || 'ไม่มีคำอธิบาย'}</p>
                                                        {store.location && (
                                                            <p className="text-xs text-orange-500 mt-0.5 font-medium">📍 {store.location}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <p className="text-sm font-semibold text-slate-700">{store.owner?.username ?? 'ไม่ระบุ'}</p>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {store.isApproved ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                        <FiCheckCircle className="w-3.5 h-3.5" />
                                                        อนุมัติแล้ว
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                        <FiClock className="w-3.5 h-3.5" />
                                                        รออนุมัติ
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(store.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center">
                                                {store.isApproved ? (
                                                    <button
                                                        onClick={() => handleReject(store.id, store.name)}
                                                        disabled={isPending}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <FiXCircle className="w-4 h-4" />
                                                        {isRejecting ? 'กำลังยกเลิก...' : 'ยกเลิก'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprove(store.id, store.name)}
                                                        disabled={isPending}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 shadow-sm shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        <FiCheckCircle className="w-4 h-4" />
                                                        {isApproving ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-sm text-slate-500">
                                แสดง{' '}
                                <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span>
                                {' '}ถึง{' '}
                                <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalCount)}</span>
                                {' '}จาก{' '}
                                <span className="font-semibold text-slate-700">{totalCount}</span> ร้านค้า
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber: number;
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
                                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                                                    currentPage === pageNumber
                                                        ? 'bg-orange-500 text-white shadow-sm'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300 hover:text-orange-600'
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
                                    className="p-2 rounded-lg border border-slate-200 bg-white hover:border-orange-300 hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-600"
                                >
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
