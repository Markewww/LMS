import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, FileText, Globe, MoreHorizontal, Download, User, Tag, ChevronDown, ChevronUp } from "lucide-react";
import ResearchPostModal from "@/pages/student/dashboard/components/ResearchPostModal";

// Config Files
import { PDF_BASE_URL } from "@/API/PDFConfig";
import { API_BASE_URL } from "@/API/APIConfig";

const Timeline = ({ student }: { student: any }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/get_my_posts.php?student_id=${student.student_id || student.id}`);
      if (Array.isArray(res.data)) setPosts(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPosts(); }, [student]);

  const parseJson = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const toggleExpand = (uuid: string) => {
    setExpandedPosts(prev => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  return (
    <div className="space-y-4 font-dm">
      <ResearchPostModal 
        isOpen={isPostModalOpen} 
        onClose={() => { setIsPostModalOpen(false); fetchPosts(); }} 
        student={student} 
      />

      {/* COMPOSER CARD */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-cvsu-green-base rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          {student?.first_name?.charAt(0)}
        </div>
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 text-left px-4 py-2.5 rounded-full text-sm font-medium transition-all border border-gray-100"
        >
          What research are you working on, {student?.first_name}?
        </button>
      </div>

      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 font-montserrat">Your Submissions</h3>
      
      {posts.length > 0 ? (
        posts.map((post) => {
          const authors = parseJson(post.authors);
          const keywords = parseJson(post.keywords);
          const isMentioned = post.submitted_by !== (student.student_id || student.id);
          const isExpanded = expandedPosts[post.uuid];
          const abstractLimit = 150; // Character limit for "See more"

          return (
            <div key={post.uuid} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cvsu-bg rounded-xl flex items-center justify-center text-cvsu-green-base font-black shadow-inner border border-cvsu-green-base/10">
                    {post.owner_fname?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-cvsu-green-base uppercase tracking-tighter">{post.type}</p>
                      {isMentioned && (
                        <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-100">
                          Mentioned you in a post
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
                      <Clock size={10} /> {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gray-600 transition-colors"><MoreHorizontal size={20}/></button>
              </div>

              {/* Research Title & Abstract with "See more" */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 leading-tight text-lg">{post.title}</h4>
                <div className="text-xs text-gray-500 leading-relaxed">
                  {isExpanded || post.abstract.length <= abstractLimit ? (
                    <p>{post.abstract}</p>
                  ) : (
                    <p>
                      {post.abstract.substring(0, abstractLimit)}...
                      <button 
                        onClick={() => toggleExpand(post.uuid)}
                        className="text-cvsu-green-base font-bold ml-1 hover:underline"
                      >
                        See more <ChevronDown size={12} className="inline" />
                      </button>
                    </p>
                  )}
                  {isExpanded && (
                    <button 
                      onClick={() => toggleExpand(post.uuid)}
                      className="text-cvsu-green-base font-bold mt-1 block hover:underline"
                    >
                      See less <ChevronUp size={12} className="inline" />
                    </button>
                  )}
                </div>
              </div>

              {/* Authors & Keywords Section */}
              <div className="space-y-3 pt-2">
                {/* Authors */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <User size={10} /> Authors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {authors.map((auth: any, i: number) => (
                      <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[9px] font-black uppercase border border-blue-100">
                        {auth.first_name} {auth.last_name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Horizontal Separator */}
                <div className="border-b border-gray-50 w-full"></div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag size={10} /> Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((word: string, i: number) => (
                      <span key={i} className="flex items-center gap-1 bg-cvsu-bg text-cvsu-green-base px-2 py-1 rounded-md text-[9px] font-black uppercase border border-cvsu-green-base/20">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status & PDF Download */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    post.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    post.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium italic">
                    <Globe size={10}/>{post.status === 'approved' ? "CEIT Repository" : post.verification_code}
                  </span>
                </div>
                <a 
                  href={`${PDF_BASE_URL}${post.file_path}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-cvsu-green-base text-[10px] font-black uppercase hover:underline"
                >
                  <Download size={14} /> PDF File
                </a>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <FileText className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-bold text-sm">No research activity found.</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;
