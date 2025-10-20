// @/utils/statusUtils.ts

// Helper function เพื่อแสดงสีของสถานะ
export const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'text-gray-800 bg-gray-200';
        case 'AWAITING_PAYMENT': return 'text-orange-800 bg-orange-200';
        case 'COOKING': return 'text-blue-800 bg-blue-200';
        case 'READY_FOR_PICKUP': return 'text-green-800 bg-green-200';
        case 'COMPLETED': return 'text-purple-800 bg-purple-200';
        case 'CANCELLED':
        case 'REJECTED': return 'text-red-800 bg-red-200';
        default: return 'text-gray-800 bg-gray-200';
    }
}

// Helper function เพื่อแสดงชื่อสถานะให้สวยงาม
export const getStatusName = (status: string) => {
    return status.replace('_', ' ');
}