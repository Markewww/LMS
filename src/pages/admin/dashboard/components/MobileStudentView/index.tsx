// src\pages\admin\dashboard\components\MobileStudentView\index.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  UsersIcon,
  LogOutIcon,
  BadgeCheckIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { API_BASE_URL } from "@/API/APIConfig";
import Toolbar from "./Toolbar";

interface StudentRecord {
  student_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  course: string;
  account_status: "active" | "pending" | "inactive";
  // 'verified' when the student has an approved research, otherwise the
  // verification code of a pending research (or null when neither applies)
  research_badge?: string | null;
}

type Props = {
  onLogout: () => void;
};

const MobileStudentView = ({ onLogout }: Props) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // ─── PAGINATION STATE CONFIGURATIONS ───
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  useEffect(() => {
    let cancelled = false;

    const loadStudents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/get_students.php`);
        if (cancelled) return;
        if (Array.isArray(res.data)) {
          setStudents(res.data);
        } else {
          setError(res.data?.error || "Failed to load students.");
        }
      } catch {
        if (!cancelled) setError("Unable to reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  // Only verified students and/or students with a verification code, searched and sorted by last name
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();

    return students
      .filter((s) => !!s.research_badge)
      .filter(
        (s) =>
          !q ||
          [s.student_id, s.first_name, s.last_name, s.course, s.research_badge].some((v) =>
            (v ?? "").toLowerCase().includes(q)
          )
      )
      .sort((a, b) => {
        const byLast = a.last_name.localeCompare(b.last_name, undefined, { sensitivity: "base" });
        const result = byLast || a.first_name.localeCompare(b.first_name, undefined, { sensitivity: "base" });
        return sortAsc ? result : -result;
      });
  }, [students, search, sortAsc]);

  // Calculate local page boundary math configurations
  const totalRows = visibleStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  const paginatedStudents = visibleStudents.slice(startIndex, endIndex);

  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-cvsu-bg font-dm text-left select-none">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="min-w-0">
          <h1 className="text-sm font-montserrat font-black text-cvsu-green-base uppercase tracking-tight leading-tight">
            CEIT Reading Room
          </h1>
          <p className="text-[11px] text-cvsu-gray font-medium">Verified students</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 flex items-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <LogOutIcon size={16} />
          Logout
        </button>
      </header>

      <main className="p-4 space-y-4">
        <Toolbar
          search={search}
          onSearchChange={handleSearchChange}
          sortAsc={sortAsc}
          onToggleSort={() => {
            setSortAsc((prev) => !prev);
            setCurrentPage(1);
          }}
          resultCount={totalRows}
        />

        {/* TABLE CARD - same design as StudentTable / AdminTable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2">
            <UsersIcon className="text-cvsu-green-base" size={24} />
            <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Student Masterlist</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-135 text-left border-collapse">
              <thead>
                <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Program</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {paginatedStudents.map((student) => (
                  <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-700">{student.student_id}</td>
                    <td className="p-4 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800">
                          {`${student.last_name}, ${student.first_name} ${student.suffix || ""}`}
                        </p>
                        {student.research_badge === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-bold mt-0.5">
                            <BadgeCheckIcon size={13} className="text-green-600" />
                            Verified
                          </span>
                        ) : student.research_badge ? (
                          <span className="text-xs text-gray-400 font-semibold block mt-0.5 tracking-wide">
                            {student.research_badge}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{student.course}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          student.account_status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {student.account_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LOADING / ERROR / EMPTY STATES */}
          {loading && <div className="p-20 text-center text-cvsu-gray italic">Loading students...</div>}
          {!loading && error && <div className="p-20 text-center text-red-500 font-medium">{error}</div>}
          {!loading && !error && totalRows === 0 && (
            <div className="p-20 text-center text-cvsu-gray italic">
              {search ? "No matching students found." : "No verified students found."}
            </div>
          )}

          {/* ─── PAGINATION FOOTER (shows up to 20 rows per page) ─── */}
          {totalRows > rowsPerPage && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              <div className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-gray-700">{endIndex}</span> of{" "}
                <span className="font-bold text-gray-700">{totalRows}</span> records
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => changePage(1)}
                  disabled={safePage === 1}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => changePage(safePage - 1)}
                  disabled={safePage === 1}
                  title="Previous Page"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cvsu-green-base text-white shadow-xs min-w-24 text-center">
                  Page {safePage} of {totalPages}
                </div>
                <button
                  onClick={() => changePage(safePage + 1)}
                  disabled={safePage === totalPages}
                  title="Next Page"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => changePage(totalPages)}
                  disabled={safePage === totalPages}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MobileStudentView;