import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Clock, UserCheck, AlertTriangle, Calendar, User } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

const AttendanceKiosk = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastScannedUser, setLastScannedUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      const scannedValue = target.value.trim();
      target.value = ""; // Clear input immediately so next student can scan

      if (!scannedValue) return;

      setIsProcessing(true);
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
        } else {
          console.error("Student Not Found:", response.data.message);
        }
      } catch (error) {
        console.error("Scan Error:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen();
    inputRef.current?.focus();
  };


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

  return (
    <div 
      ref={containerRef} 
      onClick={enterFullscreen} 
      className="h-screen w-full bg-white p-10 flex flex-col items-center justify-center text-cvsu-green-base font-dm relative overflow-hidden"
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
      {/* DISCONNECTED WARNING */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-yellow-600/95 text-white animate-in fade-in duration-300">
          <AlertTriangle size={120} className="mb-6 animate-bounce" />
          <h2 className="text-6xl font-black uppercase mb-4 text-center">Scanner Disconnected</h2>
          <p className="text-2xl font-bold">Please click the screen to resume scanning</p>
        </div>
      )}
      {/* MAIN UI: Only blurs if window focus is lost, NOT during processing */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center ${!isFocused ? "blur-xl scale-95 opacity-50" : "scale-100"}`}>
        <div className="bg-white border-4 border-cvsu-green-base p-12 rounded-[40px] shadow-2xl text-center w-full max-w-2xl relative">
          {/* PROCESSING SPINNER */}
          {isProcessing && (
            <div className="absolute top-6 right-6 animate-spin text-cvsu-green-base">
              <Clock size={24} />
            </div>
          )}
          <UserCheck size={80} className="mx-auto mb-6 text-cvsu-green-base" />
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter">CEIT Reading Room</h1>          
          <div className="flex flex-col items-center gap-2 mb-10">
             <div className="flex items-center gap-2 text-gray-500 font-bold">
               <Calendar size={18} /> {formatDate(currentTime)}
             </div>
             <div className="flex items-center gap-2 text-3xl font-black">
               <Clock size={28} /> {formatTime(currentTime)}
             </div>
          </div>
          <div className="bg-cvsu-green-base text-white p-8 rounded-3xl shadow-inner min-h-50 flex flex-col justify-center">
            <p className="text-sm font-bold uppercase opacity-60 tracking-widest mb-4">Latest Attendance</p>
            {lastScannedUser ? (
              <div key={lastScannedUser.id + lastScannedUser.time} className="animate-in fade-in zoom-in duration-500">
                <p className="text-4xl font-black leading-tight uppercase">{lastScannedUser.name}</p>
              
                {/* SHOW THE STATUS DYNAMICALLY */}
                <div className={`mt-4 inline-block px-6 py-2 rounded-full text-lg font-black tracking-widest ${
                  lastScannedUser.status === 'TIMED IN' ? 'bg-white text-cvsu-green-base' : 'bg-yellow-400 text-black'
                }`}>
                  {lastScannedUser.status}
                </div>
              
                <p className="text-sm opacity-80 mt-4 font-bold tracking-widest">ID: {lastScannedUser.id}</p>
              
                {/* If Timed Out, show how long they stayed */}
                {lastScannedUser.duration && (
                  <p className="mt-2 text-sm font-bold italic">Stay Duration: {lastScannedUser.duration}</p>
                )}
              </div>
            ) : (
              <div className="py-6 opacity-40 flex flex-col items-center">
                <User size={48} className="mb-2" />
                <p className="text-2xl font-bold italic">Waiting for scan...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceKiosk;
