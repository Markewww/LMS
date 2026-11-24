import type { AuditLog } from "./AuditTable";

const badgeClass = (action: string) => {
  const normalizedAction = action.toUpperCase();
  if (normalizedAction.includes("CREATE") || normalizedAction.includes("ADD")) {
    return "bg-green-100 text-green-700";
  }
  if (normalizedAction.includes("UPDATE") || normalizedAction.includes("EDIT")) {
    return "bg-blue-100 text-blue-700";
  }
  if (normalizedAction.includes("DELETE") || normalizedAction.includes("REMOVE")) {
    return "bg-red-100 text-red-700";
  }
  return "bg-gray-100 text-gray-700";
};

interface Props {
  log: AuditLog | null;
  onClose: () => void;
}

const Row = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex gap-3 py-1.5 border-b border-gray-100 text-sm">
    <span className="w-32 shrink-0 text-gray-500">{label}</span>
    <span className="break-all">{value ?? "—"}</span>
  </div>
);

const AuditDetailsModal = ({ log, onClose }: Props) => {
  if (!log) return null;

  let pretty = "";
  if (log.details) {
    try {
      pretty = JSON.stringify(JSON.parse(log.details), null, 2);
    } catch {
      pretty = log.details;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-700">Activity Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>

        <div className="mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass(log.action)}`}>
            {log.action}
          </span>
        </div>

        <Row label="Date & Time" value={new Date(log.created_at.replace(" ", "T")).toLocaleString()} />
        <Row label="Admin" value={`${log.actor_name} (${log.actor_id})`} />
        <Row label="Role" value={log.actor_role} />
        <Row label="Target type" value={log.target_type} />
        <Row label="Target ID" value={log.target_id} />
        <Row label="IP address" value={log.ip_address} />
        <Row label="Device" value={log.user_agent} />

        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-1">Details (before / after)</div>
          <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap">
            {pretty || "No additional details."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AuditDetailsModal;