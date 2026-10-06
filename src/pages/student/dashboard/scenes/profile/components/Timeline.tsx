/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\student\dashboard\scenes\profile\components\Timeline.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Clock, FileText, Globe, MoreHorizontal, Download, 
  User, Tag, ChevronDown, ChevronUp 
} from "lucide-react";
import ResearchPostModal from "@/pages/student/dashboard/components/ResearchPostModal"; // Mapped to your local path

// Config Files
import { PDF_BASE_URL } from "@/API/PDFConfig";
import { API_BASE_URL } from "@/API/APIConfig";

const Timeline = ({ student }: { student: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});

  // FIXED: Restored functional template literal backticks to secure server requests
  const fetchPosts = async () => {
    if (!student) return;
    try {
      const studentIdentifier = student.student_id || student.id;
      const res = await axios.get(`${API_BASE_URL}/student/get_my_posts.php?student_id=${studentIdentifier}`);
      if (Array.isArray(res.data)) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error("Failed syncing timeline resource arrays:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [student]); //

  // AUTOMATED STRING SANITIZER ENGINE
  // Intelligently converts both JSON brackets and comma-separated string fields into clean text arrays
  const normalizeDataSlices = (inputBlob: any): string[] => {
    if (!inputBlob) return [];
    if (Array.isArray(inputBlob)) return inputBlob.filter(Boolean);
    
    const trimmed = String(inputBlob).trim();
    
    // Check Case A: If it is stringified JSON format, decode it safely
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.map((item: any) => {
          if (typeof item === "object" && item !== null) {
            // Extracts name fields out if stored as object keys
            return String(item.first_name || "").trim() + " " + String(item.last_name || "").trim();
          }
          return String(item).trim();
        }).filter(Boolean);
      } catch {
        // Fallback on parser crash
      }
    }

    // Check Case B: If it is standard comma-separated text data, split into individual tokens
    return trimmed.split(",").map(item => item.trim()).filter(Boolean);
  };

  const toggleExpand = (uuid: string) => {
    setExpandedPosts(prev => ({ ...prev, [uuid]: !prev[uuid] })); //
  };

  const abstractLimit = 150; // Character boundary limit for "See more"

  return (
    <div className="space-y-4 font-dm text-left w-full select-none">
      
      {/* RESEARCH COMPOSER DIALOG POPUP MODAL MOUNT */}
      <ResearchPostModal
        isOpen={isPostModalOpen}
        onClose={() => { setIsPostModalOpen(false); fetchPosts(); }}
        student={student}
      />

      {/* COMPOSER BANNER CARD BOX */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cvsu-green-base rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm font-montserrat uppercase">
          {student?.first_name?.charAt(0) || <User size={16} />}
        </div>
        <button
          type="button"
          onClick={() => setIsPostModalOpen(true)} // FIXED SYNTAX
          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-left px-4 py-2.5 rounded-full text-sm font-medium transition-all border border-gray-100 cursor-pointer"
        >
          What research are you working on, {student?.first_name || "Student"}?
        </button>
      </div>

      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 font-montserrat">
        Your Submissions
      </h3>

      {/* REGISTRY RECOVERY LOGS CONTAINER SWITCH LOOP */}
      {posts.length > 0 ? (
        posts.map((post) => {
          // Process authors and keywords data fields through the normalization engine
          const authors = normalizeDataSlices(post.authors);
          const keywords = normalizeDataSlices(post.keywords);
          
          const isMentioned = post.submitted_by !== (student?.student_id || student?.id); //
          const isExpanded = !!expandedPosts[post.uuid]; //

          return (
            <div 
              key={post.uuid} 
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              {/* CARD BLOCK HEADER SUB-SECTION */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cvsu-bg rounded-xl flex items-center justify-center text-cvsu-green-base font-black shadow-inner border border-cvsu-green-base/10 font-montserrat text-sm uppercase">
                    {student?.first_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-cvsu-green-base uppercase tracking-tighter">
                        {post.type}
                      </p>
                      {isMentioned && ( //
                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-100 animate-pulse">
                          Mentioned you in a post
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 italic flex items-center gap-1 mt-0.5 font-mono">
                      <Clock size={10} /> {post.created_at ? new Date(post.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <button type="button" className="text-gray-300 hover:text-gray-600 transition-colors cursor-pointer">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* RESEARCH TITLE & COLLAPSIBLE ABSTRACT SPACE */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 leading-tight text-base font-montserrat uppercase tracking-tight">
                  {post.title}
                </h4>
                <div className="text-xs text-gray-500 leading-relaxed font-medium">
                  {isExpanded || (post.abstract && post.abstract.length <= abstractLimit) ? ( //
                    <p className="text-justify italic">"{post.abstract || "No abstract detailed summary text provided."}"</p>
                  ) : (
                    <p className="text-justify italic">
                      "{post.abstract ? post.abstract.substring(0, abstractLimit) : "" }..."
                      <button
                        type="button"
                        onClick={() => toggleExpand(post.uuid)} // FIXED TYPO BINDINGS
                        className="text-cvsu-green-base font-black ml-1 hover:underline cursor-pointer inline-flex items-center gap-0.5 not-italic"
                      >
                        See more <ChevronDown size={12} className="inline" />
                      </button>
                    </p>
                  )}
                  
                  {isExpanded && (post.abstract && post.abstract.length > abstractLimit) && ( //
                    <button
                      type="button"
                      onClick={() => toggleExpand(post.uuid)}
                      className="text-cvsu-green-base font-black mt-1 hover:underline cursor-pointer inline-flex items-center gap-0.5"
                    >
                      See less <ChevronUp size={12} className="inline" />
                    </button>
                  )}
                </div>
              </div>

              {/* AUTHORS & INDEX KEYWORDS BADGES MATRIX ROWS */}
              <div className="space-y-3 pt-2 border-t border-gray-50">
                {/* Section A: Authors List Display Row */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 font-montserrat">
                    <User size={10} /> Authors
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {authors.length > 0 ? (
                      authors.map((auth: string, i: number) => ( // FIXED: Correctly parses normalized string names
                        <span key={i} className="flex items-center bg-cvsu-green-100 text-cvsu-green px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border border-blue-100 font-mono shadow-2xs">
                          {auth}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 italic pl-0.5">No authors indexed</span>
                    )}
                  </div>
                </div>

                {/* Section B: Keywords Badges Display Row */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 font-montserrat">
                    <Tag size={10} /> Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.length > 0 ? (
                      keywords.map((word: string, i: number) => (
                        <span key={i} className="flex items-center bg-cvsu-bg text-cvsu-green-base px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border border-cvsu-green-base/20 shadow-2xs">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 italic pl-0.5">No keywords indexed</span>
                    )}
                  </div>
                </div>
              </div>

              {/* COMPLIANCE STATUS & STORAGE ATTACHMENT EXPORTS ROW */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    post.status === 'approved' ? 'bg-green-100 text-green-700' :
                    post.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold italic">
                    <Globe size={10} /> {post.status === 'approved' ? "CEIT Repository" : (post.verification_code || "Pending Code")}
                  </span>
                </div>
                
                {post.file_path && (
                  <a
                    href={`${PDF_BASE_URL}/${post.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-cvsu-green-base text-[10px] font-black uppercase hover:underline shadow-2xs bg-cvsu-bg px-3 py-1.5 rounded-xl border border-cvsu-green-base/10"
                  >
                    <Download size={13} /> PDF Manuscript
                  </a>
                )}
              </div>

            </div>
          );
        })
      ) : (
        /* DISPATCH STATUS FALLBACK: IF NO MATCHES ARE POPULATED FOR PROFILE */
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-bold text-sm">No research submissions found on file</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;
