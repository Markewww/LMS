/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClockIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

// Components (Fixed space-fragmented file name imports)
import AttendanceToolbar from "./components/AttendanceToolbar";
import AttendanceTable from "./components/AttendanceTable";

export interface AttendanceLogItem {
  uuid: string;
  student_id: string;
  full_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  duration: string | null;
}

const AttendanceLog = () => {
  const today = new Date().toLocaleDateString("en-CA"); // Formats to 'YYYY-MM-DD'
  const [logs, setLogs] = useState<AttendanceLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  // FETCH COMPILATION ENGINE LOGS FROM THE SERVER
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/get_attendance_logs.php`, {
        params: { date: selectedDate }
      });
      if (Array.isArray(response.data)) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  // FIXED: Consolidated the broken query filters layout and date token comparisons
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        const matchesSearch =
          log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.student_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = log.date === selectedDate;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        // Safe time-string ISO conversions prevent NaN sorting drops
        const timeA = new Date(`1970-01-01T${a.time_in}`).getTime() || 0;
        const timeB = new Date(`1970-01-01T${b.time_in}`).getTime() || 0;
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
  }, [logs, searchTerm, selectedDate, sortOrder]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 text-left"
    >
      {/* View Header Branding Segment */}
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg text-cvsu-green-base border border-gray-100 shadow-sm">
          <ClockIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-montserrat font-black text-cvsu-green-dark uppercase tracking-tight">
            Room Attendance
          </h2>
          <p className="text-xs text-gray-500">
            Daily student entry and exit records
          </p>
        </div>
      </div>

      {/* Control Toolbar Hooks */}
      <AttendanceToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Main Core Render Table Component */}
      <AttendanceTable logs={filteredLogs} loading={loading} />
    </motion.div>
  );
};

export default AttendanceLog;
