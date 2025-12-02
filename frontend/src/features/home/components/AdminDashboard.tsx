import { useState } from "react";
import { useAdminStores, useAdminApproveStore, useAdminRejectStore, useAdminStoreStats } from "@/hooks/useAdmin";
import { Store } from "@/types/response/store.response";
import { Search, ChevronLeft, ChevronRight, Store as StoreIcon, CheckCircle, Clock, XCircle, Filter } from "lucide-react";
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
            title: "Confirm Approval",
            description: `Are you sure you want to approve the store "${storeName}"?`,
            onConfirm: () => approveStore(storeId),
        });
    };

    const handleReject = (storeId: string, storeName: string) => {
        setDialogState({
            isOpen: true,
            title: "Confirm Rejection",
            description: `Are you sure you want to revoke approval for "${storeName}"? This will make the store unavailable to customers.`,
            onConfirm: () => rejectStore(storeId),
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-600 text-lg">Failed to load stores.</div>
            </div>
        );
    }

    const isPending = isApproving || isRejecting;

    const closeDialog = () => {
        setDialogState({ isOpen: false, title: '', description: '', onConfirm: null });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <ConfirmationDialog
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                onConfirm={dialogState.onConfirm!}
                title={dialogState.title}
                description={dialogState.description}
            />
            <div className="container mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage and approve store registrations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                            </div>
                            <StoreIcon className="w-12 h-12 text-indigo-500 opacity-80" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-500 opacity-80" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-500 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 inline-flex gap-2">
                        <button
                            onClick={() => handleFilterChange('pending')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                filterStatus === 'pending'
                                    ? 'bg-yellow-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            Pending Approval
                        </button>
                        <button
                            onClick={() => handleFilterChange('approved')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                filterStatus === 'approved'
                                    ? 'bg-green-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approved
                        </button>
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                filterStatus === 'all'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            All Stores
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search stores by name..."
                                    value={searchText}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Show:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Store Information
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Owner
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stores.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <StoreIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No stores found</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {filterStatus === 'pending' && 'No stores are waiting for approval'}
                                                {filterStatus === 'approved' && 'No approved stores yet'}
                                                {filterStatus === 'all' && 'Try adjusting your search or filters'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map((store: Store) => (
                                        <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-start">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                                        store.isApproved ? 'bg-green-100' : 'bg-yellow-100'
                                                    }`}>
                                                        <StoreIcon className={`w-5 h-5 ${
                                                            store.isApproved ? 'text-green-600' : 'text-yellow-600'
                                                        }`} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{store.name}</div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {store.description || 'No description provided'}
                                                        </div>
                                                        {store.location && (
                                                            <div className="text-xs text-gray-400 mt-1">📍 {store.location}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {store.owner?.username ?? 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {store.isApproved ? (
                                                    <span className="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Approved
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(store.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center gap-2">
                                                    {store.isApproved ? (
                                                        <button
                                                            onClick={() => handleReject(store.id, store.name)}
                                                            disabled={isPending}
                                                            className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            {isRejecting ? 'Revoking...' : 'Revoke'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApprove(store.id, store.name)}
                                                            disabled={isPending}
                                                            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {isApproving ? 'Approving...' : 'Approve'}
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
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * pageSize, totalCount)}
                                </span>{' '}
                                of <span className="font-medium">{totalCount}</span> stores
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex gap-1">
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
                                                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                                                    currentPage === pageNumber
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'hover:bg-gray-100 text-gray-700'
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
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};