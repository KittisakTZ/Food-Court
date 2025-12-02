// @/components/customs/dialog/ModernDialog.tsx

import { FiAlertCircle, FiCheckCircle, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export type DialogType = 'confirm' | 'alert' | 'success' | 'error' | 'warning' | 'info';

interface ModernDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
}

const dialogConfig = {
  confirm: {
    icon: FiAlertCircle,
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconColor: 'text-white',
    glowColor: 'from-blue-400 to-indigo-400',
    primaryBtn: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
  },
  alert: {
    icon: FiAlertCircle,
    iconBg: 'bg-gradient-to-br from-slate-500 to-slate-700',
    iconColor: 'text-white',
    glowColor: 'from-slate-400 to-slate-500',
    primaryBtn: 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
  },
  success: {
    icon: FiCheckCircle,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    iconColor: 'text-white',
    glowColor: 'from-emerald-400 to-green-400',
    primaryBtn: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
  },
  error: {
    icon: FiAlertCircle,
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    iconColor: 'text-white',
    glowColor: 'from-red-400 to-rose-400',
    primaryBtn: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
  },
  warning: {
    icon: FiAlertTriangle,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-white',
    glowColor: 'from-amber-400 to-orange-400',
    primaryBtn: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
  },
  info: {
    icon: FiInfo,
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    iconColor: 'text-white',
    glowColor: 'from-cyan-400 to-blue-400',
    primaryBtn: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
  },
};

export const ModernDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'confirm',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  hideCancel = false,
}: ModernDialogProps) => {
  const config = dialogConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Icon Section */}
            <div className="flex flex-col items-center pt-10 pb-6 px-6">
              <div className="relative group">
                {/* Glow Effect */}
                <div className={`absolute -inset-3 bg-gradient-to-r ${config.glowColor} rounded-full blur-xl opacity-30 group-hover:opacity-50 transition duration-300`}></div>

                {/* Icon Container */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                  className={`relative w-20 h-20 ${config.iconBg} rounded-2xl flex items-center justify-center shadow-xl`}
                >
                  <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-2xl font-bold text-slate-900 mt-6 mb-3 text-center"
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="text-slate-600 text-center leading-relaxed px-2"
              >
                {description}
              </motion.p>
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="p-6 pt-0 flex gap-3"
            >
              {!hideCancel && (
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`${hideCancel ? 'w-full' : 'flex-1'} relative group/btn overflow-hidden rounded-xl`}
              >
                <div className={`absolute inset-0 ${config.primaryBtn} transition-transform group-hover/btn:scale-105`}></div>
                <div className={`absolute inset-0 bg-gradient-to-r ${config.glowColor} opacity-0 group-hover/btn:opacity-100 transition-opacity blur-xl`}></div>
                <div className="relative px-6 py-3.5 text-white font-bold shadow-lg group-hover/btn:shadow-xl transition-all">
                  {confirmText}
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
