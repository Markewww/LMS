import { useCallback, useEffect, useState } from "react";
import AuditToolbar from "./components/AuditToolbar";
import type { AuditFilters } from "./components/AuditToolbar";
import AuditTable from "./components/AuditTable";
import type { AuditLog } from "./components/AuditTable";
import AuditDetailsModal from "./components/AuditDetailsModal";
import { API_BASE_URL } from "@/API/APIConfig";

const EMPTY_FILTERS: AuditFilters = { actor: "", action: "", date_from: "", date_to: "", search: "" };
const LIMIT = 20;

const AuditLogs = () => {
  const [filters, setFilters] = useState<AuditFilters>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [actors, setActors] = useState<{ actor_id: string; actor_name: string }[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [stats, setStats] = useState({ today: 0, failed_logins_week: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  // Wait for typing to pause before searching
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        actor: filters.actor,
        action: filters.action,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: debouncedSearch,
      });
      const res = await fetch(`${API_BASE_URL}/superadmin/get_audit_logs.php?${params}`, {
        credentials: "include",
      });
      if (res.status === 403) {
        setError("You do not have permission to view the audit logs.");
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load logs");
      setLogs(json.data);
      setTotal(json.total);
      setActors(json.actors);
      setActions(json.actions);
      setStats(json.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [page, filters.actor, filters.action, filters.date_from, filters.date_to, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (next: AuditFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-green-700">Audit Logs</h1>
        <p className="text-sm text-gray-500">A record of every action taken by staffs. Visible to admins only.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Actions today</div>
          <div className="text-2xl font-bold text-green-700">{stats.today}</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Failed logins (last 7 days)</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed_logins_week}</div>
        </div>
      </div>

      <AuditToolbar
        filters={filters}
        actors={actors}
        actions={actions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(EMPTY_FILTERS)}
      />

      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 text-sm">{error}</div>}

      <AuditTable
        logs={logs}
        loading={loading}
        page={page}
        limit={LIMIT}
        total={total}
        onPageChange={setPage}
        onSelect={setSelected}
      />

      <AuditDetailsModal log={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AuditLogs;