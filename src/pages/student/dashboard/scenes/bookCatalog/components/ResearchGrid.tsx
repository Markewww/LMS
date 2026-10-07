 
// src\pages\student\dashboard\scenes\bookCatalog\components\ResearchGrid.tsx
import { FileTextIcon, CalendarIcon, UsersIcon, ArrowUpRight } from "lucide-react";

export interface ResearchProject {
  uuid: string;
  code: string | null;
  title: string;
  type: "Thesis" | "Capstone" | "Design Project";
  program: string | null;
  year: number | null;
  authors: string | null;
  abstract: string | null;
  keywords: string | null;
  file_path: string | null;
}

interface ResearchGridProps {
  items: ResearchProject[];
  onSelectStudy: (studyItem: ResearchProject) => void;
}

const ResearchGrid = ({ items, onSelectStudy }: ResearchGridProps) => {
  const splitTags = (input: string | null) => {
    if (!input) return [];
    return input.split(",").map((i) => i.trim()).filter(Boolean);
  };

  if (items.length === 0) {
    return (
      <div className="p-16 text-center text-sm text-gray-400 font-dm italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 w-full">
        No research papers or manuscripts found matching your search term.
      </div>
    );
  }

  const limitedItems = items.slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-dm text-left w-full select-none">
      {limitedItems.map((res) => {
        const authorList = splitTags(res.authors);

        const handleViewClick = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation(); // Safe scope containment mapping loop
          if (typeof onSelectStudy === "function") {
            onSelectStudy(res);
          }
        };

        return (
          <div
            key={res.uuid}
            className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
          >
            {/* Top Layout Content Row Splitter */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              {/* HARDBOUND PREMIUM MANUSCRIPT THUMBNAIL COVER FEATURE */}
              <div className="w-full sm:w-32.5 aspect-3/4 rounded-xl shrink-0 relative overflow-hidden bg-linear-to-b from-[#0f2042] to-[#071126] border-2 border-[#d4af37]/40 p-3 flex flex-col justify-between text-center shadow-md shadow-blue-950/20 group-hover:scale-[1.01] transition-transform">
                <div className="absolute inset-y-0 left-0 w-2 bg-linear-to-r from-black/40 via-transparent to-transparent pointer-events-none z-10" />
                <div className="absolute inset-1.5 border border-[#d4af37]/20 rounded-lg pointer-events-none z-10" />
                
                <div className="z-10">
                  <span className="text-[7px] text-[#d4af37] font-black uppercase tracking-widest border border-[#d4af37]/30 px-1.5 py-0.5 rounded-sm bg-black/10">
                    {res.type}
                  </span>
                </div>

                <div className="z-10 px-0.5 max-h-16 overflow-hidden flex items-center justify-center">
                  <h4 className="text-[9px] font-bold font-montserrat tracking-wide text-[#e5c158] leading-tight line-clamp-4 uppercase select-none drop-shadow-xs">
                    {res.title}
                  </h4>
                </div>

                <div className="z-10 border-t border-[#d4af37]/20 pt-1 flex items-center justify-between text-[7px] text-[#d4af37]/80 font-bold uppercase tracking-tight">
                  <span className="truncate max-w-12.5">{res.program || "CEIT"}</span>
                  <span>{res.year || "N/A"}</span>
                </div>
              </div>

              {/* METADATA TEXT DESCRIPTIONS COLUMN */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {res.type}
                  </span>
                  {res.year && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 font-mono">
                      <CalendarIcon size={12} /> {res.year}
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 leading-snug text-base mb-1 line-clamp-2" title={res.title}>
                    {res.title}
                  </h3>
                  {res.code && (
                    <span className="text-[11px] font-mono font-bold text-cvsu-green-base bg-cvsu-bg/60 px-2 py-0.5 rounded">
                      Code: {res.code}
                    </span>
                  )}
                </div>

                {/* Authors Chip Grid */}
                {authorList.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-gray-500 pt-0.5 pb-1">
                    <UsersIcon size={14} className="shrink-0 mt-0.5 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {authorList.map((author, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[11px] border font-medium">
                          {author}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* DEDICATED ACTION BUTTON PLACED UNDER THE AUTHORS SECTION CHIPS LIST */}
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={handleViewClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group/btn"
                  >
                    <span>View Study Details</span>
                    <ArrowUpRight size={13} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-3 border-t border-gray-50 flex justify-between items-center mt-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {res.program || "General Track"}
              </span>
              {res.file_path ? (
                <div className="flex items-center gap-1 text-xs font-bold text-cvsu-green-base bg-cvsu-bg px-2.5 py-1 rounded-lg border border-cvsu-green-base/5">
                  <FileTextIcon size={13} /> Manuscript Attached
                </div>
              ) : (
                <span className="text-[10px] text-gray-400 font-medium italic">
                  Abstract Documentation Only
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResearchGrid;
