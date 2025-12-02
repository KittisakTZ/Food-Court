// @/components/customs/ConfirmationDialog.tsx

import { ModernDialog, DialogType } from "@/components/customs/dialog/ModernDialog";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'confirm',
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
}: ConfirmationDialogProps) => {
    return (
        <ModernDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            description={description}
            type={type}
            confirmText={confirmText}
            cancelText={cancelText}
        />
    );
};
