import { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { BookOpen, Calendar } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

// Component Extractions
import BorrowingTable, { type BorrowingLog } from "./components/BorrowingTable";
import AttendanceTable, { type AttendanceLog } from "./components/AttendanceTable";

interface MyBorrowingHistoryProps {
  studentId: string; // Passed from parent context to lock database parameters to this profile user
}

const MyBorrowingHistory = ({ studentId }: MyBorrowingHistoryProps) => {
  const [subTab, setSubTab] = useState<"borrowing" | "attendance">("borrowing");
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [historyLogs, setHistoryLogs] = useState<BorrowingLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. DATA FETCH TIMELINE TRAIL FOR UNIONIZED BOOK & MANUSCRIPT CIRCULATION LOGS
  useEffect(() => {
    if (subTab !== "borrowing" || !studentId) return;

    const fetchBorrowingHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/student/get_student_borrowing_history.php?student_id=${studentId}`
        );
        if (Array.isArray(response.data)) {
          setHistoryLogs(response.data);
        }
      } catch (error) {
        console.error("Failed syncing dynamic circulation ledger arrays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowingHistory();
  }, [subTab, studentId]);

  // 2. LIVE DATA FETCH FOR ATTENDANCE LOGS FROM YOUR DATABASE
  useEffect(() => {
    if (subTab !== "attendance" || !studentId) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/student/get_attendance.php?student_id=${studentId}`
        );
        if (Array.isArray(response.data)) {
          setAttendance(response.data);
        }
      } catch (error) {
        console.error("Failed syncing attendance records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [subTab, studentId]);

  return (
    <div className="space-y-6 font-dm">
      {/* Dynamic Sub-Navigation Header Toggles */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-100 max-w-sm shadow-xs select-none">
        <button
          type="button"
          onClick={() => setSubTab("borrowing")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === "borrowing"
              ? "bg-cvsu-green-base text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <BookOpen size={14} /> Book Loans
        </button>
        
        <button
          type="button"
          onClick={() => setSubTab("attendance")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            subTab === "attendance"
              ? "bg-cvsu-green-base text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Calendar size={14} /> Attendance
        </button>
      </div>

      {/* Main Table Content Cards */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm text-left">
        <AnimatePresence mode="wait">
          {subTab === "borrowing" ? (
            <BorrowingTable key="borrow-table-view" borrowingHistory={historyLogs} />
          ) : (
            <AttendanceTable key="attendance-table-view" attendance={attendance} loading={loading} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyBorrowingHistory;
