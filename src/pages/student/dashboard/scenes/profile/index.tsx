import { useState } from "react";
import { Mail, GraduationCap, IdCard, BadgeCheck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Timeline from "./components/Timeline";

const StudentProfile = ({ studentData }: { studentData: any }) => {
  const [isMobileTimelineOpen, setIsMobileTimelineOpen] = useState(false);

  return (
    <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. PROFILE HEADER (Clickable on Mobile) */}
      <div 
        onClick={() => { if (window.innerWidth < 1024) setIsMobileTimelineOpen(true); }}
        className="flex items-center gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm cursor-pointer lg:cursor-default active:scale-[0.98] lg:active:scale-100 transition-all"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-cvsu-green-base rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
          {studentData?.first_name?.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-black text-cvsu-green-base uppercase tracking-tight">{studentData?.first_name} {studentData?.last_name}</h2>
          <p className="text-cvsu-gray font-medium italic flex items-center gap-1">
            <BadgeCheck size={14} className="text-blue-500" /> Verified Student
          </p>
          <p className="lg:hidden text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Click to view timeline</p>
        </div>
      </div>

      {/* 2. RESPONSIVE CONTENT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDE: ABOUT (30% on Desktop) */}
        <div className="w-full lg:w-[35%] space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">About</h3>
          <div className="grid grid-cols-1 gap-3">
            <ProfileInfo icon={<IdCard size={18}/>} label="Student ID" value={studentData?.student_id || studentData?.id} />
            <ProfileInfo icon={<GraduationCap size={18}/>} label="Course" value={studentData?.course} />
            <ProfileInfo icon={<Mail size={18}/>} label="Email" value={studentData?.email} />
          </div>
        </div>

        {/* RIGHT SIDE: TIMELINE (70% - Visible only on Desktop) */}
        <div className="hidden lg:block lg:w-[65%]">
           <Timeline student={studentData} />
        </div>
      </div>

      {/* 3. MOBILE TIMELINE MODAL (Facebook App Style) */}
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
    </motion.div>
  );
};

const ProfileInfo = ({ icon, label, value }: any) => (
  <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm">
    <div className="shrink-0 text-cvsu-green-base bg-cvsu-bg p-2 rounded-lg">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="font-bold text-sm text-gray-900 truncate" title={value}>{value}</p>
    </div>
  </div>
);

export default StudentProfile;
