import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalShelfProps {
  title: string;
  children: React.ReactNode;
  onSeeMoreClick?: () => void; // Added optional property trigger callback
}

const HorizontalShelf = ({ title, children, onSeeMoreClick }: HorizontalShelfProps) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = 400; // Pixels to shift on click
      rowRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="space-y-3 relative group/row text-left font-dm w-full">
      <div className="flex justify-between items-baseline pr-2">
        <h3 className="text-lg font-montserrat font-black text-gray-800 uppercase tracking-wide">
          {title}
        </h3>
        
        {/* Triggers the callback loop when clicked */}
        <span 
          onClick={() => onSeeMoreClick && onSeeMoreClick()}
          className="text-xs font-bold text-cvsu-green-base cursor-pointer hover:underline uppercase font-montserrat tracking-tight"
        >
          See more &gt;
        </span>
      </div>

      {/* Floating Left Navigation Arrow Cue */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-1 top-[55%] -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-20 opacity-0 group-hover/row:opacity-100 transition-opacity shadow-md cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Main Core Flex Box Track Container */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x px-1 scroll-smooth w-full"
      >
        {children}
      </div>

      {/* Floating Right Navigation Arrow Cue */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-1 top-[55%] -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 rounded-full z-20 opacity-0 group-hover/row:opacity-100 transition-opacity shadow-md cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default HorizontalShelf;
