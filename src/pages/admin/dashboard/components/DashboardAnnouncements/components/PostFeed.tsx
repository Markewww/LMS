import { motion, AnimatePresence } from "framer-motion";
import { UserIcon, Trash2Icon, ZoomInIcon } from "lucide-react";
import { postBackgrounds } from "../postBg";

interface Announcement {
  id: number;
  adminId: string;
  text: string;
  imagePath: string | null;
  bgId?: string;
  createdAt: string;
}

interface PostFeedProps {
  posts: Announcement[];
  loading: boolean;
  currentAdminId: string;
  baseAssetUrl: string;
  onDelete: (id: number) => void;
  onImageClick: (images: string[], index: number) => void;
}

const PostFeed = ({ posts, loading, currentAdminId, baseAssetUrl, onDelete, onImageClick }: PostFeedProps) => {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="text-center text-xs text-gray-400 italic py-4">No recent library updates posted yet.</p>;
  }

  return (
    <div className="space-y-4 max-h-500px overflow-y-auto pr-1">
      <AnimatePresence>
        {posts.map((post) => {
          const matchedBg = postBackgrounds.find((bg) => bg.id === post.bgId) || postBackgrounds[0];
          const isCustomBg = matchedBg.id !== "none";

          const imageList = post.imagePath 
            ? post.imagePath.split(",").map(path => path.trim()).filter(Boolean)
            : [];

          const absoluteImages = imageList.map(src => `${baseAssetUrl}/${src}`);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs group/card"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-gray-100 text-gray-500 mt-0.5">
                  <UserIcon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 truncate">{post.adminId}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {post.adminId === currentAdminId && (
                      <button
                        onClick={() => onDelete(post.id)}
                        title="Delete announcement"
                        className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all duration-200"
                      >
                        <Trash2Icon size={16} />
                      </button>
                    )}
                  </div>

                  {/* ─── CASE A: CUSTOM BACKGROUND THEME ─── */}
                  {isCustomBg && imageList.length === 0 ? (
                    <div className={`mt-4 rounded-2xl overflow-hidden aspect-4/5 w-full max-w-md mx-auto flex items-center justify-center text-center p-8 transition-all duration-300 shadow-inner ${matchedBg.className}`}>
                      <p className="text-xl md:text-2xl font-black whitespace-pre-wrap leading-snug select-text tracking-wide drop-shadow-xs">
                        {post.text}
                      </p>
                    </div>
                  ) : (
                    /* ─── CASE B: STANDARD TEXT VIEW ─── */
                    <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">
                      {post.text}
                    </p>
                  )}

                  {/* ─── MULTI-IMAGE 4:5 CONTAINER ─── */}
                  {imageList.length > 0 && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 aspect-4/5 w-full max-w-md mx-auto bg-gray-50 relative">
                      
                      {/* 1 IMAGE LAYOUT */}
                      {imageList.length === 1 && (
                        <div 
                          onClick={() => onImageClick(absoluteImages, 0)} // FIX: Explicitly pass index 0
                          className="w-full h-full cursor-pointer relative group/img"
                        >
                          <img src={`${baseAssetUrl}/${imageList[0]}`} alt="Attachment" className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomInIcon className="text-white drop-shadow-md" size={24} />
                          </div>
                        </div>
                      )}

                      {/* 2 IMAGES STACKED VERTICALLY */}
                      {imageList.length === 2 && (
                        <div className="flex flex-col h-full w-full gap-1">
                          {imageList.map((imgSrc, idx) => (
                            <div 
                              key={idx}
                              onClick={() => onImageClick(absoluteImages, idx)} // Correctly passes idx loop tracker
                              className="flex-1 min-h-0 cursor-pointer relative group/img overflow-hidden"
                            >
                              <img src={`${baseAssetUrl}/${imgSrc}`} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomInIcon className="text-white" size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3 OR MORE IMAGES: SMART SOCIAL COLLAGE */}
                      {imageList.length >= 3 && (
                        <div className="grid grid-cols-2 h-full w-full gap-1">
                          {/* Left Panel: Primary Spotlight Image */}
                          <div 
                            onClick={() => onImageClick(absoluteImages, 0)} // FIX: Explicitly pass index 0
                            className="h-full w-full cursor-pointer relative group/img overflow-hidden"
                          >
                            <img src={`${baseAssetUrl}/${imageList[0]}`} alt="Spotlight Attachment" className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomInIcon className="text-white" size={22} />
                            </div>
                          </div>

                          {/* Right Panel: Split Side Columns */}
                          <div className="flex flex-col h-full w-full gap-1">
                            {/* Secondary Row Image */}
                            <div 
                              onClick={() => onImageClick(absoluteImages, 1)} // FIX: Explicitly pass index 1
                              className="flex-1 min-h-0 cursor-pointer relative group/img overflow-hidden"
                            >
                              <img src={`${baseAssetUrl}/${imageList[1]}`} alt="Attachment 2" className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomInIcon className="text-white" size={18} />
                              </div>
                            </div>

                            {/* Tertiary Row Box + Math Counter */}
                            <div 
                              onClick={() => onImageClick(absoluteImages, 2)} // FIX: Explicitly pass index 2
                              className="flex-1 min-h-0 cursor-pointer relative group/img overflow-hidden"
                            >
                              <img src={`${baseAssetUrl}/${imageList[2]}`} alt="Attachment 3" className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.01]" />
                              
                              {imageList.length > 3 ? (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-colors group-hover/img:bg-black/70">
                                  <span className="text-2xl font-montserrat font-black tracking-wide">+{imageList.length - 3}</span>
                                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-0.5">More Photos</span>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomInIcon className="text-white" size={18} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default PostFeed;
