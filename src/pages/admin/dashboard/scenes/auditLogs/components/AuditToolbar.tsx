export interface AuditFilters {
  actor: string;
  action: string;
  date_from: string;
  date_to: string;
  search: string;
}

interface Props {
  filters: AuditFilters;
  actors: { actor_id: string; actor_name: string }[];
  actions: string[];
  onChange: (filters: AuditFilters) => void;
  onReset: () => void;
}

const inputClass =
  "border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

const AuditToolbar = ({ filters, actors, actions, onChange, onReset }: Props) => {
  const set = (key: keyof AuditFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg shadow border border-gray-200">
      <input
        type="text"
        placeholder="Search target, admin, details..."
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className={`${inputClass} flex-1 min-w-55`}
      />

      <select value={filters.actor} onChange={(e) => set("actor", e.target.value)} className={inputClass}>
        <option value="">All admins</option>
        {actors.map((a) => (
          <option key={a.actor_id} value={a.actor_id}>
            {a.actor_name} ({a.actor_id})
          </option>
        ))}
      </select>

      <select value={filters.action} onChange={(e) => set("action", e.target.value)} className={inputClass}>
        <option value="">All actions</option>
        {actions.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <label className="text-xs text-gray-500">
        From
        <input type="date" value={filters.date_from} onChange={(e) => set("date_from", e.target.value)} className={`${inputClass} block`} />
      </label>
      <label className="text-xs text-gray-500">
        To
        <input type="date" value={filters.date_to} onChange={(e) => set("date_to", e.target.value)} className={`${inputClass} block`} />
      </label>

      <button onClick={onReset} className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
        Reset
      </button>
    </div>
  );
};

export default AuditToolbar;