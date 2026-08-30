import { useState } from "react";
import { ClipboardListIcon, CheckCircleIcon, XCircleIcon, EyeIcon, FileTextIcon } from "lucide-react";
import ConfirmationModal from "../../studentManagement/components/alerts/ConfirmationModal";

// 1. FIXED ESLint 'any' (Lines 6 & 8): Explicit structure matching your actual database schema
interface ResearchProject {
  uuid: string;
  code: string | null; // Keeps custom call numbers visible
  title: string;
  type: "Thesis" | "Capstone" | "Design Project";
  program: string | null;
  year: number | null; // Added publication year metric tracking bounds
  authors: string | null;
  adviser: string | null;
  technical_critic: string | null;
  abstract: string | null;
  keywords: string | null;
  file_path: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  created_at: string;
}

interface Props {
  submissions: ResearchProject[]; // Swapped 'any[]' with structural type definition array
  onUpdateStatus: (uuid: string, status: "approved" | "rejected") => void;
  onViewDetails: (research: ResearchProject) => void; // Swapped 'any' parameter tracking
}

const ResearchTable = ({ submissions, onUpdateStatus, onViewDetails }: Props) => {
  const [confirmData, setConfirmData] = useState<{ uuid: string; action: "approved" | "rejected"; isOpen: boolean }>({
    uuid: "",
    action: "approved",
    isOpen: false,
  });

  const handleOpenConfirm = (uuid: string, action: "approved" | "rejected") => {
    setConfirmData({ uuid, action, isOpen: true });
  };

  const handleConfirmAction = () => {
    onUpdateStatus(confirmData.uuid, confirmData.action);
    setConfirmData({ ...confirmData, isOpen: false });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      {/* ALERT MODAL */}
      <ConfirmationModal
        isOpen={confirmData.isOpen}
        onClose={() => setConfirmData({ ...confirmData, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmData.action === "approved" ? "Approve Research" : "Reject Research"}
        message={`Are you sure you want to ${confirmData.action} this research submission?`}
      />
      
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <ClipboardListIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Research Submissions</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Project Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Program</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {submissions.map((res) => (
              <tr key={res.uuid} className="hover:bg-gray-50 transition-colors">
                
                {/* MODIFIED COLUMN: TITLE & AUTO-FALLBACK CODE DISPLAY */}
                <td className="p-4 max-w-xs">
                  <div className="flex items-start gap-2.5">
                    <FileTextIcon size={16} className="text-gray-400 shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-800 truncate" title={res.title}>
                        {res.title}
                      </p>
                      {/* 2. REMOVED verification_code: Swapped to display Call Code or Publication Year instead */}
                      {res.code ? (
                        <span className="text-xs text-gray-400 font-medium block mt-0.5 tracking-wide">
                          Code: {res.code}
                        </span>
                      ) : res.year ? (
                        <span className="text-xs text-gray-400 font-medium block mt-0.5 tracking-wide">
                          Year: {res.year}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                
                <td className="p-4">
                  <span className="text-[10px] font-black text-cvsu-green-base bg-cvsu-bg px-2 py-0.5 rounded uppercase">
                    {res.type}
                  </span>
                </td>
                {/* 3. ENHANCED PROGRAM VIEW: Displays degree code along with year context parameter */}
                <td className="p-4 text-gray-600">
                  {res.program} {res.year ? `(${res.year})` : ""}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    res.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    res.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {res.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(res)}
                      className="text-blue-500 hover:scale-110 p-1 transition-transform cursor-pointer"
                      title="View Details"
                    >
                      <EyeIcon size={20} />
                    </button>
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOpenConfirm(res.uuid, 'approved')}
                          className="text-green-600 hover:scale-110 p-1 transition-transform cursor-pointer"
                          title="Approve"
                        >
                          <CheckCircleIcon size={22} />
                        </button>
                        <button
                          onClick={() => handleOpenConfirm(res.uuid, 'rejected')}
                          className="text-red-500 hover:scale-110 p-1 transition-transform cursor-pointer"
                          title="Reject"
                        >
                          <XCircleIcon size={22} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {submissions.length === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">No research found.</div>
      )}
    </div>
  );
};

export default ResearchTable;
