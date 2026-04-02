import { 
  Search, 
  Calendar, 
  ArrowUpDown, 
  X, 
  ExternalLink } from "lucide-react";
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
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Function to open a new dedicated page for the QR code scanner
  const openAttendanceKiosk = () => {
    const url = "/admin/dashboard/attendance-kiosk";
    const windowName = "AttendanceKioskWindow";

    const width = window.screen.availWidth;
    const height = window.screen.availHeight;

    const windowFeatures = `width=${width},height=${height},top=0,left=0,popup=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes`;

    const newWindow = window.open(url, windowName, windowFeatures);
    if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
      // Handle case where window failed to open
      alert("Popup blocked! Please allow popups for this site to open the Kiosk.");
    } else {
      newWindow.focus();
    }
  };

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
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-cvsu-green-base outline-none transition-all"
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
          onClick={openAttendanceKiosk}
          className="flex items-center gap-2 px-4 py-2 bg-cvsu-green-50 text-cvsu-green-base rounded-xl text-xs font-bold hover:bg-cvsu-green-100 transition-all border border-cvsu-green-100"
          title="Open Kiosk View"
        >
          <ExternalLink size={14} />
          Kiosk Mode
        </button>
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
