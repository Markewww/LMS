import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpenIcon } from "lucide-react";

import { API_BASE_URL } from "@/API/APIConfig";

// Components
import CirculationToolbar from "./components/CirculationToolbar";
import CirculationTable from "./components/CirculationTable";

export interface CirculationLogData {
  loan_id: string;
  student_id: string;
  full_name: string;
  book_title: string;
  borrow_date: string;
  due_date: string;
  status: "borrowed" | "returned" | "overdue";
}

const CirculationLog = () => {
  const today = new Date().toLocaleDateString("en-CA");

  // State setup aligned with Attendance
  const [logs, setLogs] = useState<CirculationLogData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  // Logic aligned with Attendance (Filter by Search Term and Selected Date)
  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.student_id.includes(searchTerm) ||
        log.book_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = log.borrow_date === selectedDate;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const timeA = new Date(a.borrow_date).getTime();
      const timeB = new Date(b.borrow_date).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const fetchCirculation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/get_circulation_logs.php`, 
        {
          params: { date: selectedDate }
        }
      );
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching circulation:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculation();

    const channel = new BroadcastChannel("circulation_sync");
    channel.onmessage = (event) => {
      if (event.data.type === "NEW_TRANSACTION") {
        fetchCirculation();
      }
    };
    return () => channel.close();
  }, [selectedDate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg text-cvsu-green-base">
          <BookOpenIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase">
            Book Circulation
          </h2>
          <p className="text-xs text-gray-500">
            Track book borrowing and return history
          </p>
        </div>
      </div>

      <CirculationToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <CirculationTable logs={filteredLogs} loading={loading} />
    </motion.div>
  );
};

export default CirculationLog;
