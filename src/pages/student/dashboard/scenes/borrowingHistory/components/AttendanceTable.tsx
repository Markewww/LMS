import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, Timer, Calendar, ChevronLeft, ChevronRight, ListFilter } from "lucide-react";

export interface AttendanceLog {
  uuid: number;
  student_id: string;
  log_date: string;
  course: string | null;
  time_in: string;
  time_out: string | null;
  duration: string | null;
}

interface AttendanceTableProps {
  attendance: AttendanceLog[];
  loading: boolean;
}

const AttendanceTable = ({ attendance, loading }: AttendanceTableProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Helper date metrics logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const totalBlanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Formatting strings for dictionary index matches
  const formatKeyStr = (dayNum: number) => {
    const d = String(dayNum).padStart(2, "0");
    const m = String(month + 1).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Group database records by date string matching standard ISO pattern format
  const attendanceMap = attendance.reduce((acc, log) => {
    const rawDate = new Date(log.log_date);
    const yStr = rawDate.getFullYear();
    const mStr = String(rawDate.getMonth() + 1).padStart(2, "0");
    const dStr = String(rawDate.getDate()).padStart(2, "0");
    const key = `${yStr}-${mStr}-${dStr}`;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, AttendanceLog[]>);

  // Target item filtering mechanism
  const filteredAttendance = selectedDateStr 
    ? attendance.filter(log => {
        const rawDate = new Date(log.log_date);
        const key = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, "0")}-${String(rawDate.getDate()).padStart(2, "0")}`;
        return key === selectedDateStr;
      })
    : attendance;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr(null);
  };

  return (
    <motion.div
      key="attendance-tracker"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-6 space-y-6"
    >
      {loading ? (
        <div className="p-20 text-center animate-pulse text-xs text-gray-400 font-bold uppercase tracking-widest">
          Loading attendance records from database...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. CALENDAR DATE SELECTOR MATRIX (5 columns on desktop) */}
          <div className="lg:col-span-5 bg-gray-50/50 p-4 border border-gray-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-cvsu-green-base" />
                {currentDate.toLocaleDateString("en-PH", { month: "long", year: "numeric" })}
              </h4>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 bg-white border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 bg-white border rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days Of Week Headers */}
            <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="py-1">{d}</div>)}
            </div>

            {/* Calendar Days Output Block */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold">
              {totalBlanks.map(b => <div key={`blank-${b}`} />)}
              {daysArray.map(day => {
                const targetKey = formatKeyStr(day);
                const hasLogs = !!attendanceMap[targetKey];
                const isSelected = selectedDateStr === targetKey;
                          
                // ─── IDENTIFY TODAY'S DATE ───
                const today = new Date();
                const isToday = 
                  day === today.getDate() && 
                  month === today.getMonth() && 
                  year === today.getFullYear();
                          
                return (
                  <div key={`day-${day}`} className="relative flex items-center justify-center p-0.5">
                    <button
                      onClick={() => setSelectedDateStr(isSelected ? null : targetKey)}
                      title={isToday ? "Today" : undefined}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer text-sm relative
                        ${isSelected 
                          ? "bg-cvsu-green-base text-white font-black shadow-md scale-105 z-10" 
                          : "text-gray-700 hover:bg-gray-200/60"
                        }
                        ${hasLogs && !isSelected ? "border-2 border-cvsu-green-base text-cvsu-green-base font-black" : ""}
                        ${isToday && !isSelected ? "bg-gray-200/70 font-black ring-1 ring-gray-300" : ""}
                        ${isToday && isSelected ? "ring-2 ring-offset-2 ring-cvsu-green-base" : ""}
                      `}
                    >
                      {day}
                    </button>
                      
                    {/* Attendance log dot marker */}
                    {hasLogs && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 bg-cvsu-green-base rounded-full" />
                    )}
              
                    {/* Tiny subtle indicator dot for today when selected or logged */}
                    {isToday && (
                      <span className={`absolute -top-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-gray-500"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {selectedDateStr && (
              <div className="flex items-center justify-between pt-2 border-t text-[10px] text-gray-500 font-medium">
                <span>Selected: <b className="font-bold text-gray-700">{new Date(selectedDateStr).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</b></span>
                <button onClick={() => setSelectedDateStr(null)} className="text-xs text-cvsu-green-base font-bold hover:underline cursor-pointer">Clear Filter</button>
              </div>
            )}
          </div>

          {/* 2. DYNAMIC RECORD LOG VIEW PANEL (7 columns on desktop) */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-gray-50/70 px-4 py-3 border-b flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-cvsu-gray flex items-center gap-1">
                <ListFilter size={12} /> Live Session Logs
              </span>
              <span className="text-[10px] bg-gray-200/80 font-bold px-2 py-0.5 text-gray-600 rounded-full">
                {filteredAttendance.length} items
              </span>
            </div>

            <div className="overflow-x-auto flex-1 max-h-85 overflow-y-auto">
              {filteredAttendance.length === 0 ? (
                <div className="p-16 text-center text-xs text-gray-400 italic">
                  {selectedDateStr ? "No logs matching this calendar date." : "No laboratory library logs recorded yet."}
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50/30 border-b text-[9px] font-black uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Subject / Course</th>
                      <th className="px-4 py-3 text-left"><span className="flex items-center gap-1"><LogIn size={10} /> In</span></th>
                      <th className="px-4 py-3 text-left"><span className="flex items-center gap-1"><LogOut size={10} /> Out</span></th>
                      <th className="px-4 py-3 text-left"><span className="flex items-center gap-1"><Timer size={10} /> Duration</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-medium">
                    {filteredAttendance.map((log) => (
                      <tr key={log.uuid} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-800 font-bold whitespace-nowrap">
                          {new Date(log.log_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-cvsu-green-base font-bold uppercase max-w-30 truncate" title={log.course || "Library Study"}>
                          {log.course || "Library Study"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {new Date(log.time_in).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono">
                          {log.time_out 
                            ? new Date(log.time_out).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
                            : <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Active</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-400 font-mono whitespace-nowrap">
                          {log.duration || "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
};


export default AttendanceTable;
