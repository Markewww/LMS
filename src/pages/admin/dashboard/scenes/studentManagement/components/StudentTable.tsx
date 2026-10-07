import { useState } from "react";
// Icons
import { UsersIcon, CheckCircleIcon, EyeIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
// Components 
import ConfirmationModal from "./alerts/ConfirmationModal";

interface StudentRecord {
  student_id: string;
  first_name: string;
  last_name: string;
  suffix?: string | null;
  course: string;
  account_status: "active" | "pending" | "inactive";
}

type Props = {
  students: StudentRecord[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (student: StudentRecord) => void;
};

const StudentTable = ({ students, onUpdateStatus, onViewDetails }: Props) => {
  // ─── PAGINATION STATE CONFIGURATIONS ───
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [confirmData, setConfirmData] = useState<{ id: string; isOpen: boolean }>({
    id: "",
    isOpen: false,
  });

  // Calculate local page boundary math configurations
  const totalRows = students.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  
  // Slice row array to only map out the targeted active index data chunk
  const paginatedStudents = students.slice(startIndex, endIndex);

  const handleOpenConfirm = (id: string) => {
    setConfirmData({ id, isOpen: true });
  };

  const handleConfirmAction = () => {
    onUpdateStatus(confirmData.id, 'active');
    setConfirmData({ id: "", isOpen: false });
  };

  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      {/* ALERT MODAL */}
      <ConfirmationModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ id: "", isOpen: false })}
        onConfirm={handleConfirmAction}
        title="Approve Student"
        message="Are you sure you want to approve this student's account?"
      />
      
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <UsersIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Student Masterlist</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Student ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4">Program</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {paginatedStudents.map((student) => (
              <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-700">{student.student_id}</td>
                <td className="p-4 text-gray-600">
                  {`${student.last_name}, ${student.first_name} ${student.suffix || ""}`}
                </td>
                <td className="p-4 text-gray-600">{student.course}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    student.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {student.account_status}
                  </span>
                </td>
                <td className="p-4 flex items-center justify-center">
                  {student.account_status === 'pending' ? (
                    <button
                      onClick={() => handleOpenConfirm(student.student_id)}
                      className="text-green-600 hover:scale-110 p-1 transition-transform cursor-pointer"
                      title="Approve Student"
                    >
                      <CheckCircleIcon size={22} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewDetails(student)}
                      className="text-cvsu-green-base hover:scale-110 p-1 transition-transform cursor-pointer"
                      title="View Details"
                    >
                      <EyeIcon size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalRows === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">No records found.</div>
      )}

      {/* ─── DYNAMIC PAGINATION CONTROLS FOOTER BIND ─── */}
      {totalRows > rowsPerPage && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          {/* Range metrics tracking label */}
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-700">{totalRows}</span> records
          </div>

          {/* Interactive Navigation Control Buttons Segment */}
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

            <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cvsu-green-base text-white shadow-xs min-w-24 text-center">
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

export default StudentTable;
