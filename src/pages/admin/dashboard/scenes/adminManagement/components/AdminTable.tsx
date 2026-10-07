import { useState } from "react";
import { EyeIcon, ShieldCheckIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface AdminRecord {
  user_id: string | number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  email: string;
  account_status?: "active" | "inactive" | null;
}

type Props = {
  admins: AdminRecord[]; // Typed explicit record schemas instead of dynamic 'any[]' overrides
  setSelectedAdmin: (admin: AdminRecord) => void;
};

const AdminTable = ({ admins, setSelectedAdmin }: Props) => {
  // ─── PAGINATION CONTROLS STATE CONFIGURATION ───
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Max limits per single window view page index

  // Calculate local math pointers 
  const totalRows = admins.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  
  // Splice target dataset block chunk based strictly on the current row window indicators
  const paginatedAdmins = admins.slice(startIndex, endIndex);

  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      {/* HEADER - Matches StudentTable style */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <ShieldCheckIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">
          Administrators
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Employee ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">Status</th> 
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {paginatedAdmins.map((admin) => (
              <tr key={admin.user_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-700">{admin.user_id}</td>
                <td className="p-4 text-gray-600">
                  {`${admin.last_name}, ${admin.first_name} ${admin.middle_name || ""} ${admin.suffix || ""}`}
                </td>
                <td className="p-4 text-gray-600">{admin.email}</td>
                
                {/* STATUS BADGE - Styled like StudentTable */}
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    admin.account_status === 'inactive'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {admin.account_status || 'active'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setSelectedAdmin(admin)}
                      className="text-cvsu-green-base hover:scale-110 p-1 transition-transform cursor-pointer"
                      title="View Details"
                    >
                      <EyeIcon size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE - Matches StudentTable style */}
      {totalRows === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">
          No administrator records found.
        </div>
      )}

      {/* ─── CONTROLS FOOTER PANEL (ACTIVE ONLY WHEN ENTRIES EXCEED 10 ROWS) ─── */}
      {totalRows > rowsPerPage && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          {/* Tracker Metrics Indicator String */}
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-700">{totalRows}</span> records
          </div>

          {/* Sizing Controller Action Handles Group */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
              title="First Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cvsu-green-base text-white shadow-x-24 text-center">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
