import { SearchIcon, FilterIcon, CalendarIcon, BookOpenIcon, HashIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
};

const BookToolbar = ({ searchTerm, setSearchTerm, filters, setFilters }: Props) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 space-y-4 transition-all">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        
        {/* 1. SEARCH BAR */}
        <div className="relative w-full lg:w-1/3">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            placeholder="Search Title, Author, or ISBN..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-cvsu-green-base outline-none text-sm transition-all font-dm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 2. QUICK FILTERS & TOGGLE */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Item Type Selector */}
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="flex-1 lg:flex-none px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-cvsu-green-dark outline-none focus:border-cvsu-green-base transition-all"
          >
            <option value="all">All Types</option>
            <option value="book">Books</option>
            <option value="magazine">Magazines</option>
            <option value="journal">Journals</option>
          </select>

          {/* Advanced Filter Toggle */}
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
              showAdvanced ? "bg-cvsu-green-base text-white border-cvsu-green-base" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <FilterIcon size={16} />
            {showAdvanced ? "Hide Filters" : "More Filters"}
          </button>
        </div>
      </div>

      {/* 3. ADVANCED FILTER PANEL */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
          
          {/* Genre/Category */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Genre / Category</label>
            <div className="relative">
              <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select 
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-cvsu-green-base"
              >
                <option value="all">All Genres</option>
                <option value="fiction">Fiction</option>
                <option value="science">Science & Tech</option>
                <option value="history">History</option>
                <option value="reference">Reference</option>
              </select>
            </div>
          </div>

          {/* Publication Year Range */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Pub. Year</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select 
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-cvsu-green-base"
              >
                <option value="all">Any Year</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2020-2022">2020 - 2022</option>
                <option value="old">Pre-2020</option>
              </select>
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Availability</label>
            <div className="relative">
              <HashIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-cvsu-green-base"
              >
                <option value="all">All Status</option>
                <option value="available">✅ Available</option>
                <option value="borrowed">❌ Borrowed</option>
                <option value="reserved">⏳ Reserved</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ type: 'all', genre: 'all', year: 'all', status: 'all' })}
              className="w-full py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookToolbar;
