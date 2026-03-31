import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  BookOpenIcon, 
  ClipboardListIcon, 
  ClipboardCheck,
  UserPlusIcon, // New Icon for Admin Management
  LogOutIcon 
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  userType: string | undefined; // Add userType prop
};

const Sidebar = ({ activeTab, setActiveTab, handleLogout, userType }: Props) => {
  // Define base menu items available to everyone
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { id: "students", label: "Student Management", icon: UsersIcon },
    { id: "books", label: "Book Inventory", icon: BookOpenIcon },
    { id: "research", label: "Research Submissions", icon: ClipboardCheck },
    { id: "logs", label: "Activity Logs", icon: ClipboardListIcon },
  ];

  // Dynamically add the Admin Account Management tab ONLY if superadmin
  if (userType === "superadmin") {
    menuItems.splice(1, 0, { id: "admin-management", label: "Admin Accounts", icon: UserPlusIcon });
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tighter">
          CEIT READING ROOM <span className="text-xs block text-cvsu-gray font-medium">Admin Panel</span>
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all ${
                isActive 
                  ? "bg-cvsu-green-base text-white shadow-md" 
                  : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOutIcon size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
