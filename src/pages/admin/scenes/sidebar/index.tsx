 
// src\pages\admin\scenes\sidebar\index.tsx
import { useState } from "react";
import {
  LayoutDashboardIcon,
  BarChart3Icon, 
  MegaphoneIcon, 
  UsersIcon,
  BookOpenIcon,
  ClipboardListIcon,
  ClipboardCheck,
  UserPlusIcon,
  LogOutIcon,
  ChevronDownIcon, 
  ChevronRightIcon,
  KeyRound,
  CalendarCheck,
  RefreshCw
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  userType: string | undefined;
};

const Sidebar = ({ activeTab, setActiveTab, handleLogout, userType }: Props) => {
  // Track open/collapsed state of the sub-menus
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Define regular standalone navigation items (Activity Logs removed from here to separate as a sub-menu)
  const menuItems = [
    { id: "students", label: "Student Accounts", icon: UsersIcon },
    { id: "books", label: "Book Inventory", icon: BookOpenIcon },
    { id: "research", label: "Researches", icon: ClipboardCheck },
  ];

  // Dynamically inject Superadmin privileges safely
  if (userType === "superadmin") {
    menuItems.splice(0, 0, { id: "admin-management", label: "Admin Accounts", icon: UserPlusIcon });
  }

  // Active validation state checks for main parent highlight tracking rules
  const isDashboardActive = activeTab === "dashboard-analytics" || activeTab === "dashboard-bulletin";
  const isLogsActive = activeTab === "logs-attendance" || activeTab === "logs-circulation";

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 font-dm select-none z-40">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tighter">
          CEIT READING ROOM <span className="text-xs block text-cvsu-gray font-medium normal-case">Admin Panel</span>
        </h2>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto text-left">
        
        {/* ================= CATEGORY A: DASHBOARD PARENT DROPDOWN ================= */}
        <div>
          <button
            type="button"
            onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all cursor-pointer ${
              isDashboardActive
                ? "bg-cvsu-green-50 text-cvsu-green-base"
                : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboardIcon size={20} />
              <span>Dashboard</span>
            </div>
            {isDashboardOpen ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
          </button>

          {/* Nested Dashboard Sub-Tabs */}
          {isDashboardOpen && (
            <div className="mt-1 ml-6 pl-2 border-l border-gray-100 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard-analytics")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-montserrat font-semibold text-xs transition-all cursor-pointer ${
                  activeTab === "dashboard-analytics"
                    ? "bg-cvsu-green-base text-white shadow-sm shadow-cvsu-green-base/10"
                    : "text-cvsu-gray hover:bg-gray-50 hover:text-cvsu-green-base"
                }`}
              >
                <BarChart3Icon size={16} />
                Analytics & Metrics
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dashboard-bulletin")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-montserrat font-semibold text-xs transition-all cursor-pointer ${
                  activeTab === "dashboard-bulletin"
                    ? "bg-cvsu-green-base text-white shadow-sm shadow-cvsu-green-base/10"
                    : "text-cvsu-gray hover:bg-gray-50 hover:text-cvsu-green-base"
                }`}
              >
                <MegaphoneIcon size={16} />
                Bulletin Board
              </button>
            </div>
          )}
        </div>

        {/* ================= CATEGORY B: REGULAR STANDALONE NAVIGATION LINKS ================= */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all cursor-pointer ${
                isActive
                  ? "bg-cvsu-green-base text-white shadow-md shadow-cvsu-green-base/20"
                  : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* ================= CATEGORY C: NEW ACTIVITY LOGS PARENT DROPDOWN ================= */}
        <div>
          <button
            type="button"
            onClick={() => setIsLogsOpen(!isLogsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all cursor-pointer ${
              isLogsActive
                ? "bg-cvsu-green-50 text-cvsu-green-base"
                : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardListIcon size={20} />
              <span>Activity Logs</span>
            </div>
            {isLogsOpen ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
          </button>

          {/* NEW: Collapsible Sub-Tabs Separating Attendance & Circulation */}
          {isLogsOpen && (
            <div className="mt-1 ml-6 pl-2 border-l border-gray-100 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("logs-attendance")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-montserrat font-semibold text-xs transition-all cursor-pointer ${
                  activeTab === "logs-attendance"
                    ? "bg-cvsu-green-base text-white shadow-sm shadow-cvsu-green-base/10"
                    : "text-cvsu-gray hover:bg-gray-50 hover:text-cvsu-green-base"
                }`}
              >
                <CalendarCheck size={16} />
                Attendance Logs
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("logs-circulation")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-montserrat font-semibold text-xs transition-all cursor-pointer ${
                  activeTab === "logs-circulation"
                    ? "bg-cvsu-green-base text-white shadow-sm shadow-cvsu-green-base/10"
                    : "text-cvsu-gray hover:bg-gray-50 hover:text-cvsu-green-base"
                }`}
              >
                <RefreshCw size={16} />
                Circulation Logs
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ================= REUSABLE SECURE ACCOUNT SETTINGS PANEL SECTION ================= */}
      <div className="p-4 border-t border-gray-100 text-left">
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-cvsu-green-base text-white shadow-md shadow-cvsu-green-base/20"
              : "text-cvsu-gray hover:bg-cvsu-green-50 hover:text-cvsu-green-base"
          }`}
        >
          <KeyRound size={20} />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Footer/Logout */}
      <div className="p-4 border-t border-gray-100 text-left">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-montserrat font-bold text-sm text-red-500 hover:bg-red-50 transition-all group cursor-pointer"
        >
          <LogOutIcon size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
