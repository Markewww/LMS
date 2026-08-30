import { useEffect, useState, useRef } from "react";
import { X, FileText, Users, ShieldCheck, UserCheck, ExternalLink, Tag, Edit3Icon, Trash2Icon, AlertTriangleIcon } from "lucide-react";

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

const ResearchDetailsModal = ({ research, onClose, onApprove, onReject, onOpenEdit, onDelete }: ResearchDetailsModalProps) => {
  // ─── 1. ALL HOOKS PLACED STRICTLY AT THE TOP ───
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); 
  
  // Platform-agnostic interval reference handle
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Unified cleanup effect (Only ONE copy exists now)
  useEffect(() => {
    return () => { 
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  // ─── 2. HELPER METADATA PARSER FUNCTION ───
  const parseMetadataString = (inputString: string | null): string[] => {
    if (!inputString) return [];
    const trimmed = inputString.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: unknown) =>
            typeof item === "object" && item !== null
              ? `${(item as Record<string, string>).first_name || ""} ${(item as Record<string, string>).last_name || ""}`.trim() 
              : String(item)
          );
        }
      } catch (error) {
        console.warn("Failed parsing JSON metadata collection array string:", error);
      }
    }
    return trimmed.split(",").map(item => item.trim()).filter(Boolean);
  };

  // ─── 3. HOLD TO DELETE TICK-BASED WORKER ───
  const startHolding = () => {
    if (holdIntervalRef.current || !research) return;
    let currentTick = 0;
    const totalTicksNeeded = 100; // 100 ticks * 30ms = 3000ms (3s)

    holdIntervalRef.current = setInterval(() => {
      currentTick += 1;
      const progressPercentage = Math.min((currentTick / totalTicksNeeded) * 100, 100);
      setHoldProgress(progressPercentage);

      if (currentTick >= totalTicksNeeded) {
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

  // ─── 4. SAFE CONDITIONAL GUARD PLACED AFTER ALL HOOKS EXECUTIONS ───
  if (!research) return null;

  const authorList = parseMetadataString(research.authors);
  const keywordList = parseMetadataString(research.keywords);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-cvsu-green-base text-white font-dm">
          <h2 className="font-montserrat font-black uppercase tracking-tight flex items-center gap-2">
            <FileText size={20} /> Research Review
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer">
            <X />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 font-dm">
          {/* Title & Status */}
          <div className="text-left">
            <span className="text-[10px] font-black text-cvsu-green-base bg-cvsu-bg px-2 py-1 rounded uppercase mb-2 inline-block">
              {research.type} {research.year ? `(${research.year})` : ""}
            </span>
            <h3 className="text-xl font-bold text-gray-900 leading-tight font-montserrat">
              {research.title}
            </h3>
            {research.code && (
              <span className="text-xs font-bold text-cvsu-green-base block mt-1 uppercase tracking-wider bg-cvsu-bg/40 px-2 py-1 rounded w-max">
                Code: {research.code}
              </span>
            )}
          </div>

          {/* Abstract & Keywords */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 text-left">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Abstract</p>
              <p className="text-sm text-gray-600 leading-relaxed italic">"{research.abstract || "No abstract text provided."}"</p>
            </div>
            {keywordList.length > 0 && (
              <div className="pt-3 border-t border-gray-200/50">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Tag size={10} /> Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywordList.map((word, i) => (
                    <span key={i} className="text-[10px] font-bold text-cvsu-green-base bg-cvsu-bg border border-cvsu-green-base/10 px-2 py-0.5 rounded">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6 text-left">
            {/* Authors */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Users size={14} /> Authors
              </p>
              <div className="flex flex-wrap gap-2">
                {authorList.map((name, i) => (
                  <span key={i} className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Panels */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <UserCheck size={16} className="text-amber-500" />
                <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Adviser:</span>
                <span className="font-bold text-gray-800">{research.adviser || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-purple-500" />
                <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Critic:</span>
                <span className="font-bold text-gray-800">{research.technical_critic || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          {research.file_path ? (
            <a href={`http://localhost/LMS/${research.file_path}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-cvsu-bg border border-cvsu-green-base/20 rounded-xl text-cvsu-green-base font-black uppercase text-xs hover:bg-cvsu-green-50 transition-all shadow-sm cursor-pointer">
              <ExternalLink size={16} /> Open Full PDF Document
            </a>
          ) : (
            <div className="text-center py-3 bg-gray-50 border rounded-xl text-xs text-gray-400 font-bold italic">
              Digital PDF copy not uploaded for this legacy record.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap sm:flex-nowrap gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-xs font-bold text-gray-500 uppercase hover:text-gray-700 cursor-pointer border rounded-xl bg-white border-gray-200">
            Close
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-red-100 transition-all cursor-pointer"
          >
            <Trash2Icon size={14} /> Delete Record
          </button>

          <button type="button" onClick={onOpenEdit} className="flex-1 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-amber-100 transition-all cursor-pointer">
            <Edit3Icon size={14} /> Modify Details
          </button>

          {research.status === 'pending' && (
            <>
              <button onClick={() => onReject(research.uuid)} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-100 transition-colors border border-red-100 cursor-pointer">Reject</button>
              <button onClick={() => onApprove(research.uuid)} className="flex-1 bg-cvsu-green-base text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-cvsu-green-base/20 hover:bg-cvsu-green-dark transition-all active:scale-95 cursor-pointer">Approve Submission</button>
            </>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-dm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-red-100 flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-full animate-bounce">
              <AlertTriangleIcon size={28} />
            </div>
            <div>
              <h4 className="text-base font-montserrat font-black uppercase text-gray-800 tracking-wide">Confirm Deletion</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This action is irreversible. It will wipe this manuscript record and remove its hosted file systems permanently.
              </p>
            </div>

            <div className="w-full relative mt-2">
              <button
                type="button"
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-colors bg-red-600 hover:bg-red-700 select-none relative overflow-hidden active:scale-98 cursor-pointer z-10"
              >
                {holdProgress > 0 ? `Holding (${Math.ceil((3000 - (holdProgress * 30)) / 1000)}s)...` : "Press & Hold for 3s to Delete"}
              </button>

              <div
                style={{ width: `${holdProgress}%` }}
                className="absolute inset-y-0 left-0 bg-red-800 transition-all duration-30 rounded-xl opacity-40 z-0 pointer-events-none"
              />
            </div>

            <button
              type="button"
              onClick={() => { stopHolding(); setIsDeleteModalOpen(false); }}
              className="w-full text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 py-1 transition-colors cursor-pointer"
            >
              Cancel, Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchDetailsModal;

