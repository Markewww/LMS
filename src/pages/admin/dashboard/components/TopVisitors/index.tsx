// src\pages\admin\dashboard\components\TopVisitors\index.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Trophy, Clock, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface Visitor {
  rank: number;
  student_id: string;
  name: string;
  course: string;
  total_visits: number;
  duration: string;
  raw_minutes: number;
}

const TopVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopVisitors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/admin/get_top_visitors.php`);
        if (response.data && response.data.success) {
          setVisitors(response.data.data);
        }
      } catch (error) {
        console.error("Failed fetching leaderboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopVisitors();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs flex items-center justify-center py-10 text-gray-400 gap-2 text-xs font-bold font-mono">
        <Loader2 size={14} className="animate-spin text-cvsu-green-base" />
        <span>Calculating Monthly Top Visitors...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-100/80 rounded-3xl p-5 shadow-2xs select-none text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-3 text-cvsu-green-base">
        <Trophy size={16} className="text-amber-500" />
        <span className="text-xs font-black uppercase tracking-wider font-montserrat">
          Top Visitors (This Month)
        </span>
      </div>

      {visitors.length === 0 ? (
        <p className="text-center py-6 text-xs text-gray-400 italic">No attendance data logged this month.</p>
      ) : (
        <div className="space-y-2.5 max-h-85 overflow-y-auto pr-1 subtle-scrollbar">
          {visitors.map((visitor) => (
            <div 
              key={visitor.student_id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50 hover:bg-gray-50/50 transition-colors gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Ranking Medals/Badges */}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-black shrink-0 ${
                  visitor.rank === 1 ? "bg-amber-100 text-amber-700 font-extrabold" :
                  visitor.rank === 2 ? "bg-slate-100 text-slate-700" :
                  visitor.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {visitor.rank}
                </div>

                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-gray-800 truncate uppercase font-montserrat tracking-tight" title={visitor.name}>
                    {visitor.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono tracking-tight">
                    {visitor.student_id} • <span className="text-blue-600 font-sans uppercase font-bold">{visitor.course}</span>
                  </p>
                </div>
              </div>

              {/* Right Side Accumulation Badges */}
              <div className="shrink-0 text-right flex flex-col items-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-black font-mono text-cvsu-green-base bg-cvsu-bg px-2 py-0.5 rounded-md">
                  <Clock size={11} /> {visitor.duration}
                </span>
                <span className="text-[8px] text-gray-400 font-bold uppercase font-mono mt-0.5 tracking-tight">
                  {visitor.total_visits} Session{visitor.total_visits !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopVisitors;
