import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpenIcon } from "lucide-react";

const CirculationLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCirculation = async () => {
    try {
      const response = await axios.get("http://localhost/LMS/src/API/admin/get_circulation_logs.php");
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching circulation logs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculation();
  }, []);

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
          <h2 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase">Book Circulation</h2>
          <p className="text-xs text-gray-500">Track book borrowing and return history</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase font-bold tracking-wider">
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
              <tr><td colSpan={6} className="p-10 text-center text-gray-400 font-dm">Loading records...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic font-dm">No circulation records found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.loan_id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">#BOR-{log.loan_id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">{log.full_name}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{log.student_id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{log.book_title}</td>
                  <td className="p-4 text-center text-gray-500">{log.borrow_date}</td>
                  <td className="p-4 text-center text-red-500 font-bold">{log.due_date}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      log.status === 'returned' 
                        ? 'bg-green-100 text-green-700' 
                        : log.status === 'overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.status}
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

export default CirculationLog;
