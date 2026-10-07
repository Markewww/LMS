/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Clock, UserCheck, AlertTriangle, Calendar, User, ShieldAlert } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface ThrottleTracker {
  id: string;
  timestamp: number;
}

const AttendanceKiosk = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Persistent tracking reference for duplicate micro-scan prevention
  const throttleRef = useRef<ThrottleTracker | null>(null);

  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScannedUser, setLastScannedUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  // 1. Clock Tracker Live Lifecycle
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => 
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    
  const formatDate = (date: Date) => 
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Native Fullscreen & Autofocus Handler
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    }
    inputRef.current?.focus();
  };

  // 2. Track Window Focus State to preserve hidden input autofocus parameters
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    inputRef.current?.focus();

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // 3. Hardware KeyDown Event Interception with 5-Second Cooldown Guard
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      const scannedValue = target.value.trim();
      target.value = ""; // Clear input immediately so next student can scan

      if (!scannedValue) return;

      const now = Date.now();
      const currentThrottle = throttleRef.current;

      // GRACE PERIOD VALIDATION FILTER
      if (currentThrottle && currentThrottle.id === scannedValue) {
        const elapsedTime = now - currentThrottle.timestamp;
        
        // 5000 milliseconds boundary limit
        if (elapsedTime < 5000) {
          setIsThrottled(true);
          setErrorMessage("Action too fast! Please wait 5 seconds before scanning again.");
          
          setTimeout(() => {
            setIsThrottled(false);
            setErrorMessage(null);
          }, 3000);
          
          return; // Aborts API transaction instantly
        }
      }

      // Record this scan attempt timestamp into the safe reference track
      throttleRef.current = { id: scannedValue, timestamp: now };

      setIsProcessing(true);
      setErrorMessage(null);
      setIsThrottled(false);
      console.log("Scanned ID:", scannedValue);

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/log_attendance.php?id=${scannedValue}`);
        console.log("Server Response:", response.data);
        
        if (response.data.success) {
          setLastScannedUser({
            name: response.data.name,
            id: response.data.student_id,
            time: formatTime(new Date()),
            status: response.data.status,
            duration: response.data.duration || null,
          });

          const channel = new BroadcastChannel("attendance_sync");
          channel.postMessage({ type: "NEW_SCAN" });
          channel.close();
        } else {
          setLastScannedUser(null);
          setErrorMessage(response.data.message || "Student identity registry entry missing.");
          console.error("Student Not Found:", response.data.message);
        }
      } catch (error) {
        setErrorMessage("Network synchronization failure. Check database availability.");
        console.error("Scan Error:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={enterFullscreen}
      className="h-screen w-full bg-white p-10 flex flex-col items-center justify-center text-cvsu-green-base font-dm relative overflow-hidden cursor-pointer"
    >
      {/* HIDDEN INPUT: Targeted by the 2D Scanner */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        autoFocus
        onKeyDown={handleKeyDown}
        onBlur={() => !isFocused && inputRef.current?.focus()}
      />

      {/* DISCONNECTED WARNING OVERLAY */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-yellow-600/95 text-white animate-in fade-in duration-300">
          <AlertTriangle size={120} className="mb-6 animate-bounce" />
          <h2 className="text-6xl font-black uppercase mb-4 text-center">Scanner Disconnected</h2>
          <p className="text-2xl font-bold">Please click the screen to resume scanning</p> 
        </div>
      )}

      {/* MAIN UI PANEL CANVAS WRAPPER */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center ${!isFocused ? "blur-xl scale-95 opacity-50" : "scale-100"}`}>
        <div 
          className={`bg-white border-4 p-12 rounded-[40px] shadow-2xl text-center w-full max-w-2xl relative cursor-default transition-colors duration-300 ${
            isThrottled ? "border-amber-500" : "border-cvsu-green-base"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* PROCESSING SPINNER */}
          {isProcessing && (
            <div className="absolute top-6 right-6 animate-spin text-cvsu-green-base">
              <Clock size={24} />
            </div>
          )}

          {isThrottled ? (
            <ShieldAlert size={80} className="mx-auto mb-6 text-amber-500 animate-bounce" />
          ) : (
            <UserCheck size={80} className="mx-auto mb-6 text-cvsu-green-base" />
          )}

          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">CEIT Reading Room</h1>
          
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="flex items-center gap-2 text-gray-500 font-bold">
              <Calendar size={18} /> {formatDate(currentTime)}
            </div>
            <div className="flex items-center gap-2 text-3xl font-black text-gray-800">
              <Clock size={28} /> {formatTime(currentTime)}
            </div>
          </div>

          <div className={`text-white p-8 rounded-3xl shadow-inner min-h-50 flex flex-col justify-center relative overflow-hidden transition-colors duration-300 ${
            isThrottled ? "bg-amber-500" : "bg-cvsu-green-base"
          }`}>
            <p className="text-sm font-bold uppercase opacity-60 tracking-widest mb-4">
              {isThrottled ? "System Warning" : "Latest Attendance"}
            </p>

            {isThrottled ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <p className="text-3xl font-black leading-tight uppercase tracking-tight">
                  SCAN BLOCKED
                </p>
                <div className="mt-4 inline-block bg-white text-amber-600 px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase shadow-sm">
                  COOLDOWN ACTIVE
                </div>
              </div>
            ) : lastScannedUser ? (
              <div key={lastScannedUser.id + lastScannedUser.time} className="animate-in fade-in zoom-in duration-500">
                <p className="text-4xl font-black leading-tight uppercase tracking-tight">
                  {lastScannedUser.name}
                </p>
                
                {/* SHOW THE STATUS DYNAMICALLY */}
                <div className={`mt-4 inline-block px-6 py-2 rounded-full text-lg font-black tracking-widest uppercase ${
                  lastScannedUser.status === 'TIMED IN' || lastScannedUser.status === 'IN'
                    ? 'bg-white text-cvsu-green-base shadow-sm' 
                    : 'bg-yellow-400 text-black shadow-sm'
                }`}>
                  {lastScannedUser.status}
                </div>
                
                <p className="text-sm opacity-80 mt-4 font-mono font-bold tracking-wider">
                  ID: {lastScannedUser.id}
                </p>

                {lastScannedUser.duration && (
                  <p className="mt-2 text-sm font-bold italic bg-black/10 py-1 px-3 rounded-lg border border-white/5 inline-block">
                    Stay Duration: {lastScannedUser.duration}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 opacity-40 flex flex-col items-center justify-center">
                <User size={48} className="mb-2" />
                <p className="text-2xl font-bold italic">Waiting for scan...</p>
              </div>
            )}
          </div>

          {/* Runtime Error / Grace Period Warning Banner */}
          {errorMessage && (
            <div className={`mt-4 p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-xs animate-in slide-in-from-top-2 duration-200 ${
                isThrottled 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-red-50 border-red-100 text-red-600"
            }`}>
              <AlertTriangle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceKiosk;