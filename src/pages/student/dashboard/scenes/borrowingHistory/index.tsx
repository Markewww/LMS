import { BookOpen, } from "lucide-react";
import { motion } from "framer-motion";

const MyBorrowingHistory = () => {
  // Static mockup - in production, fetch based on student_id
  const history = [
    { id: 1, title: "Data Structures & Algorithms", date: "2023-10-15", status: "Returned", due: "2023-10-22" },
    { id: 2, title: "Modern Operating Systems", date: "2023-11-01", status: "Pending", due: "2023-11-08" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="bg-white rounded-xl overflow-hidden border border-gray-100"
    >
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-cvsu-gray text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Book Title</th>
            <th className="px-6 py-4">Borrowed Date</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {history.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3">
                <BookOpen size={16} className="text-cvsu-green-base" />
                <span className="font-medium text-gray-900">{item.title}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
              <td className="px-6 py-4 text-sm text-gray-600 font-semibold">{item.due}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === "Returned" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default MyBorrowingHistory;
