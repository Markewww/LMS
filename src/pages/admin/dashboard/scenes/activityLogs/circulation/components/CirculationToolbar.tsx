import { 
  Search, 
  Calendar, 
  ArrowUpDown, 
  X,
  ExternalLink,
  DownloadCloud,
  ChevronDown,
  BookOpen,
  FlaskConical
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/API/APIConfig";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (val: "asc" | "desc") => void;
};

const CirculationToolbar = ({
  searchTerm,
  setSearchTerm,
  selectedDate,
  setSelectedDate,
  sortOrder,
  setSortOrder
}: Props) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openCirculationKiosk = () => {
    const url = "/admin/dashboard/circulation-kiosk"; // Ensure this route exists in your App.tsx
    const windowName = "CirculationKioskWindow";
    const width = window.screen.availWidth;
    const height = window.screen.availHeight;
    const windowFeatures = `width=${width},height=${height},top=0,left=0,popup=yes,menubar=no,toolbar=no,location=no,status=no,resizable=yes`;

    const newWindow = window.open(url, windowName, windowFeatures);
    if (!newWindow) alert("Popup blocked! Please allow popups to open the Kiosk.");
    else newWindow.focus();
  };

  const resetToToday = () => {
    const today = new Date().toLocaleDateString('en-CA');
    setSelectedDate(today);
    setSearchTerm("");
  };

  const handleIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };


  const [showExportMenu, setShowExportMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const exportWrapperRef = useRef<HTMLDivElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  
  const toggleExportMenu = () => {
    if (exportBtnRef.current) {
      const rect = exportBtnRef.current.getBoundingClientRect();
      const menuWidth = 176; // matches w-44
      setMenuPos({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - menuWidth), // right-align under the button
      });
    }
    setShowExportMenu((prev) => !prev);
  };
  
  const handleExport = (type: "books" | "research") => {
    window.open(`${API_BASE_URL}/admin/export_circulation_logs.php?type=${type}`, "_blank");
    setShowExportMenu(false);
  };
  
  // Close the menu when clicking outside, scrolling, or resizing
  useEffect(() => {
    if (!showExportMenu) return;
  
    const handleClickOutside = (e: MouseEvent) => {
      if (exportWrapperRef.current && !exportWrapperRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    const close = () => setShowExportMenu(false);
  
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [showExportMenu]);
  
  return (
    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Search Input - Modified to include Book Title in placeholder */}
        <div className="relative flex-1 max-w-md min-w-37.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Student, ID, or Book Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-cvsu-green-base outline-none transition-all"
          />
        </div>

        {/* Date Picker Trigger */}
        <div 
          onClick={handleIconClick}
          className="relative shrink-0 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent active:scale-95"
        >
          <Calendar className="text-cvsu-green-base" size={18} />
          <span className="text-sm font-bold text-gray-600">
            {selectedDate === new Date().toLocaleDateString('en-CA') ? "Today" : selectedDate}
          </span>
          
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Kiosk Button */}
         <button
          onClick={openCirculationKiosk}
          className="flex items-center gap-2 px-4 py-2 bg-cvsu-green-50 text-cvsu-green-base rounded-xl text-xs font-bold hover:bg-cvsu-green-100 transition-all border border-cvsu-green-100"
        >
          <ExternalLink size={14} />
          Circulation Kiosk
        </button>
        {/* Sort Button */}
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
        >
          <ArrowUpDown size={14} />
          Sort: {sortOrder === "asc" ? "Oldest" : "Newest"}
        </button>

        {/* Excel Export: click to reveal Books / Research */}
        <div ref={exportWrapperRef} className="relative">
          <button
            ref={exportBtnRef}
            type="button"
            onClick={toggleExportMenu}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 group"
          >
            <DownloadCloud size={15} className="group-hover:translate-y-0.5 transition-transform" />
            <span>Excel</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showExportMenu && (
            <div
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-50 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2"
            >
              <button
                type="button"
                onClick={() => handleExport("books")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-cvsu-green-dark hover:bg-cvsu-green-50 transition-colors text-left"
              >
                <BookOpen size={14} />
                Books
              </button>
              <button
                type="button"
                onClick={() => handleExport("research")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-cvsu-green-dark hover:bg-cvsu-green-50 transition-colors text-left border-t border-gray-50"
              >
                <FlaskConical size={14} />
                Research
              </button>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetToToday}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Reset filters"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default CirculationToolbar;