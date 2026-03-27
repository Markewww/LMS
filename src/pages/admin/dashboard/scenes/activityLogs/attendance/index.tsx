import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClockIcon, CalendarIcon, UserIcon } from "lucide-react";

// Components
import AttendanceToolbar from "./components/AttendanceToolbar";

const AttendanceLog = () => {
  const today = new Date().toISOString().split("T")[0];
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

//   Filter and sort logic
  const filteredLogs = logs
    .filter((log) => {
        const matchesSearch = 
          log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.student_id.includes(searchTerm);
        const matchesDate = log.date === selectedDate;
        return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time_in}`).getTime();
        const timeB = new Date(`1970-01-01T${b.time_in}`).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const fetchAttendance = async () => {
    try {
      const response = await axios.get("http://localhost/LMS/src/API/admin/get_attendance_logs.php");
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="bg-cvsu-green-base p-2 rounded-lg text-white">
          <ClockIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase">Room Attendance</h2>
          <p className="text-xs text-gray-500">Daily student entry and exit records</p>
        </div>
      </div>
        <AttendanceToolbar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
        />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Date</th>
              <th className="p-4">Student ID</th>
              <th className="p-4">Full Name</th>
              <th className="p-4 text-center">Time In</th>
              <th className="p-4 text-center">Time Out</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400">Loading logs...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">No attendance records found for today.</td></tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <CalendarIcon size={14} className="text-gray-400" />
                    {log.date}
                  </td>
                  <td className="p-4 font-bold text-gray-700">{log.student_id}</td>
                  <td className="p-4 text-gray-600">{log.full_name}</td>
                  <td className="p-4 text-center text-green-600 font-bold">{log.time_in}</td>
                  <td className="p-4 text-center text-orange-600 font-bold">
                    {log.time_out || "--:--"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      log.time_out ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                    }`}>
                      {log.time_out ? 'Exited' : 'In Room'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AttendanceLog;
