/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\student\dashboard\scenes\bookCatalog\components\FeaturedBookModal.tsx
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X, BookOpen, Target, CheckCircle2, XCircle, Hash, Landmark, User2, Loader2, Sparkles } from "lucide-react";
import FeaturedBookToolbar from "./FeaturedBookToolbar";
import type { Book } from "./BookGrid";

interface FeaturedBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Book[];
}

const FeaturedBookModal = ({ isOpen, onClose, items }: FeaturedBookModalProps) => {
  const [innerSearch, setInnerSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // INFINITE SCROLL SYSTEM CONTROLS
  const [visibleCount, setVisibleCount] = useState(6);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const clearAllFilters = () => {
    setInnerSearch("");
    setKeywordSearch("");
    setSelectedCategory("all");
    setVisibleCount(6); // Reset visible batch viewport count
  };

  // MULTIPLE-KEYWORD RELEVANCE SEARCH AND SORT FILTER MATRIX
  const processedItems = useMemo(() => {
    const queryKeywords = keywordSearch
      .toLowerCase()
      .split(/[\s,]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    const isSearchingKeywords = queryKeywords.length > 0;

    return items
      .map((item) => {
        // Base Dropout Constraints Filters
        const matchesText =
          item.title.toLowerCase().includes(innerSearch.toLowerCase()) ||
          (item.authors && item.authors.toLowerCase().includes(innerSearch.toLowerCase())) ||
          (item.publisher && item.publisher.toLowerCase().includes(innerSearch.toLowerCase()));
          
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;

        if (!matchesText || !matchesCategory) return null;

        // Multiple Keyword Hit Relevance Scoring Engine
        let matchCount = 0;
        if (isSearchingKeywords) {
          const searchableBlob = `
            ${item.title || ""} 
            ${item.category || ""} 
            ${item.authors || ""} 
            ${item.publisher || ""}
          `.toLowerCase();

          queryKeywords.forEach((keyword) => {
            if (searchableBlob.includes(keyword)) matchCount++;
          });

          // Discard items with zero matching keyword scores
          if (matchCount === 0) return null;
        }

        return {
          ...item,
          matchCount,
          totalKeywordsSearched: queryKeywords.length,
          isSearchingKeywords,
        };
      })
      .filter((item): item is any => item !== null) // Strip filtered dropouts
      .sort((a, b) => {
        if (isSearchingKeywords) return b.matchCount - a.matchCount; // Sort highest match counts down
        return a.title.localeCompare(b.title); // Alphabetical fallback
      });
  }, [items, innerSearch, keywordSearch, selectedCategory]);

  // VIRTUALIZED INFINITE SCROLL LOADER SUB-ROUTINE
  const loadMoreBooks = useCallback(() => {
    if (visibleCount >= processedItems.length || isInfiniteLoading) return;
    setIsInfiniteLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6); // Load next batch of 6 list rows
      setIsInfiniteLoading(false);
    }, 1200); // Smoother user experience network simulation delay
  }, [visibleCount, processedItems.length, isInfiniteLoading]);

  // Dynamic intersection attachment observer lifecycle hook
  useEffect(() => {
    if (!isOpen) return;
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreBooks();
      },
      { threshold: 0.1, rootMargin: "40px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isOpen, loadMoreBooks]);

  if (!isOpen) return null; //

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-dm select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* MODAL NAVIGATION ACTION BAR HEADER */}
        <header className="p-5 bg-cvsu-green-base text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cvsu-green-base border border-white text-white rounded-xl shadow-inner">
              <BookOpen size={18} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold font-montserrat uppercase tracking-tight text-gray-100">
                CEIT Textbook & Literature Index Explorer
              </h3>
              <p className="text-[11px] text-gray-100/80 font-medium">
                Browse cataloged reference books, journals, and educational materials
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

        {/* MODULAR FILTER TOOLBAR INTEGRATION */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
          <FeaturedBookToolbar
            innerSearch={innerSearch}
            setInnerSearch={setInnerSearch}
            keywordSearch={keywordSearch}
            setKeywordSearch={setKeywordSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* MAPPED HORIZONTAL LIST ROW CONTAINER CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 bg-cvsu-bg/20 space-y-3">
          {processedItems.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-400 italic font-medium bg-white rounded-2xl border border-dashed border-gray-200">
              No matching collection resources found matching your filter selection.
            </div>
          ) : (
            processedItems.slice(0, visibleCount).map((book) => (
              <div 
                key={book.uuid}
                className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative overflow-hidden text-left"
              >
                {/* FLOATING TARGET RELEVANCY ACCURACY BADGE OVERLAY */}
                {book.isSearchingKeywords && (
                  <div className="absolute top-0 right-0 bg-amber-50 text-amber-700 px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border-l border-b border-amber-100 rounded-bl-xl shadow-2xs font-mono z-10 animate-in slide-in-from-top-2">
                    <Target size={12} className="text-amber-500 animate-pulse" />
                    <span>{book.matchCount} / {book.totalKeywordsSearched} Hit(s)</span>
                  </div>
                )}

                {/* LEFT CELL BLOCK: PRIMARY METADATA */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-cvsu-green-base bg-cvsu-bg border border-cvsu-green-base/10 px-2 py-0.5 rounded-md uppercase tracking-wide">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <Hash size={12} /> ISBN: {book.isbn || "N/A"}
                    </span>
                  </div>

                  <h4 className="font-montserrat font-black uppercase text-gray-800 text-sm group-hover:text-cvsu-green-base transition-colors leading-tight truncate pr-6" title={book.title}>
                    {book.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><User2 size={13} className="text-gray-400" /> {book.authors || "Unknown Author"}</span>
                    {book.copyright_year && <span className="text-gray-400">({book.copyright_year})</span>}
                    <span className="flex items-center gap-1 font-mono text-[11px]"><Landmark size={13} className="text-gray-400" /> {book.publisher || "General Pub"}</span>
                  </div>
                </div>

                {/* RIGHT CELL BLOCK: STOCK MATRIX FLAGS STATUS */}
                <div className="shrink-0 flex items-center sm:justify-end border-t sm:border-t-0 border-gray-50 pt-2 sm:pt-0 min-w-28">
                  {book.stock > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50/80 border border-green-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      <CheckCircle2 size={13} /> Available ({book.stock})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50/80 border border-red-100 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      <XCircle size={13} /> Out of Stock
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {/* VIRTUALIZED INFINITE SCROLL TARGET LOG VIEWPOINT EDGE */}
          <div ref={observerTargetRef} className="w-full py-4 flex items-center justify-center text-xs font-semibold text-gray-400 min-h-12">
            {isInfiniteLoading && visibleCount < processedItems.length ? (
              <div className="flex items-center gap-2 bg-cvsu-green-50/60 text-cvsu-green-base px-5 py-2.5 rounded-full border border-cvsu-green-base/10 shadow-xs animate-pulse font-montserrat uppercase font-black text-[10px] tracking-wider">
                <Loader2 size={14} className="animate-spin" />
                <span>Streaming next textbook row segment batch...</span>
              </div>
            ) : visibleCount >= processedItems.length && processedItems.length > 0 ? (
              <div className="flex items-center gap-1 text-gray-300 font-montserrat uppercase text-[10px] font-black tracking-widest bg-gray-50 px-4 py-1.5 rounded-xl border border-gray-100">
                <Sparkles size={12} className="text-amber-400" /> Full Registry End Reached
              </div>
            ) : null}
          </div>
        </div>

        {/* MODAL PANEL DISMISSAL FOOTER BAR */}
        <footer className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold uppercase text-gray-500 transition-colors cursor-pointer shadow-sm active:scale-98"
          >
            Dismiss View
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FeaturedBookModal;
