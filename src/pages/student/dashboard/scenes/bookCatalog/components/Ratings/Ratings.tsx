/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { Star, BarChart3, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface RatingsProps {
  assetId: string;
  assetType: "book" | "research";
}

const Ratings = ({ assetId, assetType }: RatingsProps) => {
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. FETCH LIVE AGGREGATED BREAKDOWNS ON COMPONENT MOUNT
  const fetchRatingData = async () => {
    try {
      setLoading(true);
      
      // FETCH CLIENT IDENTITY OUT FROM LOCAL STORAGE BEFORE INVOKING THE COMPILER
      const userSession = localStorage.getItem("user");
      const studentId = userSession ? JSON.parse(userSession).id : "";
  
      // UPDATED: Appended '&student_id=\${studentId}' safely onto your HTTP query line
      const response = await axios.get(
        `${API_BASE_URL}/student/get_asset_rating_stats.php?asset_id=${assetId}&asset_type=${assetType}&student_id=${studentId}`
      );
      
      if (response.data.success) {
        setAverageScore(response.data.average_score);
        setTotalReviews(response.data.total_votes);
        setRatingDistribution(response.data.distribution);
        setUserRating(response.data.user_current_vote || 0); // Saves user stars perfectly now!
      }
    } catch (err) {
      console.error("Failed loading target breakdown distribution parameters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      fetchRatingData();
    }
  }, [assetId, assetType]);

  // 2. INTERACTIVE SUBMISSION ENGINE HOOK
  const handleRateSubmit = async (score: number) => {
    if (submitting) return;

    const userSession = localStorage.getItem("user");
    if (!userSession) {
      alert("⚠️ Access Restrained: Please authenticate session logs to cast your rating entry.");
      return;
    }

    const studentId = JSON.parse(userSession).id;
    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/student/submit_rating.php`, {
        student_id: studentId,
        asset_id: assetId,
        asset_type: assetType,
        rating_score: score
      });

      if (response.data.success) {
        // Refetches live stats right away to cause progress bars and scores to transition instantly
        await fetchRatingData();
      }
    } catch (err) {
      console.error("Transaction processing error exception:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-4 border-t border-gray-100 flex items-center justify-center py-6 text-gray-400 gap-2 text-xs font-bold font-mono">
        <Loader2 size={14} className="animate-spin text-cvsu-green-base" />
        <span>Compiling Metric Distributions...</span>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-gray-100 space-y-5 font-dm select-none animate-in fade-in duration-300">
      
      {/* SECTION HEADER LABELS */}
      <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
        <BarChart3 size={14} className="text-cvsu-green-base" /> Evaluation Analytics
      </h4>

      {/* CORE DISPLAY WORKSPACE GRID PANEL SPLITTER */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center bg-white p-4 rounded-xl border border-gray-100/60 shadow-2xs">
        
        {/* LEFT COLUMN PANEL: DYNAMIC AVERAGE SCORE VALUE */}
        <div className="sm:col-span-2 text-center flex flex-col justify-center items-center py-2 border-b sm:border-b-0 sm:border-r border-gray-100">
          <span className="text-4xl font-montserrat font-black text-gray-800 tracking-tighter">
            {averageScore.toFixed(1)}
          </span>
          <div className="flex gap-0.5 text-amber-400 mt-1 mb-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={12} 
                fill={star <= Math.round(averageScore) ? "currentColor" : "none"} 
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
            {totalReviews} Total Review{totalReviews !== 1 ? "s" : ""}
          </span>
        </div>

        {/* RIGHT COLUMN PANEL: 5 PROGRESS BARS CHANNELS LAYER */}
        <div className="sm:col-span-3 space-y-1.5 pl-0 sm:pl-2">
          {[5, 4, 3, 2, 1].map((row) => {
            const count = ratingDistribution[row] || 0;
            // Computes relative percentage lengths safely without producing infinity calculations
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={row} className="flex items-center gap-3 text-[11px] font-bold text-gray-500 font-mono">
                {/* Numeric Indicator */}
                <span className="w-2.5 text-right shrink-0">{row}</span>
                
                {/* Progress bar container rail track */}
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden relative border border-gray-50">
                  <div 
                    className="h-full bg-cvsu-green-base rounded-full transition-all duration-500 shadow-inner"
                    style={{ width: `${percentage}%` }} // Only displays as a clear shade of green
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE INPUT ZONE FOOTER: SINGLE CLICKABLE STARS LINE ROW */}
      <div className="flex flex-col items-center bg-gray-50/60 border border-gray-100/40 p-3 rounded-xl space-y-1.5 text-center">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-montserrat">
          {userRating > 0 ? "Modify your logged vote entry" : "Tap star index to assign evaluation score"}
        </span>

        <div 
          className="flex items-center gap-1 text-amber-400"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            // Evaluates fill weights based on cursor coordinate positions
            const isFilled = hoverRating !== null ? star <= hoverRating : star <= userRating;

            return (
              <button
                key={star}
                type="button"
                disabled={submitting}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => handleRateSubmit(star)}
                className="focus:outline-none transition-transform active:scale-125 hover:scale-110 disabled:opacity-40 disabled:scale-100 cursor-pointer p-0.5"
                title={`Assign a ${star} star evaluation score`}
              >
                <Star 
                  size={16} 
                  fill={isFilled ? "currentColor" : "none"} 
                  className="transition-colors duration-150"
                />
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Ratings;
