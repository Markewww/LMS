import { SearchIcon } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
};

const ResearchToolbar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }: Props) => {
  // Statuses specific to Research Approval
  const statuses = ["all", "pending", "approved", "rejected"];

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* SEARCH BAR */}
      <div className="relative w-full md:w-96">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          placeholder="Search Title" 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-cvsu-green-base outline-none text-sm font-dm transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              filterStatus === status 
                ? "bg-cvsu-green-base text-white shadow-cvsu-green-base/20" 
                : "bg-gray-100 text-cvsu-gray hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResearchToolbar;
