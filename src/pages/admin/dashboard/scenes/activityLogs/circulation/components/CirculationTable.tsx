/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\scenes\activityLogs\circulation\components\CirculationTable.tsx
import { CalendarIcon, Hash, BookOpen, FileText } from "lucide-react";

interface CirculationLogData {
  loan_id: string;
  student_id: string;
  full_name: string;
  asset_title: string;
  asset_type: "book" | "research";
  borrow_date: string;
  due_date: string;
  status: "borrowed" | "returned" | "overdue";
}

interface CirculationTableProps {
  logs: CirculationLogData[];
  loading: boolean;
}

const CirculationTable = ({ logs, loading }: CirculationTableProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
            <th className="p-4">Transaction ID</th>
            <th className="p-4">Student</th>
            <th className="p-4">Asset Title</th>
            <th className="p-4 text-center">Classification</th>
            <th className="p-4 text-center">Borrowed Date</th>
            <th className="p-4 text-center">Due Date</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm">
          {loading ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-400 font-medium">
                Loading records...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-10 text-center text-gray-400 italic font-medium">
                No circulation records found.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.loan_id} className="hover:bg-gray-50/60 transition-colors">
                {/* Transaction ID */}
                <td className="p-4 text-gray-500 font-mono text-xs flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  {log.asset_type === "research" ? `RES-${log.loan_id.substring(0, 6)}` : `BOR-${log.loan_id.substring(0, 6)}`}
                </td>

                {/* Student Metadata */}
                <td className="p-4">
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-gray-700 leading-tight">{log.full_name}</span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold uppercase mt-0.5">{log.student_id}</span>
                  </div>
                </td>

                {/* Unified Book/Manuscript Asset Title */}
                <td className="p-4 text-gray-600 font-medium max-w-xs truncate" title={log.asset_title}>
                  {log.asset_title}
                </td>

                {/* Dynamic Asset Type Badge */}
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${
                    log.asset_type === "research" 
                      ? "bg-purple-50 text-purple-700 border-purple-100" 
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {log.asset_type === "research" ? (
                      <>
                        <FileText size={10} /> Manuscript
                      </>
                    ) : (
                      <>
                        <BookOpen size={10} /> Textbook
                      </>
                    )}
                  </span>
                </td>

                {/* Borrowed Date */}
                <td className="p-4 text-center text-gray-600">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                    <CalendarIcon size={13} className="text-gray-400" />
                    {log.borrow_date}
                  </div>
                </td>

                {/* Due Date Indicator */}
                <td className={`p-4 text-center font-bold text-xs ${
                  log.status === "overdue" ? "text-red-600 animate-pulse" : "text-gray-600"
                }`}>
                  {log.due_date}
                </td>

                {/* Status Evaluation Badge */}
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      log.status === "returned"
                        ? "bg-green-100 text-green-700"
                        : log.status === "overdue"
                        ? "bg-red-100 text-red-700 animate-bounce"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CirculationTable;
