// src\pages\admin\dashboard\components\MobileStudentView\Toolbar.tsx
import { SearchIcon, XIcon, ArrowDownAZIcon, ArrowUpAZIcon } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  sortAsc: boolean;
  onToggleSort: () => void;
  resultCount: number;
};

const Toolbar = ({ search, onSearchChange, sortAsc, onToggleSort, resultCount }: Props) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* SEARCH */}
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cvsu-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, ID, program, code..."
            className="w-full pl-9 pr-9 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all text-sm font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cvsu-gray hover:text-cvsu-green-base cursor-pointer"
              title="Clear search"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>

        {/* SORT BY LAST NAME */}
        <button
          type="button"
          onClick={onToggleSort}
          title={sortAsc ? "Sorted by last name A–Z" : "Sorted by last name Z–A"}
          className="shrink-0 flex items-center gap-1.5 px-3 py-3 bg-white border border-gray-200 rounded-xl text-cvsu-green-base text-xs font-black uppercase tracking-wider hover:bg-cvsu-green-50 transition-all cursor-pointer"
        >
          {sortAsc ? <ArrowDownAZIcon size={18} /> : <ArrowUpAZIcon size={18} />}
          {sortAsc ? "A–Z" : "Z–A"}
        </button>
      </div>

      <p className="text-[11px] text-cvsu-gray font-medium px-1">
        {resultCount} {resultCount === 1 ? "student" : "students"} · sorted by last name
      </p>
    </div>
  );
};

export default Toolbar;