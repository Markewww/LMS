import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { UserIcon, ZoomInIcon, MessageSquareIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import { localPostBackgrounds } from "./PostBgLocal";
import StudentImageLightbox from "./StudentImageLightbox";

interface Announcement {
  id: number;
  adminId: string;
  adminName: string;
  text: string;
  imagePath: string | null;
  bgId?: string;
  createdAt: string;
}

const AnnouncementFeed = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(false);
  
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const baseAssetUrl = API_BASE_URL.replace("/src/API", "");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/admin/announcements.php`);
        if (Array.isArray(response.data)) {
          setAnnouncements(response.data);
        }
      } catch (error) {
        console.error("Failed loading announcements list:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < announcements.length) {
        setVisibleCount((prev) => prev + 5);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, visibleCount, announcements.length]);

  const handleImageClick = (e: React.MouseEvent, fullUrls: string[], clickedIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxImages(fullUrls);
    setLightboxIndex(clickedIdx);
  };

  const visibleItems = announcements.slice(0, visibleCount);

  if (announcements.length === 0 && !loading) {
    return <p className="text-center text-xs text-gray-400 italic py-6">No recent campus updates or announcements posted.</p>;
  }

  return (
    <div className="space-y-5 font-dm">
      <h3 className="text-xs font-montserrat font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-2 border-gray-100">
        <MessageSquareIcon size={14} /> Campus Updates & Announcements
      </h3>

      {visibleItems.map((post, index) => {
        const matchedBg = localPostBackgrounds.find((bg) => bg.id === post.bgId) || { id: "none", className: "" };
        const isCustomBg = matchedBg.id !== "none";

        const imageList = post.imagePath 
          ? post.imagePath.split(",").map(path => path.trim()).filter(Boolean)
          : [];

        const absoluteImages = imageList.map(src => `${baseAssetUrl}/${src}`);
        const isLastElement = visibleItems.length === index + 1;

        return (
          <div
            key={post.id}
            ref={isLastElement ? lastElementRef : null}
            className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm text-left animate-in fade-in duration-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-cvsu-bg text-cvsu-green-base shrink-0">
                <UserIcon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 leading-tight">{post.adminName}</h4>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
                  {new Date(post.createdAt).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Content */}
            {isCustomBg && imageList.length === 0 ? (
              <div className={`rounded-2xl overflow-hidden aspect-[4/5] w-full max-w-md mx-auto flex items-center justify-center text-center p-8 shadow-inner ${matchedBg.className}`}>
                <p className="text-xl md:text-2xl font-black whitespace-pre-wrap leading-snug tracking-wide drop-shadow-xs">
                  {post.text}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed mb-4">
                {post.text}
              </p>
            )}

            {/* Collage Grid */}
            {imageList.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 aspect-[4/5] w-full max-w-md mx-auto bg-gray-50 relative mb-2">
                {imageList.length === 1 && (
                  <div onClick={(e) => handleImageClick(e, absoluteImages, 0)} className="w-full h-full block relative group/img cursor-pointer">
                    <img src={absoluteImages[0]} alt="Attachment" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomInIcon className="text-white" size={24} />
                    </div>
                  </div>
                )}

                {imageList.length === 2 && (
                  <div className="flex flex-col h-full w-full gap-1">
                    {absoluteImages.map((imgUrl, idx) => (
                      <div key={idx} onClick={(e) => handleImageClick(e, absoluteImages, idx)} className="flex-1 min-h-0 relative group/img overflow-hidden cursor-pointer">
                        <img src={imgUrl} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomInIcon className="text-white" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imageList.length >= 3 && (
                  <div className="grid grid-cols-2 h-full w-full gap-1">
                    <div onClick={(e) => handleImageClick(e, absoluteImages, 0)} className="h-full w-full relative group/img overflow-hidden cursor-pointer">
                      <img src={absoluteImages[0]} alt="Attachment 1" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomInIcon className="text-white" size={22} />
                      </div>
                    </div>
                    <div className="flex flex-col h-full w-full gap-1">
                      <div onClick={(e) => handleImageClick(e, absoluteImages, 1)} className="flex-1 min-h-0 relative group/img overflow-hidden cursor-pointer">
                        <img src={absoluteImages[1]} alt="Attachment 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomInIcon className="text-white" size={18} />
                        </div>
                      </div>
                      <div onClick={(e) => handleImageClick(e, absoluteImages, 2)} className="flex-1 min-h-0 relative group/img overflow-hidden cursor-pointer">
                        <img src={absoluteImages[2]} alt="Attachment 3" className="w-full h-full object-cover" />
                        {imageList.length > 3 ? (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                            <span className="text-xl font-black">+{imageList.length - 3}</span>
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">More Photos</span>
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
        );
      })}

      {loading && (
        <div className="p-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading updates...
        </div>
      )}

      <StudentImageLightbox
        images={lightboxImages}
        activeIndex={lightboxIndex}
        setActiveIndex={setLightboxIndex}
        onClose={() => setLightboxIndex(-1)}
      />
    </div>
  );
};

export default AnnouncementFeed;
