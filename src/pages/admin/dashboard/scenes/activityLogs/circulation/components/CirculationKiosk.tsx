import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Clock, BookOpen, AlertTriangle, Calendar, User, Trash2, CheckCircle, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface BorrowedBook {
  book_id: string;
  book_title: string;
  borrow_date: string;
  due_date: string;
}

interface CurrentStudent {
  id: string;
  name: string;
  borrowedBooks: BorrowedBook[];
}

const CirculationKiosk = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isFocused, setIsFocused] = useState(document.hasFocus());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  // STAGE MANAGEMENT
  // null = Waiting for Student QR, object = Student identified, waiting for Book Barcode
  const [currentStudent, setCurrentStudent] = useState<CurrentStudent | null>(null);
  
  // Feedback states to show what just happened
  const [lastAction, setLastAction] = useState<{
    type: "borrow" | "return" | "error";
    message: string;
    bookTitle?: string;
  } | null>(null);

  // Live clock
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
      target.value = ""; // Clear input immediately for rapid scanning

      if (!scannedValue) return;
      setIsProcessing(true);
      setLastAction(null); // Reset previous operation alert

      try {
        if (!currentStudent) {
          // --- STAGE 1: IDENTIFY STUDENT ---
          const response = await axios.get(`${API_BASE_URL}/admin/get_student_kiosk_data.php?id=${scannedValue}`);
          
          if (response.data.success) {
            setCurrentStudent({
              id: response.data.student_id,
              name: response.data.name,
              borrowedBooks: response.data.borrowed_books || [] // List of books they currently hold
            });
          } else {
            setLastAction({ type: "error", message: "Student not found or invalid QR code." });
          }
        } else {
          // --- STAGE 2: CIRCULATE BOOK (BORROW OR RETURN) ---
          const response = await axios.post(`${API_BASE_URL}/admin/process_circulation.php`, {
            student_id: currentStudent.id,
            book_barcode: scannedValue
          });

          if (response.data.success) {
            setLastAction({
              type: response.data.action, // 'borrow' or 'return' from server
              message: response.data.message,
              bookTitle: response.data.book_title
            });

            // Update student's local book list with the fresh data from the server
            setCurrentStudent({
              ...currentStudent,
              borrowedBooks: response.data.updated_books
            });

            // Sync with your main table
            const channel = new BroadcastChannel("circulation_sync");
            channel.postMessage({ type: "NEW_CIRCULATION" });
          } else {
            setLastAction({ type: "error", message: response.data.message });
          }
        }
      } catch (error) {
        console.error("Scan Error:", error);
        setLastAction({ type: "error", message: "Connection error. Please try again." });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetKiosk = () => {
    setCurrentStudent(null);
    setLastAction(null);
    inputRef.current?.focus();
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
      className="h-screen w-full bg-white p-6 flex flex-col items-center justify-center text-cvsu-green-base font-dm relative overflow-hidden"
    >
      {/* HIDDEN INPUT FOR SCANNER */}
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

      {/* MAIN UI */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center ${!isFocused ? "blur-xl scale-95 opacity-50" : "scale-100"}`}>
        <div className="bg-white border-4 border-cvsu-green-base p-10 rounded-[40px] shadow-2xl w-full max-w-4xl relative">
          
          {/* PROCESSING SPINNER */}
          {isProcessing && (
            <div className="absolute top-6 right-6 animate-spin text-cvsu-green-base">
              <Clock size={24} />
            </div>
          )}

          {/* HEADER */}
          <div className="text-center mb-6">
            <BookOpen size={60} className="mx-auto mb-4 text-cvsu-green-base" />
            <h1 className="text-4xl font-black uppercase tracking-tighter">CEIT Library Circulation</h1>          
            <div className="flex flex-col items-center gap-1 mt-2">
               <div className="text-gray-500 font-bold text-sm flex items-center gap-1">
                 <Calendar size={14} /> {formatDate(currentTime)}
               </div>
               <div className="text-2xl font-black flex items-center gap-1">
                 <Clock size={22} /> {formatTime(currentTime)}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT SIDE: STUDENT INFO */}
            <div className="bg-cvsu-green-base text-white p-6 rounded-3xl shadow-inner min-h-75 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase opacity-60 tracking-widest mb-3">Current Borrower</p>
                {currentStudent ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <p className="text-3xl font-black uppercase leading-tight">{currentStudent.name}</p>
                    <p className="text-sm opacity-80 mt-1 font-bold">ID: {currentStudent.id}</p>
                    <div className="mt-3 inline-block px-4 py-1 bg-white text-cvsu-green-base rounded-full text-xs font-black uppercase">
                      Account Verified
                    </div>
                  </div>
                ) : (
                  <div className="py-12 opacity-40 flex flex-col items-center text-center">
                    <User size={48} className="mb-2" />
                    <p className="text-xl font-bold">Waiting for Student QR...</p>
                    <p className="text-xs mt-1">Scan student ID to begin</p>
                  </div>
                )}
              </div>

              {currentStudent && (
                <button 
                  onClick={resetKiosk}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-cvsu-green-dark/50 hover:bg-cvsu-green-dark rounded-xl text-xs font-bold transition-all"
                >
                  <Trash2 size={14} /> Done / Clear Session
                </button>
              )}
            </div>

            {/* RIGHT SIDE: BOOKS IN HAND & ACTION NOTIFICATIONS */}
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 min-h-75 flex flex-col">
              
              {/* OPERATION FEEDBACK */}
              {lastAction && (
                <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${
                  lastAction.type === 'borrow' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  lastAction.type === 'return' ? 'bg-green-50 text-green-700 border border-green-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {lastAction.type === 'borrow' && <CheckCircle size={20} className="shrink-0" />}
                  {lastAction.type === 'return' && <RotateCcw size={20} className="shrink-0" />}
                  {lastAction.type === 'error' && <AlertTriangle size={20} className="shrink-0" />}
                  <div>
                    <p className="text-sm font-bold">{lastAction.message}</p>
                    {lastAction.bookTitle && <p className="text-xs opacity-75 font-medium mt-0.5">"{lastAction.bookTitle}"</p>}
                  </div>
                </div>
              )}

              <p className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Possession Record</p>
              
              {!currentStudent ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <BookOpen size={32} className="mb-2" />
                  <p className="text-sm font-bold">Awaiting student scan</p>
                </div>
              ) : currentStudent.borrowedBooks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm font-bold italic">No active borrowed books.</p>
                  <p className="text-xs mt-1 text-center">Scan a book barcode to check it out.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-45 pr-2">
                  {currentStudent.borrowedBooks.map((book) => (
                    <div key={book.book_id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center animate-in fade-in">
                      <div>
                        <p className="text-xs font-bold text-gray-700 line-clamp-1">{book.book_title}</p>
                        <p className="text-[10px] text-gray-400">Due: {book.due_date}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-cvsu-green-base bg-cvsu-green-50 px-2 py-0.5 rounded-full shrink-0">
                        In Hand
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC FOOTER INSTRUCTION */}
          <div className="mt-6 text-center text-sm font-bold text-gray-500 animate-pulse">
            {!currentStudent ? (
              "➡️ STEP 1: Please scan your Student ID QR Code"
            ) : (
              "➡️ STEP 2: Please scan the Barcode/QR of the book"
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CirculationKiosk;
