import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, FileText, Calendar, Users, GraduationCap, Tag, 
  ShieldCheck, FileSearch, ShieldAlert, AlertTriangle 
} from "lucide-react";
import SecureResearchReaderModal from "./SecureResearchReaderModal";
import Ratings from "./Ratings/Ratings"; // Injected custom analytics package mount
import type { ResearchProject } from "./ResearchGrid";

interface ResearchDocumentViewerProps {
  research: ResearchProject;
  onBack: () => void;
}

const ResearchDocumentViewer = ({ research, onBack }: ResearchDocumentViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSecureReaderOpen, setIsSecureReaderOpen] = useState(false);
  
  // Computes a clean root file serving base string out from your API configuration path
  const assetRootUrl = window.location.origin + "/LMS";

  // 1. EXTRACT DATA PROPERTY CHIPS MATRIX FROM DATABASE COLUMNS
  const keywordList = research.keywords
    ? research.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  // FIXED OCR: Cleaned inverted syntax assignment boundaries inside the mapping function
  const authorList = research.authors
    ? research.authors.split(",").map((a) => a.trim()).filter(Boolean)
    : [];

  // 2. SANDBOX SECURITY LAYER LIFECYCLE HOOK
  useEffect(() => {
    // A. BLOCK ANTI-COPY KEYBOARD SHORTCUTS
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // FIXED OCR: Cleared escaped symbols, matching pure native properties cleanly
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

    // B. BLOCK CONTEXT MENUS (RIGHT-CLICK)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);

    // Inject global text selection locks
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      document.body.style.userSelect = "auto";
      document.body.style.webkitUserSelect = "auto";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded-3xl border border-gray-100 shadow-xs font-dm p-6 md:p-8 text-left animate-in fade-in duration-300 select-none"
    >
      {/* NAVIGATION ACTION BREADCRUMB */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black font-montserrat uppercase tracking-wider text-gray-500 hover:text-cvsu-green-base transition-colors cursor-pointer mb-6 group border border-gray-200/80 bg-gray-50/50 px-4 py-2 rounded-xl shadow-2xs"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Explorer Index
      </button>

      {/* PRIMARY DOCUMENT HEADER GRID */}
      <div className="flex flex-col lg:flex-row gap-8 items-start pb-6 border-b border-gray-100">
        <div className="p-4 bg-linear-to-b from-[#0f2042] to-[#071126] border-2 border-[#d4af37]/30 text-[#e5c158] rounded-2xl shadow-md shrink-0 flex flex-col items-center justify-center w-24 h-32 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
          <FileText size={32} className="opacity-80" />
          <span className="text-[8px] font-black uppercase font-mono tracking-widest text-[#d4af37]/70 mt-2">
            {research.type}
          </span>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
              {research.type}
            </span>
            <span className="text-[11px] font-bold text-gray-400 font-mono flex items-center gap-1">
              <Calendar size={13} /> Published: {research.year || "N/A"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-montserrat font-black text-gray-900 leading-snug uppercase tracking-tight">
            {research.title}
          </h2>
          {research.code && (
            <span className="inline-block text-xs font-mono font-bold text-cvsu-green-base bg-cvsu-green-50/80 px-2.5 py-0.5 rounded border border-cvsu-green-base/10 shadow-2xs">
              Registry Reference Code: {research.code}
            </span>
          )}
        </div>
      </div>

      {/* RECEPTACLE BODY INFO TRACK MATRICES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* LEFT TWO-COLUMNS PANEL CONTENT: ABSTRACT & ACCESS ACTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Abstract Statement Card */}
          <div className="space-y-2">
            <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              <FileText size={14} className="text-cvsu-green-base" /> Abstract Statement
            </h4>
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 text-sm text-gray-600 leading-relaxed font-medium italic shadow-inner">
              "{research.abstract || "The abstract detailed summary text data for this academic entry is currently unpopulated inside the archive repository catalog."}"
            </div>
          </div>

          {/* Index Tag Badges Layout */}
          {keywordList.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                <Tag size={14} className="text-cvsu-green-base" /> Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywordList.map((tag, idx) => (
                  <span key={idx} className="text-xs font-bold text-cvsu-green-base bg-cvsu-bg border border-cvsu-green-base/10 px-3 py-1 rounded-xl shadow-2xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC VIEW FULL DOCUMENT OVERLAY TRIGGER ACTION SECTION */}
          <div className="pt-4 border-t border-gray-100 flex flex-col items-start space-y-3">
            <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-cvsu-green-base" /> Manuscript Document Access
            </h4>
            {research.file_path ? (
              <button
                type="button"
                onClick={() => setIsSecureReaderOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl shadow-md text-xs font-black font-montserrat uppercase tracking-widest hover:shadow-lg hover:shadow-cvsu-green-base/10 active:scale-98 transition-all cursor-pointer group"
              >
                <FileSearch size={16} className="group-hover:scale-110 transition-transform" />
                View Full Document Manuscript
              </button>
            ) : (
              <div className="w-full p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <span>Notice: Full text manuscript attachment unavailable. Metadata records & abstract statement only.</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN SIDEBAR PANEL: BIBLIOGRAPHIC METADATA METRICS */}
        <div className="space-y-5 bg-gray-50/30 p-5 rounded-2xl border border-gray-100/60 h-fit">
          {/* Metadata Block A: Authors */}
          <div className="space-y-2">
            <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              <Users size={14} className="text-cvsu-green-base" /> Authors
            </h4>
            <div className="flex flex-col gap-1.5">
              {authorList.length > 0 ? (
                authorList.map((author, index) => (
                  <div key={index} className="bg-white px-3 py-2 rounded-xl border border-gray-100 font-bold text-gray-700 text-xs shadow-2xs">
                    {author}
                  </div>
                ))
              ) : (
                <span className="text-xs font-medium text-gray-400 italic pl-1">Unknown Registry Authors</span>
              )}
            </div>
          </div>

          {/* Metadata Block B: Track Department */}
          <div className="space-y-2 pt-2 border-t border-gray-100/60">
            <h4 className="text-xs font-black font-montserrat uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
              <GraduationCap size={14} className="text-cvsu-green-base" /> Program Department
            </h4>
            <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs font-black font-montserrat text-blue-700 uppercase tracking-wide shadow-2xs">
              {research.program || "General Track (CEIT)"}
            </div>
          </div>

          {/* NEW MODULE OVERLAY INJECTION MOUNT: DYNAMIC RELEVANT STAR RATINGS SHIELD CHART */}
          <Ratings 
            assetId={research.uuid} 
            assetType="research" 
          />

          {/* Security Compliance Seal Overlay Block */}
          <div className="pt-4 border-t border-gray-100/60 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <ShieldCheck size={14} className="text-cvsu-green-base" />
            <span>CvSU Compliance Registry Verified</span>
          </div>
        </div>

      </div>

      {/* OVERLAY SYSTEM MOUNT: SECURE MANUSCRIPT PDF VAULT VIEWPORT */}
      <SecureResearchReaderModal
        isOpen={isSecureReaderOpen}
        onClose={() => setIsSecureReaderOpen(false)}
        fileUrl={research.file_path ? `${assetRootUrl}/${research.file_path}` : null}
        projectTitle={research.title}
      />
    </div>
  );
};

export default ResearchDocumentViewer;
