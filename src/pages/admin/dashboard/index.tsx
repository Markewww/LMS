 
// src\pages\admin\dashboard\index.tsx
import { motion, AnimatePresence } from "framer-motion";

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
import AuditLogs from "@/pages/admin/dashboard/scenes/auditLogs";
import MobileStudentView from "@/pages/admin/dashboard/components/MobileStudentView";

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
    return <MobileStudentView onLogout={handleLogout} />
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

            {activeTab === "logs-audit" && admin.type === "superadmin" && (
              <AuditLogs key="audit-logs-scene" />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
