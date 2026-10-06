/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\scenes\activityLogs\circulation\components\CirculationKiosk.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { 
  Clock, BookOpen, AlertTriangle, Calendar, User, 
  Trash2, CheckCircle, RotateCcw, FileText 
} from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import KioskToolbar from "./KioskToolbar";

interface BorrowedAsset {
  asset_id: string;
  asset_title: string;
  asset_type: "book" | "research";
  borrow_date: string;
  due_date: string;
}

interface CurrentStudent {
  id: string;
  name: string;
  borrowedAssets: BorrowedAsset[];
}

const CirculationKiosk = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  // STAGE MANAGEMENT: null = Wait for Student QR, object = Student identified, wait for Book/Research scan
  const [currentStudent, setCurrentStudent] = useState<CurrentStudent | null>(null);
  
  // Feedback alerts state parameters
  const [lastAction, setLastAction] = useState<{
    type: "borrow" | "return" | "error";
    message: string;
    assetTitle?: string;
  } | null>(null);

  // 1. Clock Tracker Live Lifecycle Loop
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => 
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    
  const formatDate = (date: Date) => 
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Native Fullscreen & Focus Anchor
  const enterFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    }
    inputRef.current?.focus();
  };

  // 2. Track Window Focus State to preserve hidden tracking elements focus anchors
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

  // Set structural control flag to true to mute attendance interceptors on parent frame layout
  useEffect(() => {
    (window as any).isCirculationTabActive = true;
    return () => {
      (window as any).isCirculationTabActive = false;
    };
  }, []);

  // --- SEPARATE SEGMENT 1: IDENTIFY CEIT BORROWER STUDENT REGISTRY ---
  const executeStudentIdentification = async (studentIdCode: string) => {
    setIsProcessing(true);
    setLastAction(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_student_kiosk_data.php?id=${studentIdCode}`);
      
      if (response.data.success) {
        setCurrentStudent({
          id: response.data.student_id,
          name: response.data.name,
          borrowedAssets: response.data.borrowed_assets || [] 
        });
      } else {
        setLastAction({ type: "error", message: response.data.message || "Student QR not registered or invalid." });
      }
    } catch (error) {
      console.error("Student Lookup Error:", error);
      setLastAction({ type: "error", message: "Network failure link layer disruption. Please retry scan." });
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // --- SEPARATE SEGMENT 2: CIRCULATE ASSET CODE (BORROW OR RETURN TRIGGER) ---
  const executeAssetCirculation = async (assetTrackingCode: string) => {
    if (!currentStudent) return;
    setIsProcessing(true);
    setLastAction(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/process_circulation.php`, {
        student_id: currentStudent.id,
        asset_code: assetTrackingCode
      });

      if (response.data.success) {
        setLastAction({
          type: response.data.action, // 'borrow' or 'return' evaluated on server
          message: response.data.message,
          assetTitle: response.data.asset_title
        });

        // Re-populate borrower asset lists payload using updated states returned by the backend
        setCurrentStudent({
          ...currentStudent,
          borrowedAssets: response.data.updated_assets || []
        });

        // Synchronize parent Activity Log datagrids automatically
        const channel = new BroadcastChannel("circulation_sync");
        channel.postMessage({ type: "NEW_CIRCULATION" });
        channel.close();
      } else {
        setLastAction({ type: "error", message: response.data.message || "Failed to process asset transaction workflow." });
      }
    } catch (error) {
      console.error("Circulation Processing Error:", error);
      setLastAction({ type: "error", message: "Network failure link layer disruption. Please retry scan." });
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // BRIDGED MANUAL OVERRIDE ROUTER (Used by KioskToolbar form submit)
  const handleManualFormRoute = (manualTextString: string) => {
    const fullyCleanedQR = manualTextString.replace(/[\n\r\t]/g, "").trim();
    if (!currentStudent) {
      executeStudentIdentification(fullyCleanedQR);
    } else {
      executeAssetCirculation(fullyCleanedQR);
    }
  };

  // Hardware KeyDown Scanner Laser Input Event Capturer
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.currentTarget;
      const scannedValue = target.value.trim();
      target.value = ""; // Instantly flushes input text space for rapid scanning success chains

      if (!scannedValue) return;

      const fullyCleanedQR = scannedValue.replace(/[\n\r\t]/g, "").trim();
      if (!currentStudent) {
        executeStudentIdentification(fullyCleanedQR);
      } else {
        executeAssetCirculation(fullyCleanedQR);
      }
    }
  };

  const resetKiosk = () => {
    setCurrentStudent(null);
    setLastAction(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div
      ref={containerRef}
      onClick={enterFullscreen}
      className="w-full bg-white p-6 flex flex-col items-center justify-center text-cvsu-green-base font-dm relative select-none"
    >
      {/* HIDDEN INPUT FOR PHYSICAL HARDWARE SCANNER CAPTURING SPACES */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none z-0"
        autoFocus
        onKeyDown={handleKeyDown}
        onBlur={() => !isFocused && inputRef.current?.focus()}
      />

      {/* WINDOW BLUR SCANNER DISCONNECTED OVERLAY NOTICE BLOCK */}
      {!isFocused && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-yellow-600/95 text-white animate-in fade-in duration-300">
          <AlertTriangle size={100} className="mb-6 animate-bounce" />
          <h2 className="text-5xl font-black uppercase mb-3 text-center tracking-tight">Kiosk Unfocused</h2>
          <p className="text-xl font-bold">Please click anywhere on this window to reactivate the laser array scanner.</p>
        </div>
      )}

      {/* CORE DISPLAY BOARD SECTION CANVAS */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center gap-6 ${!isFocused ? "blur-md scale-98 opacity-40" : "scale-100"}`}>
        <div className="bg-white border-4 border-cvsu-green-base p-10 rounded-[40px] shadow-2xl w-full max-w-5xl relative space-y-6">
          
          {/* RUNTIME LOADING PROCESSING OVERLAY SPINNER */}
          {isProcessing && (
            <div className="absolute top-8 right-8 animate-spin text-cvsu-green-base">
              <Clock size={26} />
            </div>
          )}

          {/* APPLICATION IDENTITY BRANDING BAR */}
          <div className="text-center border-b border-gray-100 pb-6">
            <BookOpen size={52} className="mx-auto mb-3 text-cvsu-green-base" />
            <h1 className="text-3xl font-montserrat font-black uppercase tracking-tight text-cvsu-green-dark">
              CEIT Library Circulation Gateway
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3 text-gray-700 font-bold text-xs font-mono">
              <div className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(currentTime)}</div>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="flex items-center gap-1.5 text-base text-gray-900 font-black"><Clock size={16} /> {formatTime(currentTime)}</div>
            </div>
          </div>

          {/* INTEGRATED MANUAL FORM CONTROL TOOLBAR OVERRIDE */}
          <KioskToolbar 
            currentStudent={currentStudent}
            onManualSubmit={handleManualFormRoute}
            onResetSession={resetKiosk}
          />

          {/* SPLIT COLUMN INTERFACE LAYOUT TRACK GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            
            {/* LEFT COLUMN PANEL: BORROWER PROFILE CONTAINER MATRIX */}
            <div className="bg-cvsu-green-base text-white p-6 rounded-3xl shadow-inner min-h-[320px] flex flex-col justify-between relative overflow-hidden">
              <div>
                                <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-4">Verified Borrower Registry</p>
                {currentStudent ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                      <p className="text-3xl font-montserrat font-black uppercase leading-tight tracking-tight">
                        {currentStudent.name}
                      </p>
                      <p className="text-sm opacity-80 mt-1 font-mono font-bold">STUDENT LOG NUMBER: {currentStudent.id}</p>
                    </div>
                    <span className="inline-block px-4 py-1.5 bg-white text-cvsu-green-base rounded-full text-xs font-black uppercase shadow-sm tracking-wider">
                      Account Status: ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="py-14 opacity-50 flex flex-col items-center text-center space-y-3">
                    <User size={56} className="animate-pulse" />
                    <div>
                      <p className="text-xl font-bold">Awaiting Student Registry Token</p>
                      <p className="text-xs opacity-70 mt-1 max-w-xs leading-normal">
                        Scan the student's unique identity QR code card layout to fetch their ledger account histories.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {currentStudent && (
                <button
                  type="button"
                  onClick={resetKiosk}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 bg-cvsu-green-dark/40 hover:bg-cvsu-green-dark text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <Trash2 size={14} /> Close Transaction / Flush Session
                </button>
              )}
            </div>

            {/* RIGHT COLUMN PANEL: LEDGER LISTINGS AND TRANSACTION ALERT FEEDBACK */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-h-[320px] flex flex-col justify-between font-dm">
              <div className="w-full space-y-4 flex-1 flex flex-col">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Ledger Holdings</p>
                
                {/* INTERACTIVE SERVER OPERATION TRANSACTIONS FEEDBACK CARDS */}
                {lastAction && (
                  <div className={`p-4 rounded-xl flex items-start gap-3 border animate-in slide-in-from-top-3 duration-200 text-xs leading-normal mb-2 ${
                    lastAction.type === 'borrow' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    lastAction.type === 'return' ? 'bg-green-50 text-green-800 border-green-200' :
                    'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {lastAction.type === 'borrow' && <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />}
                    {lastAction.type === 'return' && <RotateCcw size={18} className="text-green-600 shrink-0 mt-0.5" />}
                    {lastAction.type === 'error' && <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-bold">{lastAction.message}</p>
                      {lastAction.assetTitle && (
                        <p className="font-medium opacity-80 mt-1 italic uppercase tracking-tighter">
                          Target Title: "{lastAction.assetTitle}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* LEDGER MANUSCRIPT HOLDINGS ITERATION LOOP */}
                <div className="flex-1 flex flex-col justify-center">
                  {!currentStudent ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 opacity-60 text-center space-y-2">
                      <BookOpen size={36} />
                      <p className="text-sm font-bold">Awaiting student verification credentials...</p>
                    </div>
                  ) : currentStudent.borrowedAssets.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-center space-y-1">
                      <p className="text-sm font-bold italic">No active book or research borrowings on record.</p>
                      <p className="text-xs max-w-xs text-gray-400">Scan any catalog card tracking identifier tag to assign a new checkout item asset.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[190px] pr-2 custom-scrollbar w-full">
                      {currentStudent.borrowedAssets.map((asset) => (
                        <div key={asset.asset_id} className="bg-white p-3.5 rounded-xl border border-gray-100 flex justify-between items-center shadow-xs hover:border-gray-200 transition-colors animate-in fade-in">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${asset.asset_type === 'research' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {asset.asset_type === 'research' ? <FileText size={16} /> : <BookOpen size={16} />}
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-800 line-clamp-1 uppercase font-montserrat tracking-tight">{asset.asset_title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Tracking ID: <span className="font-mono font-bold text-gray-500">{asset.asset_id}</span> • Due: {asset.due_date}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border tracking-wider ${
                            asset.asset_type === 'research' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {asset.asset_type === 'research' ? 'Manuscript' : 'Book'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CONTEXT INSTRUCTIONAL STEP BADGE ANIMATION BAR */}
          <div className="mt-4 text-center text-sm font-bold text-cvsu-gray animate-pulse tracking-wide font-montserrat uppercase border-t border-gray-50 pt-4">
            {!currentStudent ? (
              <span className="text-cvsu-green-base bg-cvsu-green-50 px-4 py-1.5 rounded-full">
                Step 1: Please scan Student Library ID Badge QR Code
              </span>
            ) : (
              <span className="text-cvsu-green-base bg-cvsu-green-50 px-4 py-1.5 rounded-full">
                Step 2: Scan Book Barcode or Research QR Code tracking tag asset
              </span>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CirculationKiosk;
