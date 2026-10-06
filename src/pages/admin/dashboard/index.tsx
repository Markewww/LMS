/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\index.tsx
import { motion, AnimatePresence } from "framer-motion";
import { MonitorXIcon, LogOutIcon } from "lucide-react";

// Context & Navigation Sidebar
import Sidebar from "@/pages/admin/scenes/sidebar";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

// Sub-Scene Administrative Modules
import AdminManagement from "@/pages/admin/dashboard/scenes/adminManagement";
import StudentManagement from "@/pages/admin/dashboard/scenes/studentManagement";
import BookInventory from "@/pages/admin/dashboard/scenes/bookInventory";
import ResearchApproval from "@/pages/admin/dashboard/scenes/researchApproval";
import AccountSettings from "@/components/shared/AccountSettings";
import AttendanceLog from "@/pages/admin/dashboard/scenes/activityLogs/attendance";
import CirculationLog from "@/pages/admin/dashboard/scenes/activityLogs/circulation";

// Shared Dashboard Components & Injected Modular Tabs
import DashboardAnalytics from "@/pages/admin/dashboard/components/DashboardAnalytics";
import DashboardAnnouncements from "@/pages/admin/dashboard/components/DashboardAnnouncements";

const AdminDashboard = () => {
  const {
    admin,
    activeTab,
    setActiveTab,
    isMobile,
    handleLogout,
  } = useAdminDashboard();

  if (!admin) return null;

  // --- CASE A: MOBILE ACCESS PROTECTION BARRIER ACCESS SHIELD ---
  if (isMobile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-10 text-center font-dm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xs"
        >
          <div className="bg-red-50 p-6 rounded-full inline-block mb-6 text-red-500">
            <MonitorXIcon size={48} />
          </div>
          <h2 className="text-2xl font-montserrat font-black text-cvsu-green-dark uppercase leading-tight">
            Mobile Access Restricted
          </h2>
          <p className="text-cvsu-gray text-sm mt-4 leading-relaxed font-medium">
            The Admin Dashboard is not optimized for mobile screens. Please use a **Desktop** or **Laptop** workstation to manage the system.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-10 w-full flex items-center justify-center gap-2 bg-cvsu-green-base text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-cvsu-green-dark transition-all shadow-md cursor-pointer group"
          >
            <LogOutIcon size={18} className="group-hover:translate-x-0.5 transition-transform" />
            Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  // --- CASE B: STANDARD DESKTOP SCREEN VIEW ROUTER ---
  return (
    <div className="flex min-h-screen bg-cvsu-bg font-dm text-left select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        userType={admin.type}
      />
      
      <main className="ml-64 flex-1 p-8 min-w-0">
        <header className="mb-8">
          <h1 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tight">
            {activeTab.replace("-", " ")}
          </h1>
          <p className="text-cvsu-gray italic text-sm font-medium mt-0.5">
            Welcome back, admin signature session log: <span className="font-mono font-bold not-italic text-cvsu-green-dark">{admin.id}</span>
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-40 border border-gray-100/50">
          <AnimatePresence mode="wait">
            
            {/* SUB-TAB 1: UNLOCKED MODULARIZED ANALYTICS VIEW */}
            {activeTab === "dashboard-analytics" && <DashboardAnalytics key="analytics-scene-tab" />}

            {/* SUB-TAB 2: BULLETIN BOARD ANNOUNCEMENTS VIEW CONTAINER */}
            {activeTab === "dashboard-bulletin" && (
              <motion.div
                key="bulletin-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DashboardAnnouncements currentAdminId={admin.id} />
              </motion.div>
            )}

            {/* CORE MODULE CONTROL VIEWPORT ROUTING SWITCH SYSTEM */}
            {activeTab === "admin-management" && admin.type === "superadmin" && (
              <AdminManagement key="admin-mgmt-scene" />
            )}
            
            {activeTab === "students" && (
              <StudentManagement key="student-mgmt-scene" />
            )}
            
            {activeTab === "books" && (
              <BookInventory key="book-inventory-scene" />
            )}
            
            {activeTab === "research" && (
              <ResearchApproval key="research-approval-scene" />
            )}
            
            {activeTab === "logs-attendance" && (
              <AttendanceLog key="attendance-logs-scene" />
            )}
            
            {activeTab === "logs-circulation" && (
              <CirculationLog key="circulation-logs-scene" />
            )}
            
            {activeTab === "settings" && (
              <div key="settings-scene" className="w-full max-w-xl text-left">
                <AccountSettings />
              </div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
