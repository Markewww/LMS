import { useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, Eye, EyeOff } from "lucide-react";

interface FeaturedBookToolbarProps {
  innerSearch: string;
  setInnerSearch: (val: string) => void;
  keywordSearch: string;
  setKeywordSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  onClearFilters: () => void;
}

const FeaturedBookToolbar = ({
  innerSearch,
  setInnerSearch,
  keywordSearch,
  setKeywordSearch,
  selectedCategory,
  setSelectedCategory,
  onClearFilters,
}: FeaturedBookToolbarProps) => {
  const [isBarVisible, setIsBarVisible] = useState(true);

  return (
    <div className="w-full bg-gray-50 border border-gray-200/80 p-4 rounded-2xl space-y-4 font-dm shadow-xs shrink-0 select-none">
      {/* HEADER CONTROLS ACTIONS BAR */}
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

      {/* FILTER DRAWER EXPANSION MODULE */}
      {isBarVisible && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-200">
          {/* Metadata Text Field Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={innerSearch}
              onChange={(e) => setInnerSearch(e.target.value)}
              placeholder="Search title, author, or publisher..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all"
            />
          </div>

          {/* Dedicated Relevance Keyword Parameter Tokenizer Input */}
          <div className="relative group">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              placeholder="Search keywords (e.g. Java, Circuit)..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all font-mono placeholder:font-dm placeholder:italic"
            />
          </div>

          {/* Classification Category Dropdown Mapping */}
          <div className="text-xs font-medium">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-cvsu-green-base"
            >
              <option value="all">All Classifications</option>
              <option value="book">Textbook</option>
              <option value="magazine">Magazine</option>
              <option value="journal">Academic Journal</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedBookToolbar;
