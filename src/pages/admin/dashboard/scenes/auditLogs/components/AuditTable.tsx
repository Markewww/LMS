// src\pages\admin\dashboard\scenes\auditLogs\components\AuditTable.tsx
import {
  EyeIcon,
  ShieldCheckIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface AuditLog {
  id: number;
  actor_id: string;
  actor_name: string;
  actor_role: "admin" | "superadmin";
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null; // JSON string
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Props {
  logs: AuditLog[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelect: (log: AuditLog) => void;
}

const badgeClass = (action: string) => {
  if (action.includes("delete") || action.includes("failed") || action.includes("reject") || action.includes("suspend"))
    return "bg-red-100 text-red-700";
  if (action.includes("approve") || action.includes("add") || action.includes("create") || action.includes("upload") || action.includes("reactivate"))
    return "bg-green-100 text-green-700";
  if (action.includes("edit") || action.includes("update") || action.includes("password") || action.includes("status"))
    return "bg-yellow-100 text-yellow-700";
  if (action.startsWith("export")) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

const pageBtn =
  "p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer";

const AuditTable = ({ logs, loading, page, limit, total, onPageChange, onSelect }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  const changePage = (next: number) => {
    if (next >= 1 && next <= totalPages) onPageChange(next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      {/* HEADER - matches AdminTable */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <ShieldCheckIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Audit Trail</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Date & Time</th>
              <th className="p-4">Admin</th>
              <th className="p-4 text-center">Action</th>
              <th className="p-4">Target</th>
              <th className="p-4">IP Address</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {!loading &&
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {new Date(log.created_at.replace(" ", "T")).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-700">{log.actor_name}</div>
                    <div className="text-xs text-gray-500">
                      {log.actor_id}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${badgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {log.target_id ? (
                      <>
                        <div className="font-bold text-gray-700">{log.target_id}</div>
                        <div className="text-xs text-gray-500">{log.target_type}</div>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{log.ip_address ?? "—"}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onSelect(log)}
                        className="text-cvsu-green-base hover:scale-110 p-1 transition-transform cursor-pointer"
                        title="View Details"
                      >
                        <EyeIcon size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* LOADING / EMPTY STATES - match AdminTable */}
      {loading && <div className="p-20 text-center text-cvsu-gray italic">Loading audit records...</div>}
      {!loading && logs.length === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">No activity records found.</div>
      )}

      {/* PAGINATION FOOTER - same layout as AdminTable (shown only when entries exceed one page) */}
      {total > limit && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-700">{total}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => changePage(1)} disabled={page === 1} title="First Page" className={pageBtn}>
              <ChevronsLeft size={14} />
            </button>
            <button onClick={() => changePage(page - 1)} disabled={page === 1} title="Previous Page" className={pageBtn}>
              <ChevronLeft size={14} />
            </button>
            <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cvsu-green-base text-white text-center">
              Page {page} of {totalPages}
            </div>
            <button onClick={() => changePage(page + 1)} disabled={page === totalPages} title="Next Page" className={pageBtn}>
              <ChevronRight size={14} />
            </button>
            <button onClick={() => changePage(totalPages)} disabled={page === totalPages} title="Last Page" className={pageBtn}>
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTable;