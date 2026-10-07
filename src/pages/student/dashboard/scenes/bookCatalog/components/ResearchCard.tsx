import { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import type { ResearchProject } from "./ResearchGrid";

interface ResearchCardProps {
  res: ResearchProject & { rating?: number; reviews_count?: number };
  onSelect: (study: ResearchProject) => void;
}

const ResearchCard = ({ res, onSelect }: ResearchCardProps) => {
  // Local reactive states to override rating metrics right away upon click transactions
  const [liveRating, setLiveRating] = useState<number>(res.rating ?? 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarRatingSubmit = async (e: React.MouseEvent, score: number) => {
    e.preventDefault();
    e.stopPropagation(); // Restrains background card clicks from opening the viewer layout
    if (isSubmitting) return;

    // Grab student authentication registry parameters directly out from browser session storage
    const userSession = localStorage.getItem("user");
    if (!userSession) {
      alert("⚠️ Access Restrained: Please authenticate session logs to cast standard rating entries.");
      return;
    }

    const studentId = JSON.parse(userSession).id;
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/student/submit_rating.php`, {
        student_id: studentId,
        asset_id: res.uuid,
        asset_type: "research",
        rating_score: score
      });

      if (response.data.success) {
        setLiveRating(response.data.average_score);
      }
    } catch (err) {
      console.error("Failed recording manuscript star evaluation score matrix:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={() => onSelect(res)}
      className="max-w-2xs w-full shrink-0 bg-white border border-gray-100 p-4 rounded-xl shadow-xs flex flex-col justify-between snap-start hover:scale-[1.01] transition-transform font-dm cursor-pointer group/item text-left select-none"
    >
      <div>
        {/* PREMIUM HARDCOVER MANUSCRIPT THUMBNAIL STYLE */}
        <div className="aspect-4/5 w-full rounded-xl bg-linear-to-b from-[#0f2042] to-[#071126] border-2 border-[#d4af37]/40 p-3 flex flex-col justify-between text-center shadow-md relative overflow-hidden group/card mb-3 items-center">
          <div className="absolute inset-y-0 left-0 w-2 bg-linear-to-r from-black/40 via-transparent to-transparent pointer-events-none z-10" />
          <div className="absolute inset-1.5 border border-[#d4af37]/20 rounded-lg pointer-events-none z-10" />
          
          <div className="z-10">
            <span className="text-[7px] text-[#d4af37] font-black uppercase tracking-widest border border-[#d4af37]/30 px-1.5 py-0.5 rounded-sm bg-black/10">
              {res.type}
            </span>
          </div>
          
          <div className="z-10 px-0.5 max-h-16 overflow-hidden flex items-center justify-center">
            <h4 className="text-[9px] font-bold font-montserrat tracking-wide text-[#e5c158] leading-tight line-clamp-4 uppercase drop-shadow-xs" title={res.title}>
              {res.title}
            </h4>
          </div>
          
          <div className="z-10 w-full border-t border-[#d4af37]/20 pt-1 flex items-center justify-between text-[7px] text-[#d4af37]/80 font-bold uppercase tracking-tight">
            <span className="truncate max-w-14">{res.program || "CEIT"}</span>
            <span>{res.year || "N/A"}</span>
          </div>

          {res.file_path && (
            <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover/card:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-wider rounded-lg z-20">
              View PDF
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover/item:text-cvsu-green-base transition-colors" title={res.title}>
          {res.title}
        </h4>
        <p className="text-[11px] text-gray-400 truncate mt-1">
          {res.authors || "Unknown Author"}
        </p>
      </div>

      {/* FOOTER METADATA: INTERACTIVE STAR VOTE SELECTION CORES */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-[10px]">
        <span className="font-bold text-gray-400 font-mono">{res.year || "N/A"}</span>
        
        <div 
          className="flex items-center gap-0.5 text-amber-400 cursor-default"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating !== null ? star <= hoverRating : star <= Math.round(liveRating);
            return (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                onMouseEnter={() => setHoverRating(star)}
                onClick={(e) => handleStarRatingSubmit(e, star)}
                className="focus:outline-none transition-transform active:scale-125 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Rate ${star} out of 5 stars`}
              >
                <Star 
                  size={11} 
                  fill={isFilled ? "currentColor" : "none"} 
                  className={hoverRating !== null && star <= hoverRating ? "scale-110 text-amber-500" : "text-amber-400"}
                />
              </button>
            );
          })}
          {liveRating > 0 && (
            <span className="text-[9px] text-gray-400 font-bold ml-1 font-mono">({liveRating})</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchCard;
