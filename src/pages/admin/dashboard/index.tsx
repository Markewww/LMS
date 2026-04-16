import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MonitorXIcon, LogOutIcon, UsersIcon, ChevronDownIcon } from "lucide-react"; // Removed Users, BookOpen, Clock
import Sidebar from "@/pages/admin/scenes/sidebar";

// Import Scenes
import AdminManagement from "@/pages/admin/dashboard/scenes/adminManagement";
import StudentManagement from "@/pages/admin/dashboard/scenes/studentManagement";
import AttendanceLog from "@/pages/admin/dashboard/scenes/activityLogs/attendance";
import CirculationLog from "@/pages/admin/dashboard/scenes/activityLogs/circulation";
import BookInventory from "@/pages/admin/dashboard/scenes/bookInventory";
import ResearchApproval from "@/pages/admin/dashboard/scenes/researchApproval";

// Dashboard Components
import AttendanceGraph from "@/pages/admin/dashboard/components/attendanceGraph";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAttendanceGraph, setShowAttendanceGraph] = useState(false);

  // Note: DashboardStats, stats, statsLoading, and fetchStats were removed 
  // because they were not being used in this version of the component.

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);

    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(loggedInUser);
      if (parsedUser.type !== "superadmin" && parsedUser.type !== "admin") {
        navigate("/login");
      } else {
        setAdmin(parsedUser);
      }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout.php`);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!admin) return null;

  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center font-dm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xs"
        >
          <div className="bg-red-50 p-6 rounded-full inline-block mb-6">
            <MonitorXIcon size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-montserrat font-black text-cvsu-green-dark uppercase leading-tight">
            Mobile Access Restricted
          </h2>
          <p className="text-cvsu-gray text-sm mt-4 leading-relaxed">
            The Admin Dashboard is not applicable for mobile screens. Please use a **Desktop** or **Laptop** to manage the system.
          </p>
          
          <button 
            onClick={handleLogout}
            className="mt-10 w-full flex items-center justify-center gap-2 bg-cvsu-green-base text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cvsu-green-dark transition-all"
          >
            <LogOutIcon size={18} /> Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cvsu-bg font-dm">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        userType={admin?.type}
      />

      <main className="ml-64 flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase">
            {activeTab.replace("-", " ")}
          </h1>
          <p className="text-cvsu-gray italic text-sm">Welcome back, {admin.id}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-90">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
               <div onClick={() => setShowAttendanceGraph(!showAttendanceGraph)} className="bg-white border-2 border-gray-50 p-6 rounded-2xl cursor-pointer hover:border-cvsu-green-base transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-cvsu-green-50 p-3 rounded-xl text-cvsu-green-base group-hover:bg-cvsu-green-base group-hover:text-white transition-colors">
                      <UsersIcon size={24} />
                    </div>

                    <div>
                      <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Attendance Analytics</h3>
                      <p className="text-xs text-gray-500 italic">Click to {showAttendanceGraph ? 'hide' : 'view'} visitor statistics</p>
                    </div>
                  </div>
                  <motion.div
                  animate={{ rotate: showAttendanceGraph ? 180 : 0 }}
                  className="text-gray-400"
                >
                  <ChevronDownIcon size={24} />
                </motion.div>
               </div>
               <AnimatePresence>
                {showAttendanceGraph && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <AttendanceGraph />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {activeTab === "admin-management" && admin?.type === "superadmin" && (
            <AdminManagement />
          )}
          {activeTab === "students" && (admin?.type === "admin" || admin?.type === "superadmin") && (
            <StudentManagement />
          )}
          {activeTab === "books" && (admin?.type === "admin" || admin?.type === "superadmin") && (
            <BookInventory />
          )}
          {activeTab === "research" && (admin?.type === "admin" || admin?.type === "superadmin") && (
            <ResearchApproval />
          )}
          {activeTab === "logs" && (admin?.type === "admin" || admin?.type === "superadmin") && (
            <div className="space-y-12">
              <AttendanceLog />
              <hr className="border-gray-100"/>
              <CirculationLog />
            </div>

          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
