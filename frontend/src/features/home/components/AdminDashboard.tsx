// @/features/home/components/AdminDashboard.tsx

import { useAdminStores, useAdminApproveStore } from "@/hooks/useAdmin";
import { Store } from "@/types/response/store.response";

export const AdminDashboard = () => {
    const { data: stores, isLoading, isError } = useAdminStores();
    const { mutate: approveStore, isPending } = useAdminApproveStore();

    if (isLoading) return <div>Loading stores for admin...</div>;
    if (isError) return <div>Failed to load stores.</div>;

    const handleApprove = (storeId: string, storeName: string) => {
        if (window.confirm(`Are you sure you want to approve the store "${storeName}"?`)) {
            approveStore(storeId);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard: Store Management</h1>

            <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-semibold mb-4">All Stores</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stores?.map((store: Store) => (
                                <tr key={store.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                                        <div className="text-sm text-gray-500">{store.description || 'No description'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{store.owner?.username ?? 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {store.isApproved ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending Approval
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(store.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {!store.isApproved && (
                                            <button
                                                onClick={() => handleApprove(store.id, store.name)}
                                                disabled={isPending}
                                                className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};