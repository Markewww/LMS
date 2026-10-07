/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\hooks\useAdminDashboard.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/API/APIConfig";

export interface Admin {
  id: string;
  type: "superadmin" | "admin";
}

interface ThrottleTracker {
  id: string;
  timestamp: number;
}

const BROADCAST_CHANNEL_NAME = "attendance_sync";

export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const throttleRef = useRef<ThrottleTracker | null>(null);

  // Initialize and validate administrator account directly from session state
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

  // Monitor layout resize transitions
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Secure viewport rerouting rules
  useEffect(() => {
    if (!admin) {
      navigate("/login");
    }
  }, [admin, navigate]);

  // GLOBAL KEYSTROKE INTRUSION DETECTOR LOOP (Hardware Barcode Scanner Receiver)
  useEffect(() => {
    if (!admin) return;

    let scanBuffer = "";
    let lastKeyTime = Date.now();

    const handleGlobalKioskScan = async (e: KeyboardEvent) => {
      if ((window as any).isCirculationTabActive === true) return;

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

      if (timeDiff > 50 && e.key !== "Enter") {
        scanBuffer = "";
      }

      if (e.key === "Enter") {
        const finalScannedID = scanBuffer.trim();
        scanBuffer = ""; 
        if (!finalScannedID) return;

        if (finalScannedID.length < 4 || /[^a-zA-Z0-9-]/.test(finalScannedID)) {
          return;
        }

        const now = Date.now();
        const currentThrottle = throttleRef.current;

        // 5-SECOND MULTI-SCAN GRACE PERIOD PREVENTATIVE THRESHOLD
        if (currentThrottle && currentThrottle.id === finalScannedID) {
          if (now - currentThrottle.timestamp < 5000) {
            const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
            channel.postMessage({ type: "SCAN_THROTTLED", id: finalScannedID });
            channel.close();
            return;
          }
        }

        throttleRef.current = { id: finalScannedID, timestamp: now };

        try {
          const response = await axios.get(
            `${API_BASE_URL}/admin/log_attendance.php?id=${encodeURIComponent(finalScannedID)}`
          );
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

          if (response.data && response.data.success) {
            channel.postMessage({
              type: "SCAN_SUCCESS",
              payload: {
                name: response.data.name,
                student_id: response.data.student_id,
                status: response.data.status,
                duration: response.data.duration || null,
              },
            });
          } else {
            channel.postMessage({
              type: "SCAN_ERROR",
              message: response.data?.message || "Invalid QR Code format sequence.",
            });
          }
          channel.close();
        } catch (err) {
          console.error("Global core pipeline background communication breakdown error:", err);
        }
      } else if (e.key.length === 1) {
        scanBuffer += e.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKioskScan);
    return () => {
      window.removeEventListener("keydown", handleGlobalKioskScan);
    };
  }, [admin]);

  // Unified Sign-Out Endpoint Hook
  const handleLogout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout.php`);
    } catch {
      // Avoid crash on terminal network drop
    } finally {
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return {
    admin,
    activeTab,
    setActiveTab,
    isMobile,
    showAttendanceGraph,
    setShowAttendanceGraph,
    handleLogout,
  };
};
