import { useMemo } from "react";
import { CalendarIcon } from "lucide-react";

const DashboardCalendar = () => {
  // --- AUTOMATED CALENDAR MATRIX ENGINE ---
  const calendarData = useMemo(() => {
    const today = new Date();
    const currentDayNum = today.getDate();
    const currentMonthName = today.toLocaleDateString("en-PH", { month: "long" });
    const currentYearNum = today.getFullYear();
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDayOfWeek = startOfMonth.getDay(); 
    const totalDaysInMonth = endOfMonth.getDate();

    const blankCells = Array(startDayOfWeek).fill(null);
    const dayCells = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
    const completeGridDays = [...blankCells, ...dayCells];

    return {
      currentDayNum,
      currentMonthName,
      currentYearNum,
      completeGridDays,
      weekDaysShortLabels: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    };
  }, []);

  return (
    <div className="w-full bg-white border border-gray-100/80 rounded-3xl p-5 shadow-2xs select-none text-left">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-50 mb-3 text-cvsu-green-base">
        <CalendarIcon size={16} />
        <span className="text-xs font-black uppercase tracking-wider font-montserrat">
          {calendarData.currentMonthName} {calendarData.currentYearNum}
        </span>
      </div>

      {/* Calendar Day Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-400 uppercase font-mono mb-2">
        {calendarData.weekDaysShortLabels.map((dayLabel, idx) => (
          <div key={idx}>{dayLabel}</div>
        ))}
      </div>

      {/* Calendar Grid Date Cells */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold font-mono">
        {calendarData.completeGridDays.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          
          const isToday = day === calendarData.currentDayNum;
          return (
            <div
              key={idx}
              className={`py-1.5 rounded-lg flex items-center justify-center transition-all ${
                isToday
                  ? "bg-cvsu-green-base text-white shadow-sm font-black scale-105"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardCalendar;
