import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Globe, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

const PendingResearchFeed = ({ student }: { student: any }) => {
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/get_pending_research.php?student_id=${student.student_id || student.id}`
      );
      setPendingPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student) fetchPending();
  }, [student]);

  if (loading) return null;
  if (pendingPosts.length === 0) return null;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center gap-2 px-1">
        <AlertCircle size={14} className="text-amber-500" />
        <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-montserrat">
          Pending for Review ({pendingPosts.length})
        </h3>
      </div>

      {pendingPosts.map((post) => (
        <div 
          key={post.uuid} 
          className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 opacity-70 grayscale-[0.5] relative overflow-hidden"
        >
          {/* Overlay to disable interactions */}
          <div className="absolute inset-0 z-10 cursor-not-allowed" title="Under Review" />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-black">
                {post.type?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">{post.type}</p>
                <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                  <Clock size={10} /> Queued: {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
              Pending Approval
            </span>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-600 leading-tight text-lg line-clamp-1">{post.title}</h4>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic">
              {post.abstract}
            </p>
          </div>

          {/* Verification Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
            <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium italic">
              <Globe size={10}/>{post.status === 'approved' ? "CEIT Repository" : post.verification_code}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingResearchFeed;
