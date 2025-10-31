// @/services/toast.service.ts (แก้ไขเล็กน้อย)

type ShowToastFunction = (message: string, type: 'success' | 'error'| 'warning') => void; // <-- เปลี่ยน isSuccess เป็น type

let showToastFunction: ShowToastFunction | null = null;

export const registerToast = (func: ShowToastFunction) => {
    showToastFunction = func;
};

export const toastService = {
    success: (message: string) => {
        if (showToastFunction) {
            showToastFunction(message, 'success'); // <-- ส่ง 'success'
        }
    },
    error: (message: string) => {
        if (showToastFunction) {
            showToastFunction(message, 'error'); // <-- ส่ง 'error'
        }
    },
    warning: (message: string) => {
        if (showToastFunction) {
            showToastFunction(message,'warning'); // <-- ส่ง 'warning'
        }
    },
};