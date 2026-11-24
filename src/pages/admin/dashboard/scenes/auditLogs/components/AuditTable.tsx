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
  if (action.includes("delete") || action.includes("failed") || action.includes("reject"))
    return "bg-red-100 text-red-700";
  if (action.includes("approve") || action.includes("add") || action.includes("create") || action.includes("upload"))
    return "bg-green-100 text-green-700";
  if (action.includes("edit") || action.includes("update") || action.includes("password"))
    return "bg-yellow-100 text-yellow-700";
  if (action.startsWith("export")) return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

const AuditTable = ({ logs, loading, page, limit, total, onPageChange, onSelect }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No activity found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => onSelect(log)}
                  className="border-b border-gray-100 hover:bg-green-50 cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(log.created_at.replace(" ", "T")).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{log.actor_name}</div>
                    <div className="text-xs text-gray-500">{log.actor_id} · {log.actor_role}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.target_id ? (
                      <>
                        <div>{log.target_id}</div>
                        <div className="text-xs text-gray-500">{log.target_type}</div>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.ip_address ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
        <span>{total} total entries</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditTable;