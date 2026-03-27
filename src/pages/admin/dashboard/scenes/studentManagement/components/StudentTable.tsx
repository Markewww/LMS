import { useState } from "react";

// Icons
import { UsersIcon, CheckCircleIcon, EyeIcon } from "lucide-react";

// Components 
import ConfirmationModal from "./alerts/ConfirmationModal";

type Props = {
  students: any[];
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (student: any) => void;
};

const StudentTable = ({ students, onUpdateStatus, onViewDetails }: Props) => {
  const [confirmData, setConfirmData] = useState<{ id: string; isOpen: boolean }>({
    id: "",
    isOpen: false,
  });

  const handleOpenConfirm = (id: string) => {
    setConfirmData({ id, isOpen: true });
  }

  const handleConfirmAction = () => {
    onUpdateStatus(confirmData.id, 'active');
    setConfirmData({ id: "", isOpen: false });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
          {students.map((student) => (
            <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold text-gray-700">{student.student_id}</td>
              <td className="p-4 text-gray-600">{`${student.last_name}, ${student.first_name} ${student.suffix || ""}`}</td>
              <td className="p-4 text-gray-600">{student.course}</td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  student.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {student.account_status}
                </span>
              </td>
              <td className="p-4 flex items-center justify-center gap-4">
                {student.account_status === 'pending' ? (
                  <button 
                  onClick={() => handleOpenConfirm(student.student_id)} 
                  className="text-green-600 hover:scale-110 p-1"
                  >
                    <CheckCircleIcon size={22} />
                    </button>
                ) : (
                  // Eye icon visible only for active students
                    <button 
                    onClick={() => onViewDetails(student)} 
                    className="text-cvsu-green-base hover:scale-110 p-1"
                    >
                      <EyeIcon size={20} />
                    </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {students.length === 0 && <div className="p-20 text-center text-cvsu-gray italic">No records found.</div>}
    </div>
  );
};

export default StudentTable;
