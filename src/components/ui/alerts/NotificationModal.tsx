/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, CheckCircle2Icon, AlertTriangleIcon, XCircleIcon, InfoIcon } from "lucide-react";

export type AlertType = "success" | "warning" | "error" | "info";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AlertType;
  title: string;
  message: string;
}

const typeStyles: Record<AlertType, { bg: string; icon: any; color: string; border: string }> = {
  success: { bg: "bg-emerald-50", icon: CheckCircle2Icon, color: "text-emerald-600", border: "border-emerald-100" },
  warning: { bg: "bg-amber-50", icon: AlertTriangleIcon, color: "text-amber-600", border: "border-amber-100" },
  error: { bg: "bg-red-50", icon: XCircleIcon, color: "text-red-600", border: "border-red-100" },
  info: { bg: "bg-blue-50", icon: InfoIcon, color: "text-blue-600", border: "border-blue-100" }
};

const NotificationModal = ({ isOpen, onClose, type, title, message }: NotificationModalProps) => {
  const currentStyle = typeStyles[type];
  const Icon = currentStyle.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-dm">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`bg-white border rounded-2xl p-6 shadow-xl w-full max-w-sm overflow-hidden relative z-10 ${currentStyle.border}`}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer">
              <XIcon size={16} />
            </button>

            <div className="flex flex-col items-center text-center space-y-3 mt-2">
              <div className={`p-3 rounded-full ${currentStyle.bg} ${currentStyle.color}`}>
                <Icon size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-montserrat font-black uppercase text-gray-800 tracking-wide">{title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{message}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-white shadow-md bg-cvsu-green-base hover:bg-cvsu-green-dark"
            >
              Acknowledge
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
