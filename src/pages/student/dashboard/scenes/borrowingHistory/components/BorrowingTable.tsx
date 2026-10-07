import { motion } from "framer-motion";
import { BookOpen, FileText } from "lucide-react";

export interface BorrowingLog {
  id: number | string;
  title: string;
  asset_type: "book" | "research";
  date: string;
  due: string;
  status: "Returned" | "Pending" | "Overdue";
}

interface BorrowingTableProps {
  borrowingHistory: BorrowingLog[];
}

const BorrowingTable = ({ borrowingHistory }: BorrowingTableProps) => {
  if (borrowingHistory.length === 0) {
    return (
      <div className="p-12 text-center text-sm font-medium text-gray-400 italic bg-white rounded-2xl border border-gray-100 shadow-sm">
        No personal library borrowing history found on file for this account.
      </div>
    );
  }

  return (
    <motion.div
      key="borrowing-table"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm font-dm"
    >
      <table className="w-full border-collapse text-left">
        <thead className="bg-gray-50/70 border-b border-gray-100 text-cvsu-gray text-[10px] font-black uppercase tracking-widest shrink-0 select-none">
          <tr>
            <th className="px-6 py-4">Borrowed Material Title</th>
            <th className="px-6 py-4 text-center">Classification</th>
            <th className="px-6 py-4 text-center">Borrowed Date</th>
            <th className="px-6 py-4 text-center">Due Date</th>
            <th className="px-6 py-4 text-center">Transaction Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-sm font-medium">
          {borrowingHistory.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              {/* Left Cell: Title with Type Adaptive Icon Branding */}
              <td className="px-6 py-4 max-w-xs md:max-w-md">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.asset_type === "research" ? "bg-purple-50 text-purple-600" : "bg-cvsu-bg text-cvsu-green-base"
                  }`}>
                    {item.asset_type === "research" ? <FileText size={16} /> : <BookOpen size={16} />}
                  </div>
                  <span className="font-bold text-gray-800 line-clamp-1 uppercase font-montserrat tracking-tight" title={item.title}>
                    {item.title}
                  </span>
                </div>
              </td>

              {/* Classification Tag Category */}
              <td className="px-6 py-4 text-center select-none">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  item.asset_type === "research" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"
                }`}>
                  {item.asset_type === "research" ? "Manuscript" : "Textbook"}
                </span>
              </td>

              {/* Borrowed Date */}
              <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">{item.date}</td>

              {/* Due Date Indicator */}
              <td className={`px-6 py-4 text-center font-mono text-xs font-bold ${
                item.status === "Overdue" ? "text-red-600 animate-pulse" : "text-gray-500"
              }`}>
                {item.due}
              </td>

              {/* Status Badge Selection (Fixed Scrambled Braces Error Code) */}
              <td className="px-6 py-4 text-center select-none">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.status === "Returned" ? "bg-green-100 text-green-700" :
                  item.status === "Overdue" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700 animate-pulse"
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

export default BorrowingTable;
