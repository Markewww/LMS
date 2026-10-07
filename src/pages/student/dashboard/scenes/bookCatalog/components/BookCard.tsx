import { useState } from "react";
import axios from "axios";
import { BookOpenIcon, Star } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import type { Book } from "./BookGrid";

interface BookCardProps {
  book: Book & { rating?: number; reviews_count?: number };
}

const BookCard = ({ book }: BookCardProps) => {
  // Local reactive states to override rating metrics right away upon click transactions
  const [liveRating, setLiveRating] = useState<number>(book.rating ?? 0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarRatingSubmit = async (e: React.MouseEvent, score: number) => {
    e.preventDefault();
    e.stopPropagation();
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
        asset_id: book.barcode, // Uses standard item bar codes as reference tokens
        asset_type: "book",
        rating_score: score
      });

      if (response.data.success) {
        setLiveRating(response.data.average_score);
      }
    } catch (err) {
      console.error("Failed recording textbook star evaluation score matrix:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xs w-full shrink-0 bg-white border border-gray-100 p-4 rounded-xl shadow-xs flex flex-col justify-between snap-start hover:scale-[1.01] transition-transform text-left font-dm select-none">
      <div>
        <div className="aspect-4/5 w-full bg-cvsu-bg/40 rounded-lg flex flex-col p-3 border border-gray-100/50 mb-3 items-center justify-center relative">
          <BookOpenIcon size={32} className="text-cvsu-green-base mb-2" />
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
            book.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}>
            {book.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        
        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight" title={book.title}>
          {book.title}
        </h4>
        <p className="text-[11px] text-gray-400 truncate mt-1">
          {book.authors || "Unknown Author"}
        </p>
      </div>

      {/* FOOTER METADATA: INTERACTIVE STAR VOTE SELECTION CORES */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 text-[10px]">
        <span className="font-black text-cvsu-green-base uppercase tracking-tight truncate max-w-16">
          {book.category}
        </span>
        
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
                className="focus:outline-none transition-transform active:scale-125 cursor-pointer disabled:opacity-50"
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

export default BookCard;
