/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { 
  X, FileText, ShieldCheck, UserCheck, 
  ExternalLink, Tag, Edit3Icon, Trash2Icon, AlertTriangleIcon,
  PrinterIcon, DownloadIcon 
} from "lucide-react";
import * as htmlToImage from "html-to-image";
import ResearchLabel from "./ResearchLabel";

interface ResearchProject {
  uuid: string;
  code: string | null;
  title: string;
  type: "Thesis" | "Capstone" | "Design Project";
  program: string | null;
  year: number | null;
  authors: string | null;
  adviser: string | null;
  technical_critic: string | null;
  abstract: string | null;
  keywords: string | null;
  file_path: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  created_at: string;
}

interface ResearchDetailsModalProps {
  research: ResearchProject | null;
  onClose: () => void;
  onApprove: (uuid: string) => void;
  onReject: (uuid: string) => void;
  onOpenEdit: () => void;
  onDelete: (uuid: string) => void;
}

const ResearchDetailsModal = ({ 
  research, onClose, onApprove, onReject, onOpenEdit, onDelete 
}: ResearchDetailsModalProps) => {
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Mirrors the html-to-image engine used in your Book Catalog
  const handleDownloadLabel = async () => {
    const element = document.getElementById("research-label-card");
    if (!element || !research) return;
    try {
      const dataURL = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `LABEL-RESEARCH-${research.code || research.uuid}.png`;
      link.click();
    } catch (error) {
      console.error("Research label download failed:", error);
      alert("Failed to compile label asset canvas.");
    }
  };

  const parseMetadataString = (inputString: string | null): string[] => {
    if (!inputString) return [];
    const trimmed = inputString.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) =>
            typeof item === "object" && item !== null
              ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
              : String(item)
          );
        }
      } catch { /* Fail-soft fallback */ }
    }
    return trimmed.split(",").map(item => item.trim()).filter(Boolean);
  };

  const startHolding = () => {
    if (holdIntervalRef.current || !research) return;
    let currentTick = 0;
    holdIntervalRef.current = setInterval(() => {
      currentTick += 1;
      const progress = Math.min((currentTick / 100) * 100, 100);
      setHoldProgress(progress);
      if (currentTick >= 100) {
        stopHolding();
        setIsDeleteModalOpen(false);
        onDelete(research.uuid);
      }
    }, 30);
  };

  const stopHolding = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  if (!research) return null;

  const authorList = parseMetadataString(research.authors);
  const keywordList = parseMetadataString(research.keywords);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none font-dm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header Modal Row */}
        <div className="p-4 bg-cvsu-green-base text-white font-dm flex justify-between items-center print:hidden">
          <h2 className="font-montserrat font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <FileText size={18} /> Manuscript Administration Review
          </h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform cursor-pointer p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Form Details Grid Layout */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 print:p-0">
          
          {/* Target Layout Export Core Block (Visual Label Anchor Area) */}
          <div className="flex justify-center border-b border-gray-100 pb-6 print:border-0 print:pb-0">
            <ResearchLabel research={research} />
          </div>

          {/* Text Information & Fields Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left print:hidden">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] font-black text-cvsu-green-base bg-cvsu-bg px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  {research.type} View
                </span>
                <h3 className="text-xl font-black text-gray-900 leading-tight font-montserrat mt-1 uppercase">
                  {research.title}
                </h3>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Document Abstract</p>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{research.abstract || "Abstract documentation unavailable for this manuscript entry."}"
                </p>
              </div>
            </div>

            {/* Side Meta column card metadata display */}
            <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-4">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Author Assembly</p>
                <div className="flex flex-wrap gap-1.5">
                  {authorList.map((name, i) => (
                    <span key={i} className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/60">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-200/60 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-amber-500" />
                  <span className="text-gray-400 font-bold uppercase tracking-tight text-[10px]">Adviser:</span>
                  <span className="font-bold text-gray-700">{research.adviser || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-500" />
                  <span className="text-gray-400 font-bold uppercase tracking-tight text-[10px]">Critic:</span>
                  <span className="font-bold text-gray-700">{research.technical_critic || "Unassigned"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Badging View */}
          {keywordList.length > 0 && (
            <div className="text-left print:hidden">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Tag size={11} /> Project Keywords Indices
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordList.map((word, i) => (
                  <span key={i} className="text-[10px] font-bold text-cvsu-green-base bg-cvsu-bg border border-cvsu-green-base/20 px-2.5 py-0.5 rounded-full">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Hosted Source PDF File Handling link */}
          <div className="print:hidden">
            {research.file_path ? (
              <a href={`http://localhost/LMS/${research.file_path}`} target="_blank" rel="noreferrer"
                 className="flex items-center justify-center gap-2 w-full py-3 bg-cvsu-bg border border-cvsu-green-base/20 rounded-xl text-cvsu-green-base font-black uppercase text-xs hover:bg-cvsu-green-50 transition-all shadow-sm cursor-pointer">
                <ExternalLink size={15} /> Inspect Original Document PDF Stream
              </a>
            ) : (
              <div className="text-center py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-400 font-bold italic">
                No embedded digital PDF document attached to this log.
              </div>
            )}
          </div>
        </div>

        {/* System Dashboard Administration Tool Footer Controls */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap justify-center gap-3 print:hidden">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl uppercase hover:bg-gray-100 transition-all cursor-pointer">
            Dismiss
          </button>
          
          <button type="button" onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-red-100 transition-all cursor-pointer">
            <Trash2Icon size={14} /> Delete Record
          </button>

          <button 
            type="button" 
            onClick={onOpenEdit}
            className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 hover:bg-amber-100 transition-all cursor-pointer"
          >
            <Edit3Icon size={14} /> Edit Record
          </button>

          {research.status === 'pending' && (
            <>
              <button 
                onClick={() => onReject(research.uuid)} 
                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-all cursor-pointer"
              >
                Reject
              </button>
              <button 
                onClick={() => onApprove(research.uuid)} 
                className="px-5 py-2.5 bg-cvsu-green-base text-white rounded-xl text-xs font-black uppercase shadow-md hover:bg-cvsu-green-dark transition-all cursor-pointer"
              >
                Approve
              </button>
            </>
          )}

          {/* Label Actions matched to Book Catalog functionality */}
          {research.code && research.code.trim() !== "" && (
            <>
              <button 
                onClick={() => window.print()} 
                className="bg-cvsu-green-base text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-cvsu-green-dark transition-all cursor-pointer shadow-sm shadow-cvsu-green-base/10"
              >
                <PrinterIcon size={14} /> Print Label Sheet
              </button>
              
              <button 
                onClick={handleDownloadLabel} 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-blue-700 transition-all cursor-pointer shadow-sm shadow-blue-600/10"
              >
                <DownloadIcon size={14} /> Download Label PNG
              </button>
            </>
          )}
        </div>
      </div>

      {/* Irreversible Destruction Confirmation Layout Layer */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-dm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-red-100 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full">
              <AlertTriangleIcon size={26} />
            </div>
            <div>
              <h4 className="text-sm font-montserrat font-black uppercase text-gray-800 tracking-wide">Execute Permanent Deletion?</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This is a destructive administrative override. The manuscript file assets and database records will be dropped entirely.
              </p>
            </div>
            <div className="w-full relative">
              <button
                type="button"
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 select-none relative overflow-hidden transition-colors cursor-pointer z-10"
              >
                {holdProgress > 0 ? `Wiping (${Math.ceil((3000 - (holdProgress * 30)) / 1000)}s)...` : "Hold 3s to Confirm Action"}
              </button>
              <div
                style={{ width: `${holdProgress}%` }}
                className="absolute inset-y-0 left-0 bg-red-900 transition-all duration-30 rounded-xl opacity-30 z-0"
              />
            </div>
            <button
              type="button"
              onClick={() => { stopHolding(); setIsDeleteModalOpen(false); }}
              className="w-full text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors cursor-pointer"
            >
              Abort Deletion
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetailsModal;

