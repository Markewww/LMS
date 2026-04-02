import { SearchIcon } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void; 
};

const AdminToolbar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }: Props) => {
  const getBtnClass = (status: string) => 
    `px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border ${
      filterStatus === status 
        ? "bg-cvsu-green-base text-white border-cvsu-green-base shadow-sm" 
        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      
      {/* SEARCH BAR */}
      <div className="relative w-full md:w-96">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          placeholder="Search Admin Name or ID..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-cvsu-green-base outline-none transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTER BUTTONS (Matches StudentToolbar style) */}
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <button 
          onClick={() => setFilterStatus("all")} 
          className={getBtnClass("all")}
        >
          All
        </button>
        <button 
          onClick={() => setFilterStatus("active")} 
          className={getBtnClass("active")}
        >
          Active
        </button>
        <button 
          onClick={() => setFilterStatus("suspended")} 
          className={getBtnClass("suspended")}
        >
          Suspended
        </button>
      </div>
    </div>
  );
};

export default AdminToolbar;
