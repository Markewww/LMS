import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { MonitorXIcon, LogOutIcon } from "lucide-react";
import Sidebar from "@/pages/admin/scenes/sidebar";

// Import Scenes for each tab (for now, we will just show placeholders)
import AdminManagement from "@/pages/admin/dashboard/scenes/adminManagement";
import StudentManagement from "@/pages/admin/dashboard/scenes/studentManagement";
import AttendanceLog from "@/pages/admin/dashboard/scenes/activityLogs/attendance";
import CirculationLog from "@/pages/admin/dashboard/scenes/activityLogs/circulation";
import BookInventory from "@/pages/admin/dashboard/scenes/bookInventory";
import ResearchApproval from "@/pages/admin/dashboard/scenes/researchApproval";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  // --- MOBILE RESTRICTION VIEW ---
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
      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        userType={admin?.type}
      />

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase">
            {activeTab.replace("-", " ")}
          </h1>
          <p className="text-cvsu-gray italic text-sm">Welcome back, {admin.id}</p>
        </header>

        {/* DYNAMIC CONTENT LOADED HERE */}
        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-90">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Active Visitors</p>
                  <p className="text-4xl font-black text-cvsu-green-base">12</p>
               </div>
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Books Borrowed</p>
                  <p className="text-4xl font-black text-cvsu-green-base">45</p>
               </div>
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Pending Approvals</p>
                  <p className="text-4xl font-black text-cvsu-green-base">3</p>
               </div>
            </div>
          )}
          
          {/* Active Tabs */}
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
