/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\index.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MonitorXIcon, 
  LogOutIcon, 
  UsersIcon, 
  ChevronDownIcon 
} from "lucide-react";
import Sidebar from "@/pages/admin/scenes/sidebar";

// Import Scenes
import AdminManagement from "@/pages/admin/dashboard/scenes/adminManagement";
import StudentManagement from "@/pages/admin/dashboard/scenes/studentManagement";
import BookInventory from "@/pages/admin/dashboard/scenes/bookInventory";
import ResearchApproval from "@/pages/admin/dashboard/scenes/researchApproval";
import AccountSettings from "@/components/shared/AccountSettings";
import AttendanceLog from "@/pages/admin/dashboard/scenes/activityLogs/attendance";
import CirculationLog from "@/pages/admin/dashboard/scenes/activityLogs/circulation";

// Dashboard Components
import AttendanceGraph from "@/pages/admin/dashboard/components/attendanceGraph";
import DashboardStats from "@/pages/admin/dashboard/components/DashboardStats";
import DashboardAnnouncements from "@/pages/admin/dashboard/components/DashboardAnnouncements";

import { API_BASE_URL } from "@/API/APIConfig";

interface Admin {
  id: string;
  type: "superadmin" | "admin";
}

interface ThrottleTracker {
  id: string;
  timestamp: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const throttleRef = useRef<ThrottleTracker | null>(null);

  const [admin] = useState<Admin | null>(() => {
    try {
      const loggedInUser = localStorage.getItem("user");
      if (!loggedInUser) return null;
      const parsedUser = JSON.parse(loggedInUser) as Partial<Admin>;
      if (parsedUser.type !== "superadmin" && parsedUser.type !== "admin") {
        return null;
      }
      return {
        id: parsedUser.id ?? "",
        type: parsedUser.type as Admin["type"],
      };
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("dashboard-analytics");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showAttendanceGraph, setShowAttendanceGraph] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!admin) {
      navigate("/login");
    }
  }, [admin, navigate]);

  // GLOBAL KEYSTROKE INTRUSION DETECTOR LOOP (Decoupled Multi-Screen Scanner Receiver)
  useEffect(() => {
    let scanBuffer = "";
    let lastKeyTime = Date.now();

    const handleGlobalKioskScan = async (e: KeyboardEvent) => {
      // 1. Terminate thread loops if librarian is navigating Book Circulation layouts
      if ((window as any).isCirculationTabActive === true) return;

      // 2. Terminate background capture hooks if admin text cursor is focused inside form components
      const activeElement = document.activeElement;
      if (
        activeElement && 
        (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
      ) {
        return; 
      }

      const currentTimeStamp = Date.now();
      const timeDiff = currentTimeStamp - lastKeyTime;
      lastKeyTime = currentTimeStamp;

      // Cleans data chunks if entry boundaries simulate manual human keyboard writing speeds
      if (timeDiff > 50 && e.key !== "Enter") {
        scanBuffer = "";
      }

      // Hardware weapon completes transaction pipeline mapping when Enter character drops
      if (e.key === "Enter") {
        const finalScannedID = scanBuffer.trim();
        scanBuffer = ""; // Reset terminal array memory state

        if (!finalScannedID) return;

        // Guard against stray/malformed data entries
        if (finalScannedID.length < 4 || /[^a-zA-Z0-9-]/.test(finalScannedID)) {
          return;
        }

        const now = Date.now();
        const currentThrottle = throttleRef.current;

        // 5-SECOND MULTI-SCAN GRACE PERIOD PREVENTATIVE THRESHOLD
        if (currentThrottle && currentThrottle.id === finalScannedID) {
          if (now - currentThrottle.timestamp < 5000) {
            const channel = new BroadcastChannel("attendance_sync");
            channel.postMessage({ type: "SCAN_THROTTLED", id: finalScannedID });
            channel.close();
            return;
          }
        }

        throttleRef.current = { id: finalScannedID, timestamp: now };

        // BACKGROUND ENDPOINT LOG REQUEST COMMID ROAD
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/log_attendance.php?id=${finalScannedID}`);
          const channel = new BroadcastChannel("attendance_sync");
          
          if (response.data && response.data.success) {
            channel.postMessage({
              type: "SCAN_SUCCESS",
              payload: {
                name: response.data.name,
                student_id: response.data.student_id,
                status: response.data.status,
                duration: response.data.duration || null,
              }
            });
          } else {
            channel.postMessage({
              type: "SCAN_ERROR",
              message: response.data?.message || "Invalid QR Code format sequence."
            });
          }
          channel.close();
        } catch (err) {
          console.error("Global core pipeline background communication breakdown error:", err);
        }
        return;
      }

      if (e.key.length === 1) {
        scanBuffer += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKioskScan);
    return () => {
      window.removeEventListener("keydown", handleGlobalKioskScan);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout.php`);
    } catch {
      // Avoid crash on terminal network drop
    } finally {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
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
          <h1 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tight">
            {activeTab.replace("-", " ")}
          </h1>
          <p className="text-cvsu-gray italic text-sm">Welcome back, {admin.id}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-40">
          
          {/* SUB-TAB 1: ANALYTICS & METRICS GRAPH VIEW */}
          {activeTab === "dashboard-analytics" && (
            <div className="space-y-6">
              <DashboardStats />
              
              {/* Collapsible Trigger Box for Attendance Visual Representation Chart */}
              <div
                onClick={() => setShowAttendanceGraph(!showAttendanceGraph)}
                className="bg-white border-2 border-gray-50 p-6 rounded-2xl cursor-pointer hover:border-cvsu-green-base transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-cvsu-green-50 p-3 rounded-xl text-cvsu-green-base group-hover:bg-cvsu-green-base group-hover:text-white transition-colors">
                    <UsersIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Attendance Analytics</h3>
                    <p className="text-xs text-gray-500 italic">
                      Click to {showAttendanceGraph ? 'hide' : 'view'} visitor statistics
                    </p>
                  </div>
                </div>
                
                <motion.div
                  animate={{ rotate: showAttendanceGraph ? 180 : 0 }}
                  className="text-gray-400"
                >
                  <ChevronDownIcon size={24} />
                </motion.div>
              </div>

              {/* Attendance Traffic Rendering Canvas Wrapper */}
              <AnimatePresence>
                {showAttendanceGraph && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <AttendanceGraph />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SUB-TAB 2: BULLETIN & ANNOUNCEMENTS VIEW CONTAINER */}
          {activeTab === "dashboard-bulletin" && (
            <div className="space-y-6">
              <DashboardAnnouncements currentAdminId={admin.id} />
            </div>
          )}

          {/* CORE CORE TAB SCENES REDIRECT MATRIX ROUTING VIEWPORTS */}
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

          {activeTab === "logs-attendance" && <AttendanceLog key="attendance-logs" />}
          {activeTab === "logs-circulation" && <CirculationLog key="circulation-logs" />}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <AccountSettings key="settings" />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

