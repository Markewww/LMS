import { SearchIcon } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
};

const StudentToolbar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }: Props) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="relative w-full md:w-96">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          placeholder="Search Student ID or Name..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-cvsu-green-base outline-none text-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        {["all", "active", "pending"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              filterStatus === status ? "bg-cvsu-green-base text-white" : "bg-gray-100 text-cvsu-gray hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentToolbar;
