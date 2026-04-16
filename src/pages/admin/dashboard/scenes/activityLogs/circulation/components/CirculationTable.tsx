import { CalendarIcon, Hash } from "lucide-react";
import type { CirculationLogData } from "..";

interface CirculationTableProps {
  logs: CirculationLogData[];
  loading: boolean;
}

const CirculationTable = ({ logs, loading }: CirculationTableProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
            <th className="p-4">Transaction ID</th>
            <th className="p-4">Student</th>
            <th className="p-4">Book Title</th>
            <th className="p-4 text-center">Borrowed Date</th>
            <th className="p-4 text-center">Due Date</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 text-sm">
          {loading ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-gray-400">
                Loading records...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                No circulation records found.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.loan_id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500 font-mono text-xs flex items-center gap-2">
                  <Hash size={14} className="text-gray-400" />
                  BOR-{log.loan_id}
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">{log.full_name}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{log.student_id}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600 font-medium">
                  {log.book_title}
                </td>
                <td className="p-4 text-center text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <CalendarIcon size={14} className="text-gray-400" />
                    {log.borrow_date}
                  </div>
                </td>
                <td className={`p-4 text-center font-bold ${
                  log.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {log.due_date}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      log.status === "returned"
                        ? "bg-green-100 text-green-700"
                        : log.status === "overdue"
                        ? "bg-red-100 text-red-700"
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
