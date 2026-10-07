/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\student\dashboard\scenes\bookCatalog\components\FeaturedResearchModal.tsx
import { useState, useMemo } from "react";
import { X, FileText, Target, ArrowUpRight } from "lucide-react";
import FeaturedResearchToolbar from "./FeaturedResearchToolbar";

interface ResearchItem {
  uuid: string;
  code: string | null;
  title: string;
  type: string;
  program: string | null;
  year: number | null;
  authors: string | null;
  abstract: string | null;
  keywords?: string | null; // Mapped index properties
}

interface FeaturedResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ResearchItem[];
  onSelectStudy: (studyItem: ResearchItem) => void; // Added callback engine for card selections
}

const FeaturedResearchModal = ({ isOpen, onClose, items, onSelectStudy }: FeaturedResearchModalProps) => {
  const [innerSearch, setInnerSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const clearAllFilters = () => {
    setInnerSearch("");
    setKeywordSearch("");
    setSelectedProgram("all");
    setSelectedType("all");
  };

  // MULTIPLE-KEYWORD RELEVANCE SEARCH AND SORT FILTER LOGIC MATRIX (REPAIRED)
  const processedItems = useMemo(() => {
    const queryKeywords = keywordSearch
      .toLowerCase()
      .split(/[\s,]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    const isSearchingKeywords = queryKeywords.length > 0;

    return items
      .map((item) => {
        // Step 1: Base drop filters for basic selection parameters
        const matchSearch =
          item.title.toLowerCase().includes(innerSearch.toLowerCase()) ||
          (item.authors && item.authors.toLowerCase().includes(innerSearch.toLowerCase()));
          
        const matchProgram = selectedProgram === "all" || item.program === selectedProgram;
        const matchType = selectedType === "all" || item.type === selectedType;

        if (!matchSearch || !matchProgram || !matchType) {
          return null; 
        }

        // Step 2: Compute relevance ranking matching weights
        let matchCount = 0;
        if (isSearchingKeywords) {
          const searchableBlob = `
            ${item.title || ""} 
            ${item.abstract || ""} 
            ${item.keywords || ""}
          `.toLowerCase();

          queryKeywords.forEach((keyword) => {
            if (searchableBlob.includes(keyword)) {
              matchCount++;
            }
          });

          // Discard items with zero matching keywords
          if (matchCount === 0) return null;
        }

        return { 
          ...item, 
          matchCount, 
          totalKeywordsSearched: queryKeywords.length,
          isSearchingKeywords
        };
      })
      .filter((item): item is any => item !== null) 
      .sort((a, b) => {
        if (isSearchingKeywords) {
          return b.matchCount - a.matchCount; // Sort from highest keyword hits to lowest
        }
        return (b.year || 0) - (a.year || 0); // Fallback to year
      });
  }, [items, innerSearch, keywordSearch, selectedProgram, selectedType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-dm select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* MODAL ACTION BAR HEADER */}
        <header className="p-5 bg-cvsu-green-base text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cvsu-green-base border border-white text-white rounded-xl shadow-inner">
              <FileText size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold font-montserrat uppercase tracking-tight text-gray-100">
                CEIT Research & Capstone Index Explorer
              </h3>
              <p className="text-[11px] text-gray-100/80 font-medium">
                Browse approved student theses, capstones, and design projects
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </header>

        {/* EXTERNAL DETACHED RELOCATED INTERACTIVE TOOLBAR HOOK */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <FeaturedResearchToolbar
            innerSearch={innerSearch}
            setInnerSearch={setInnerSearch}
            keywordSearch={keywordSearch}
            setKeywordSearch={setKeywordSearch}
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* DATA CONTAINER MAPPED GRID ROWS */}
        <div className="flex-1 overflow-y-auto p-6 bg-cvsu-bg/20">
          {processedItems.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400 italic font-medium">
              No matching archive logs found in this track sector.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {processedItems.map((item) => (
                <div 
                  key={item.uuid}
                  // TRIGGER ONCLICK TRANSACTION HOOK FOR FULL RENDERS
                  onClick={() => onSelectStudy(item)}
                  className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer"
                >
                  {/* FLOATING TARGET RELEVANCY BADGE OVERLAY */}
                  {item.isSearchingKeywords && (
                    <div className="absolute top-0 right-0 bg-amber-50 text-amber-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border-l border-b border-amber-100 rounded-bl-xl shadow-2xs font-mono">
                      <Target size={12} className="text-amber-500 animate-pulse" />
                      <span>{item.matchCount} / {item.totalKeywordsSearched} Hit(s)</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 font-mono">
                      <span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase">
                        {item.type}
                      </span>
                      <span className={item.isSearchingKeywords ? "mr-20" : ""}>{item.year || "N/A"}</span>
                    </div>
                    
                    {/* Add hover styling to indicate the card can open full profiles */}
                    <h4 className="font-montserrat font-black uppercase text-gray-800 text-sm group-hover:text-cvsu-green-base transition-colors line-clamp-2 pr-6 flex items-start gap-1 justify-between">
                      <span>{item.title}</span>
                      <ArrowUpRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-cvsu-green-base transition-all shrink-0 mt-0.5" />
                    </h4>
                    
                    <p className="text-xs text-gray-400 line-clamp-2 italic leading-relaxed">
                      "{item.abstract || "Abstract documentation summary is currently unpopulated."}"
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center mt-4 text-[11px] font-bold">
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase font-mono">
                      {item.program || "General"}
                    </span>
                    <span className="text-gray-400 truncate max-w-44">
                      {item.authors || "Unknown Authors"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedResearchModal;
