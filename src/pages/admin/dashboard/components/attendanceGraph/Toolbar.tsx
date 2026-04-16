import { RefreshCcw, Calendar, BookOpen } from "lucide-react";

type Props = {
  selectedYear: string;
  setSelectedYear: (val: string) => void;
  selectedCourse: string;
  setSelectedCourse: (val: string) => void;
  onRefresh: () => void;
};

const Toolbar = ({ selectedYear, setSelectedYear, selectedCourse, setSelectedCourse, onRefresh }: Props) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Year Selector */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
          <Calendar size={14} className="text-cvsu-green-base" />
          <span className="text-[10px] font-black uppercase text-gray-400">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-sm font-bold text-cvsu-green-dark outline-none cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
          <BookOpen size={14} className="text-cvsu-green-base" />
          <span className="text-[10px] font-black uppercase text-gray-400">Program:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-transparent text-sm font-bold text-cvsu-green-dark outline-none cursor-pointer"
          >
            <option value="">All Programs</option>
            <option value="BSABE">BSABE</option>
            <option value="BSARCHI">BSARCHI</option>
            <option value="BSCE">BSCE</option>
            <option value="BSCpE">BSCpE</option>
            <option value="BSCS">BSCS</option>
            <option value="BSEE">BSEE</option>
            <option value="BSECE">BSECE</option>
            <option value="BSIE">BSIE</option>
            <option value="BSIT-AT">BSIT-AT</option>
            <option value="BSIT-ET">BSIT-ET</option>
            <option value="BSIT-ELEX">BSIT-ELEX</option>
            <option value="BSIT">BSIT</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="p-2 bg-cvsu-green-50 text-cvsu-green-base rounded-xl hover:bg-cvsu-green-100 transition-all shadow-sm"
          title="Update Graph"
        >
          <RefreshCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
