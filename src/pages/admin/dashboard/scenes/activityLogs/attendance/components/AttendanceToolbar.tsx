import { Search, Calendar, ArrowUpDown, X } from "lucide-react";
import { useRef } from "react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (val: "asc" | "desc") => void;
};

const AttendanceToolbar = ({
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  sortOrder,
  setSortOrder
}: Props) => {
  // Create a ref to the hidden date input
  const dateInputRef = useRef<HTMLInputElement>(null);

  const resetToToday = () => {
    const today = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD reliably
    setSelectedDate(today);
    setSearchTerm("");
  };

  // Function to trigger the native date picker
  const handleIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker(); // Modern browser method
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="flex flex-wrap items-center gap-4 flex-1">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-cvsu-green-base/20 outline-none transition-all"
          />
        </div>

        {/* Custom Date Picker Trigger */}
        <div 
          onClick={handleIconClick}
          className="relative flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent active:scale-95"
        >
          <Calendar className="text-cvsu-green-base" size={18} />
          <span className="text-sm font-bold text-gray-600">
            {selectedDate === new Date().toLocaleDateString('en-CA') ? "Today" : selectedDate}
          </span>
          
          {/* Hidden Native Input */}
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
        >
          <ArrowUpDown size={14} />
          Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
        </button>

        <button
          onClick={resetToToday}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Reset to Today"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default AttendanceToolbar;
