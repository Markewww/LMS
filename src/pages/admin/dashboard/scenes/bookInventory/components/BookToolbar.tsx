import React from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';

interface BookToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

const BookToolbar: React.FC<BookToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
}) => {
  // Categories matching your library inventory needs
  const categories = [
    "General Reference",
    "Filipiniana",
    "Fiction",
    "Science & Technology",
    "Mathematics",
    "History",
    "Professional Education",
    "Language & Literature"
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* Search Input Group */}
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Category Filter Group */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <select
            className="block w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {/* Custom Chevron for Select */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <BookOpen className="h-4 w-4 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookToolbar;
