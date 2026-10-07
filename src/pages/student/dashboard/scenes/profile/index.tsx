/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Mail, GraduationCap, IdCard, BadgeCheck, ArrowLeft, Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Timeline from "./components/Timeline";
import { QRCode } from "react-qrcode-logo";

const StudentProfile = ({ studentData }: { studentData: any }) => {
  const [isMobileTimelineOpen, setIsMobileTimelineOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Function to handle downloading the QR Code canvas
  const handleDownloadQR = () => {
    const canvas = document.getElementById("student-qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${studentData?.student_id || "student"}_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* 1. PROFILE HEADER (Clickable on Mobile) */}
      <div
        onClick={() => { if (window.innerWidth < 1024) setIsMobileTimelineOpen(true); }}
        className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-gray-100 
        shadow-sm cursor-pointer lg:cursor-default active:scale-[0.98] lg:active:scale-100 transition-all"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-cvsu-green-base rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
          {studentData?.first_name?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-black text-cvsu-green-base uppercase tracking-tight">
            {studentData?.first_name} {studentData?.last_name}
          </h2>
          <p className="text-cvsu-gray font-medium italic flex items-center gap-1">
            <BadgeCheck size={14} className="text-blue-500" /> Verified Student
          </p>
          <p className="lg:hidden text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Click to view timeline
          </p>
        </div>
      </div>

      {/* 2. RESPONSIVE CONTENT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE: ABOUT (30% on Desktop) */}
        <div className="w-full lg:w-[35%] space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">About</h3>
          <div className="grid grid-cols-1 gap-3">
            <ProfileInfo 
              icon={<IdCard size={18}/>} 
              label="Student ID"
              value={studentData?.student_id || studentData?.id} 
              onClick={() => setIsQRModalOpen(true)}
              isClickable={true}
            />
            <ProfileInfo icon={<GraduationCap size={18}/>} label="Course" value={studentData?.course} />
            <ProfileInfo icon={<Mail size={18}/>} label="Email" value={studentData?.email} />
          </div>
        </div>

        {/* RIGHT SIDE: TIMELINE (70% - Visible only on Desktop) */}
        <div className="hidden lg:block lg:w-[65%]">
          <Timeline student={studentData} />
        </div>
      </div>

      {/* 3. MOBILE TIMELINE MODAL */}
      {isMobileTimelineOpen && (
        <div className="fixed inset-0 z-100 bg-white animate-in slide-in-from-right duration-300 lg:hidden">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center gap-4">
            <button onClick={() => setIsMobileTimelineOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h2 className="font-bold text-lg">Timeline</h2>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-70px)] bg-cvsu-bg">
            <Timeline student={studentData} />
          </div>
        </div>
      )}

      {/* 4. QR CODE ID CARD MODAL */}
      <AnimatePresence>
        {isQRModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl p-6 bg-white rounded-3xl shadow-xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-bold text-gray-900">Student QR ID Pass</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDownloadQR}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-cvsu-green-base hover:bg-cvsu-green-dark rounded-xl transition-colors shadow-sm"
                  >
                    <Download size={16} /> Download QR
                  </button>
                  <button 
                    onClick={() => setIsQRModalOpen(false)} 
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* ID Card Display */}
              <div className="py-4 flex justify-center">
                <StudentIDCard selectedStudent={studentData} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* --- SUB-COMPONENTS --- */

const ProfileInfo = ({ icon, label, value, onClick, isClickable }: any) => (
  <div 
    onClick={onClick}
    className={`p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm transition-all duration-200
      ${isClickable ? 'cursor-pointer hover:border-cvsu-green-base hover:bg-gray-50/50 active:scale-[0.99]' : ''}`}
  >
    <div className="shrink-0 text-cvsu-green-base bg-cvsu-bg p-2 rounded-lg">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
        {label} {isClickable && <span className="text-cvsu-green-base text-[9px] lowercase font-normal italic ml-1">(click to view)</span>}
      </p>
      <p className="font-bold text-sm text-gray-900 truncate" title={value}>{value}</p>
    </div>
  </div>
);

type Props = {
  selectedStudent: any;
};

const StudentIDCard = ({ selectedStudent }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center print:flex-row print:gap-4 scale-90 md:scale-100">
      {/* ID FRONT */}
      <div id="id-front" style={{ backgroundColor: '#ffffff' }} className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white shadow-lg print:shadow-none print:border-black shrink-0">
        <div className="bg-cvsu-green-base p-2 flex items-center gap-2">
          <img src="/src/images/cvsu-logo.png" className="h-10 w-10" alt="logo" />
          <div className="leading-tight">
            <p className="text-[12px] text-white font-bold uppercase">Cavite State University</p>
            <p className="text-[10px] text-white/80 uppercase">CEIT Reading Room</p>
          </div>
        </div>
        <div className="flex-1 flex p-2 gap-3 items-center">
          <div className="w-20 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center text-[8px] text-gray-400 italic">PHOTO</div>
          <div className="flex-1">
            <p className="text-[15px] font-black text-cvsu-green-dark uppercase leading-tight">{selectedStudent?.first_name}</p>
            <p className="text-[15px] font-black text-cvsu-green-dark uppercase leading-tight">{selectedStudent?.last_name}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">{selectedStudent?.course}</p>
            <div className="pt-2">
              <p className="text-[9px] text-gray-400">STUDENT NUMBER</p>
              <p className="text-[12px] font-bold text-gray-800">{selectedStudent?.student_id || selectedStudent?.id}</p>
            </div>
          </div>
        </div>
        <div className="bg-cvsu-green-base h-1 w-full"></div>
      </div>

      {/* ID BACK */}
      <div id="id-back" style={{ backgroundColor: '#ffffff' }} className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-row bg-white shadow-lg print:shadow-none print:border-black shrink-0">
        <div className="flex-none w-1/2 flex flex-col items-center justify-center p-4 bg-cvsu-green-50/30">
          <QRCode
            id="student-qr-canvas"
            value={selectedStudent?.qr_data || selectedStudent?.student_id}
            logoImage="/src/images/cvsu-logo.png"
            qrStyle="squares"
            eyeRadius={0}
            fgColor="#000000"
            ecLevel="Q"
            size={500}
            style={{ 
              width: '120px',
              height: '120px',
              imageRendering: "pixelated" 
            }}
          />
          <p className="text-[7px] mt-2 font-black text-cvsu-green-base uppercase tracking-wider">Library Access Key</p>
        </div>
        <div className="flex-1 flex flex-col p-4 border-l border-gray-100">
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <p className="text-[8px] font-black text-cvsu-green-dark uppercase underline">Terms & Conditions</p>
            <p className="text-[5px] text-gray-600 leading-tight">• Must be presented upon entry.</p>
            <p className="text-[5px] text-gray-600 leading-tight">• Scan QR for Time-In/Out.</p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[5px] text-gray-400 italic">If found, return to: <br /><span className="font-bold text-gray-500 uppercase">CEIT Reading Room, Indang.</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;