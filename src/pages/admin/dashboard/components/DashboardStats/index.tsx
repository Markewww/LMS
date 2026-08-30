import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { BookOpenIcon, UserCheckIcon, ActivityIcon, UsersIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface LiveStats {
  totalBooks: number;
  totalStudents: number;
  activeVisitors: number;
  pendingResearch: number;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
  })
};

const DashboardStats = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalBooks: 0,
    totalStudents: 0,
    activeVisitors: 0,
    pendingResearch: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/admin/get_dashboard_stats.php`);
        setStats(response.data);
      } catch (error) {
        console.error("Failed fetching live dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Card 1: Books Inventory */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center gap-5">
        <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
          <BookOpenIcon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-montserrat">Total Books</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalBooks.toLocaleString()}</h3>
        </div>
      </motion.div>

      {/* Card 2: Registered Students */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center gap-5">
        <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
          <UserCheckIcon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-montserrat">Total Students</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.totalStudents.toLocaleString()}</h3>
        </div>
      </motion.div>

      {/* Card 3: Live Active Visitors */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center gap-5 relative overflow-hidden">
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 relative">
          <ActivityIcon size={24} />
          <span className="absolute top-3 right-3 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-montserrat">Active Visitors</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.activeVisitors.toLocaleString()}</h3>
        </div>
      </motion.div>

      {/* Card 4: Pending Reviews */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center gap-5">
        <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
          <UsersIcon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-montserrat">Pending Reviews</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{stats.pendingResearch.toLocaleString()}</h3>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStats;
