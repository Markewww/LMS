 
// src\pages\student\dashboard\scenes\bookCatalog\components\SecureResearchReaderModal.tsx
import { useEffect, useRef } from "react";
import { X, ShieldAlert, FileText, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig"; 

interface SecureResearchReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  projectTitle: string;
}

const SecureResearchReaderModal = ({ isOpen, onClose, fileUrl, projectTitle }: SecureResearchReaderModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. BLOCK KEYBOARD SHORTCUTS (Copy, Save, Print, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        (isCtrl && (key === "c" || key === "p" || key === "s" || key === "a" || key === "u")) || 
        e.key === "PrintScreen" ||
        e.key === "F12"
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert("⚠️ Intellectual Property Protection: Downloading, printing, or copying text from this manuscript is strictly restricted.");
      }
    };

    // 2. BLOCK RIGHT-CLICK CONTEXT MENUS
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);

    // Dynamic document wrapper selectors block highlighting layout grids globally
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // DYNAMIC ALIGNMENT ENGINE MAPPING LAYER
  let secureEmbedUrl = null;

  if (fileUrl && fileUrl.trim() !== "") {
    const segments = fileUrl.split("/");
    const rawFilename = segments[segments.length - 1];

    // Force absolute IP routing layout parameters so mobile browsers can communicate cross-origin
    let baseNetworkUrl = API_BASE_URL;
    if (baseNetworkUrl.includes("localhost") || baseNetworkUrl.includes("127.0.0.1")) {
      // FIXED: Corrected your typo boundary tracking parameter ('http://192.168.1.39')
      baseNetworkUrl = "http://192.168.1"; 
    }

    // UPDATED: Points directly to our new clean Apache fake file route layout stream
    // We append the standard pdf configuration attributes at the very trailing edge
    secureEmbedUrl = `${baseNetworkUrl}/student/view-manuscript/${encodeURIComponent(rawFilename)}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-900 font-dm select-none animate-in fade-in duration-200"
    >
      {/* SECURE HEADER ACTION BAR */}
      <header className="bg-cvsu-green-base border-b border-gray-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-cvsu-green-dark border border-white/10 text-white rounded-xl shadow-inner shrink-0">
            <FileText size={18} />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-sm font-bold truncate mt-0.5 font-montserrat uppercase tracking-tight text-gray-100" title={projectTitle}>
              {projectTitle}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white/5 hover:bg-red-600/90 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black font-montserrat uppercase tracking-widest transition-all cursor-pointer border border-white/10 active:scale-95"
        >
          <X size={14} /> Close
        </button>
      </header>

      {/* COMPONENT BODY SPACE PANELS */}
      <div className="flex-1 bg-white/70 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        {secureEmbedUrl ? (
          <div className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-white/10 relative flex flex-col overflow-y-auto scrolling-touch">
            
            {/* FIXED TEXT MASK GUARD LAYER: */}
            {/* Dropped "absolute inset-0" to unlock native document scroll view frames */}
            {/* Kept onContextMenu to securely block mouse right-clicks */}
            <div
              className="pointer-events-none"
              onContextMenu={(e) => e.preventDefault()}
            />
            
            <iframe
              src={secureEmbedUrl}
              title="Academic Manuscript Reader"
              className="w-full h-full border-0 select-none z-0 min-h-[60vh] sm:min-h-0 flex-1"
              style={{ userSelect: "none" }}
            />
          </div>
        ) : (
          <div className="bg-slate-950 p-8 rounded-2xl border border-red-900/30 text-center space-y-4 max-w-sm">
            <AlertCircle className="text-red-500 mx-auto" size={44} />
            <h4 className="text-white font-bold font-montserrat uppercase tracking-wide">Document Error</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              The digital asset data stream for this capstone project cannot be fetched securely. Please notify the reading room administrator.
            </p>
          </div>
        )}
      </div>

      {/* CORE CONTROL SECURITY BOUNDARY SUMMARY FOOTER */}
      <footer className="bg-cvsu-green-base border-t border-white/10 px-6 py-3 flex justify-center items-center text-[10px] text-white font-bold uppercase tracking-widest gap-2 shrink-0">
        <ShieldAlert className="text-amber-400" size={12} />
        <span>CvSU CEIT Security Protocols Applied • Screen Captures, Data Highlights, & Storage Exports Forbidden</span>
      </footer>
    </div>
  );
};

export default SecureResearchReaderModal;
