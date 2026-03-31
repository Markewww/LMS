import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Search, 
  History, 
  UserCircle, 
  LogOut,
  Bell,
  ChevronRight
} from "lucide-react";


import Sidebar from "@/pages/student/scenes/sidebar";
import StudentBookCatalog from "./scenes/bookCatalog";
import MyBorrowingHistory from "./scenes/borrowingHistory";
import StudentProfile from "./scenes/profile";
import ResearchPostModal from "./components/ResearchPostModal";
import { API_BASE_URL } from "@/API/APIConfig";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAboveMediumScreens, setIsAboveMediumScreens] = useState(window.innerWidth > 768);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const fetchFullProfile = async (studentId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student/get_profile.php?student_id=${studentId}`
      );
      setStudent(response.data);
    } catch (error) {
      console.error("Error syncing profile:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsAboveMediumScreens(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(loggedInUser);
      if (parsedUser.type !== "student") {
        navigate("/login");
      } else {
        fetchFullProfile(parsedUser.id);
      }
    }
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout.php`);
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!student) return null;

  return (
    <div 
      className="flex min-h-screen bg-cvsu-bg font-dm">
      <ResearchPostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        student={student}
      />
      {/* DESKTOP SIDEBAR */}
      {isAboveMediumScreens && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      )}

      <main className={`flex-1 flex flex-col ${isAboveMediumScreens ? "ml-64" : "ml-0"}`}>
        
        {/* MOBILE HEADER & TABS (Facebook Style) */}
        {!isAboveMediumScreens && (
          <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h1 className="text-xl font-black text-cvsu-green-base uppercase tracking-tighter">CEIT Library</h1>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Bell size={20} /></button>
              </div>
            </div>
            
            <div className="flex w-full">
              <MobileTab icon={<LayoutDashboard size={24}/>} id="dashboard" active={activeTab} onClick={setActiveTab} />
              <MobileTab icon={<Search size={24}/>} id="catalog" active={activeTab} onClick={setActiveTab} />
              <MobileTab icon={<History size={24}/>} id="history" active={activeTab} onClick={setActiveTab} />
              <MobileTab icon={<UserCircle size={24}/>} id="profile" active={activeTab} onClick={setActiveTab} />
            </div>
          </div>
        )}

        <div className="p-4 md:p-8 flex-1">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}>
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-cvsu-green-base rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {student?.first_name?.charAt(0)}
                </div>
                <button 
                  onClick={() => setIsPostModalOpen(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2.5 rounded-full text-sm transition-colors"
                >
                  Submit a new project...
                </button>
              </div>
            </div>
          )}

          {activeTab === "catalog" && <StudentBookCatalog />}
          {activeTab === "history" && <MyBorrowingHistory />}
          
          {/* PROFILE TAB WITH LOGOUT AT THE BOTTOM */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <StudentProfile studentData={student} />
              
              {/* MOBILE ONLY LOGOUT BUTTON (FB Menu Style) */}
              {!isAboveMediumScreens && (
                <div className="mt-8 space-y-2">
                  <p className="px-2 text-xs font-bold text-cvsu-gray uppercase tracking-widest">Account Actions</p>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl text-red-500 shadow-sm active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <LogOut size={20} />
                      </div>
                      <span className="font-bold">Log Out</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                </div>
              )}
            </div>
          )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const MobileTab = ({ icon, id, active, onClick }: any) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex-1 flex flex-col items-center py-3 border-b-3 transition-all ${
      active === id 
      ? "border-cvsu-green-base text-cvsu-green-base" 
      : "border-transparent text-gray-400"
    }`}
  >
    {icon}
  </button>
);

export default StudentDashboard;
