import { 
  LayoutDashboard, 
  Search, 
  History, 
  UserCircle, 
  LogOut 
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
};

const StudentSidebar = ({ activeTab, setActiveTab, handleLogout }: Props) => {
  // Define menu items specific to the Student experience
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "catalog", label: "Book Catalog", icon: Search },
    { id: "history", label: "My History", icon: History },
    { id: "profile", label: "My Profile", icon: UserCircle },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* BRANDING HEADER */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tighter leading-tight">
          CEIT READING ROOM 
          <span className="text-[10px] block text-cvsu-gray font-bold tracking-widest mt-1">
            Student Portal
          </span>
        </h2>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all ${
                isActive 
                  ? "bg-cvsu-green-base text-white shadow-md shadow-cvsu-green-base/20" 
                  : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* LOGOUT SECTION */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm text-red-500 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
