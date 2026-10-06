import { motion } from "framer-motion";
import DashboardStats from "./DashboardStats";
import AttendanceGraph from "./attendanceGraph";
import DashboardCalendar from "./DashboardCalendar";
import TopVisitors from "./TopVisitors"; // Injected new component reference mapping line

const DashboardAnalytics = () => {
  return (
    <motion.div
      key="analytics-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6 text-left"
    >
      {/* A. Metric Counter Summary Blocks */}
      <DashboardStats />

      {/* B. GRAPH AND SIDE-BY-SIDE FIXED COLUMNS SPLIT CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-6 pt-2 items-start w-full">
        
        {/* LEFT CHANNEL: 75% WIDTH TRENDING CHART WORKSPACE */}
        <div className="w-full lg:w-3/4 shrink-0">
          <AttendanceGraph />
        </div>

        {/* RIGHT CHANNEL: 25% WIDTH DYNAMIC UTILITIES SIDEBAR WING */}
        <div className="w-full lg:w-1/4 shrink-0 space-y-4 flex flex-col">
          {/* Calendar Widget Render Node */}
          <DashboardCalendar />
          
          {/* NEW MODULE OVERLAY INJECTION MOUNT: Longest Monthly Durations Leaderboard */}
          <TopVisitors />
        </div>

      </div>
    </motion.div>
  );
};

export default DashboardAnalytics;
