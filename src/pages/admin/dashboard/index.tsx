import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "@/pages/admin/scenes/sidebar";

// Import Scenes for each tab (for now, we will just show placeholders)
import AdminManagement from "@/pages/admin/dashboard/scenes/adminManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(loggedInUser);
      if (parsedUser.type !== "superadmin" && parsedUser.type !== "admin") {
        navigate("/login");
      } else {
        setAdmin(parsedUser);
      }
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost/CEIT/src/API/logout.php");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!admin) return null;

  return (
    <div className="flex min-h-screen bg-cvsu-bg font-dm">
      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
        userType={admin?.type}
      />

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase">
            {activeTab.replace("-", " ")}
          </h1>
          <p className="text-cvsu-gray italic text-sm">Welcome back, {admin.id}</p>
        </header>

        {/* DYNAMIC CONTENT LOADED HERE */}
        <div className="bg-white rounded-2xl shadow-sm p-8 min-h-90">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Active Visitors</p>
                  <p className="text-4xl font-black text-cvsu-green-base">12</p>
               </div>
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Books Borrowed</p>
                  <p className="text-4xl font-black text-cvsu-green-base">45</p>
               </div>
               <div className="ceit-card border-t-4 border-cvsu-green-base">
                  <p className="text-xs font-bold text-cvsu-gray uppercase">Pending Approvals</p>
                  <p className="text-4xl font-black text-cvsu-green-base">3</p>
               </div>
            </div>
          )}
          
          {/* Active Tabs */}
          {activeTab === "admin-management" && admin?.type === "superadmin" && (
            <AdminManagement />
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
