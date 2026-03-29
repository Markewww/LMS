import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

 type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="mx-auto w-16 h-16 bg-cvsu-green-50 rounded-full flex items-center justify-center text-cvsu-green-base mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase tracking-tighter">{title}</h3>
            <p className="text-gray-500 text-sm mt-2 mb-8">{message}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className="flex-1 py-3 bg-cvsu-green-base text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cvsu-green-dark shadow-lg shadow-cvsu-green-base/20 transition-all"
              >
                Approve
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
