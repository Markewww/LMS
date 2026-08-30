import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useCallback } from "react";

interface ImageLightboxProps {
  images: string[]; // Pass the entire image array string collection
  activeIndex: number; // Index location identifier
  setActiveIndex: (index: number) => void;
  onClose: () => void;
}

const ImageLightbox = ({ images, activeIndex, setActiveIndex, onClose }: ImageLightboxProps) => {
  const isOpen = activeIndex >= 0 && images.length > 0;
  const currentImageUrl = isOpen ? images[activeIndex] : null;

  // Prevent background scrolling while active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Prevent background scrolling while active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // 2. Wrapped in useCallback to preserve stable identity across renders
  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, setActiveIndex]);

  // 3. Wrapped in useCallback to preserve stable identity across renders
  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, setActiveIndex]);

  // 4. Added missing functions to dependency array safely
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]); // All dependencies now satisfied perfectly

  return (
    <AnimatePresence>
      {isOpen && currentImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md cursor-zoom-out select-none"
        >
          {/* Top Close Panel Toggle */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 z-50 cursor-pointer"
            title="Close Fullscreen View"
          >
            <XIcon size={24} />
          </button>

          {/* Pagination Counter Badge */}
          {images.length > 1 && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white/80 font-montserrat font-bold text-xs bg-black/40 px-3 py-1.5 rounded-full border border-white/10 tracking-widest uppercase">
              {activeIndex + 1} of {images.length}
            </div>
          )}

          {/* ─── NAVIGATION BACKWARD BUTTON ─── */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full border border-white/10 transition-all hover:scale-105 z-50 cursor-pointer"
            >
              <ChevronLeftIcon size={24} />
            </button>
          )}

          {/* Core Target Display Frame */}
          <motion.img
            key={activeIndex} // Changing the key enforces smooth transition fade on switch layouts
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={currentImageUrl}
            alt="Announcement Expanded View"
            onClick={(e) => e.stopPropagation()} 
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5 cursor-default"
          />

          {/* ─── NAVIGATION FORWARD BUTTON ─── */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full border border-white/10 transition-all hover:scale-105 z-50 cursor-pointer"
            >
              <ChevronRightIcon size={24} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
