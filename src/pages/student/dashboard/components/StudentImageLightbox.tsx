import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useCallback } from "react";

interface StudentImageLightboxProps {
  images: string[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onClose: () => void;
}

const StudentImageLightbox = ({ images, activeIndex, setActiveIndex, onClose }: StudentImageLightboxProps) => {
  const isOpen = activeIndex >= 0 && images.length > 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, setActiveIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, setActiveIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center font-dm p-4 select-none">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2 cursor-pointer z-50 bg-black/20 rounded-full">
          <XIcon size={24} />
        </button>

        {images.length > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 cursor-pointer z-50 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <ChevronLeftIcon size={24} />
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 cursor-pointer z-50 bg-white/10 rounded-full hover:bg-white/20 transition-all">
              <ChevronRightIcon size={24} />
            </button>
          </>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative max-w-4xl max-h-[85vh] flex items-center justify-center">
          <img src={images[activeIndex]} alt={`Preview ${activeIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono">
            {activeIndex + 1} / {images.length}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentImageLightbox;
