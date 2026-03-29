import { CalendarIcon } from "lucide-react";
import type AttendanceLog from "..";

interface AttendanceTableProps {
  logs: AttendanceLog[];
  loading: boolean;
}

const AttendanceTable = ({ logs, loading }: AttendanceTableProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
            <th className="p-4">Date</th>
            <th className="p-4">Student ID</th>
            <th className="p-4">Full Name</th>
            <th className="p-4 text-center">Time In</th>
            <th className="p-4 text-center">Time Out</th>
            <th className="p-4 text-center">Duration</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 text-sm">
          {loading ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-gray-400">
                Loading logs...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-gray-400 italic">
                No attendance records found.
              </td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-600 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-gray-400" />
                  {log.date}
                </td>
                <td className="p-4 font-bold text-gray-700">
                  {log.student_id}
                </td>
                <td className="p-4 text-gray-600">{log.full_name}</td>
                <td className="p-4 text-center text-green-600 font-bold">
                  {log.time_in}
                </td>
                <td className="p-4 text-center text-orange-600 font-bold">
                  {log.time_out || "--:--"}
                </td>
                <td className="p-4 text-center text-gray-500 italic">
                  {log.duration || "--:--"}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      log.time_out
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {log.time_out ? "Exited" : "In Room"}
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

export default AttendanceTable;