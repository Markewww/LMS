import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ClockIcon } from "lucide-react";

import { API_BASE_URL } from "@/API/APIConfig";

// Components
import AttendanceToolbar from "./components/AttendanceToolbar";
import AttendanceTable from "./components/AttendanceTable";

interface AttendanceLog {
  uuid: string;
  student_id: string;
  full_name: string;
  date: string;
  time_in: string;
  time_out: string | null;
  duration: string | null;
}

const AttendanceLog = () => {
  const today = new Date().toLocaleDateString("en-CA");

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

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
      const response = await axios.get(
        `${API_BASE_URL}/admin/get_attendance_logs.php`,
        {
          params: { date: selectedDate }
        }
      );
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg text-cvsu-green-base">
          <ClockIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase">
            Room Attendance
          </h2>
          <p className="text-xs text-gray-500">
            Daily student entry and exit records
          </p>
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

      {/* ✅ NEW COMPONENT */}
      <AttendanceTable logs={filteredLogs} loading={loading} />
    </motion.div>
  );
};

export default AttendanceLog;