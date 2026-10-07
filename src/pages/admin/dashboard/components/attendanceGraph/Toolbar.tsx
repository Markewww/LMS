// src\pages\admin\dashboard\components\attendanceGraph\Toolbar.tsx
import { RefreshCcw, Calendar, BookOpen } from "lucide-react";

type Props = {
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  selectedCourse: string;
  setSelectedCourse: (val: string) => void;
  selectedRange: string;
  setSelectedRange: (val: string) => void; 
  onRefresh: () => void;
};

const Toolbar = ({
  selectedYear,
  setSelectedYear,
  selectedCourse,
  setSelectedCourse,
  selectedRange,
  setSelectedRange,
  onRefresh,
}: Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());
  const ranges = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 font-dm select-none">
      <div className="flex flex-wrap items-center gap-3">
        {/* Year Selector */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
          <Calendar size={14} className="text-cvsu-green-base" />
          <span className="text-[10px] font-black uppercase text-gray-400 font-montserrat">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-sm font-bold text-cvsu-green-dark outline-none cursor-pointer font-sans"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
          <BookOpen size={14} className="text-cvsu-green-base" />
          <span className="text-[10px] font-black uppercase text-gray-400 font-montserrat">Program:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-transparent text-sm font-bold text-cvsu-green-dark outline-none cursor-pointer font-sans"
          >
            <option value="">All Programs</option>
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
      </div>

      {/* TIME-RANGE BUTTONS */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="flex bg-gray-100/80 border border-gray-200/50 p-1 rounded-xl gap-1">
          {ranges.map((rangeOption) => {
            const isActive = selectedRange === rangeOption;
            return (
              <button
                key={rangeOption}
                type="button"
                onClick={() => setSelectedRange(rangeOption)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider font-montserrat transition-all cursor-pointer ${
                  isActive
                    ? "bg-cvsu-green-base text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {rangeOption}
              </button>
            );
          })}
        </div>

        <button
          onClick={onRefresh}
          className="p-2.5 bg-cvsu-green-50 text-cvsu-green-base rounded-xl hover:bg-cvsu-green-100 transition-all shadow-sm cursor-pointer"
          title="Update Graph"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
