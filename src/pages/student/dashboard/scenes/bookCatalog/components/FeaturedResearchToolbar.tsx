import { useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, Eye, EyeOff } from "lucide-react";

interface FeaturedResearchToolbarProps {
  innerSearch: string;
  setInnerSearch: (val: string) => void;
  keywordSearch: string;
  setKeywordSearch: (val: string) => void;
  selectedProgram: string;
  setSelectedProgram: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  onClearFilters: () => void;
}

const FeaturedResearchToolbar = ({
  innerSearch,
  setInnerSearch,
  keywordSearch,
  setKeywordSearch,
  selectedProgram,
  setSelectedProgram,
  selectedType,
  setSelectedType,
  onClearFilters,
}: FeaturedResearchToolbarProps) => {
  // Component State to completely Hide/Unhide Toolbar options
  const [isBarVisible, setIsBarVisible] = useState(true);

  return (
    <div className="w-full bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-4 font-dm shadow-xs shrink-0 select-none">
      {/* TOOLBAR CONTROLS HEADER BAR */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsBarVisible(!isBarVisible)}
          className="inline-flex items-center gap-2 text-xs font-black font-montserrat uppercase tracking-wider text-gray-500 hover:text-cvsu-green-base transition-colors cursor-pointer"
        >
          {isBarVisible ? (
            <>
              <EyeOff size={14} /> Hide Search Panel
            </>
          ) : (
            <>
              <Eye size={14} /> Show Search Panel
            </>
          )}
        </button>

        {isBarVisible && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw size={13} /> Reset Controls
          </button>
        )}
      </div>

      {/* DETACHABLE CONTENT TOOLBAR DRAWER */}
      {isBarVisible && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
          {/* General Metadata Search Input Field */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all"
            />
          </div>

          {/* DEDICATED MULTIPLE RELEVANCE KEYWORD ENGINE INPUT FIELD */}
          <div className="relative group">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              placeholder="Search index keywords (e.g. IoT, Web)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all font-mono placeholder:font-dm placeholder:italic"
            />
          </div>

          {/* Program Select Options Dropdown Matrix */}
          <div className="text-xs font-medium">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-cvsu-green-base"
            >
              <option value="all">All Programs (CEIT)</option>
              <option value="BSABE">Bachelor of Science in Agricultural and Biosystems Engineering</option>
              <option value="BSARCHI">Bachelor of Science in Architecture</option>
              <option value="BSCE">Bachelor of Science in Civil Engineering</option>
              <option value="BSCpE">Bachelor of Science in Computer Engineering</option>
              <option value="BSCS">Bachelor of Science in Computer Science</option>
              <option value="BSEE">Bachelor of Science in Electrical Engineering</option>
              <option value="BSECE">Bachelor of Science in Electronics Engineering</option>
              <option value="BSIE">Bachelor of Science in Industrial Engineering</option>
              <optgroup label="Bachelor of Science in Industrial Technology Major in:">
                  <option value="BSIndT-AT">Automotive Technology</option>
                  <option value="BSIndT-ET">Electrical Technology</option>
                  <option value="BSIndT-ELEX">Electronics Technology</option>
              </optgroup>
              <option value="BSIT">Bachelor of Science in Information Technology</option>
            </select>
          </div>

          {/* Classification Options Dropdown */}
          <div className="text-xs font-medium">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-cvsu-green-base"
            >
              <option value="all">All Classifications</option>
              <option value="Capstone">Capstone Project</option>
              <option value="Thesis">Thesis Manuscript</option>
              <option value="Design Project">Design Project</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedResearchToolbar;
