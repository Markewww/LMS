import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Search, LayoutDashboard, User, LogOut, 
  Layers, Bell, ChevronDown, CheckCircle2, Clock, BookMarked
} from "lucide-react";

const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Mock Data for UI/UX
  const stats = [
    { label: "Total Books", value: "1,240", icon: <BookOpen className="text-blue-500" />, bg: "bg-blue-50" },
    { label: "Available", value: "856", icon: <CheckCircle2 className="text-cvsu-green-base" />, bg: "bg-green-50" },
    { label: "Borrowed", value: "12", icon: <Clock className="text-orange-500" />, bg: "bg-orange-50" },
  ];

  const books = [
    { id: 1, title: "Modern Architecture", author: "Frank Wright", category: "Architecture", status: "Available", image: "https://images.unsplash.com" },
    { id: 2, title: "Data Structures & Algorithms", author: "Narasimha Karumanchi", category: "Computer Science", status: "Borrowed", image: "https://images.unsplash.com" },
    { id: 3, title: "Circuit Analysis", author: "William Hayt", category: "Engineering", status: "Available", image: "https://images.unsplash.com" },
    // Add more mock books as needed
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-dm">
      {/* 1. SIDEBAR (Fixed/Collapsible Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-cvsu-green-base p-2 rounded-xl text-white">
            <BookMarked size={24} />
          </div>
          <span className="font-montserrat font-black text-cvsu-green-dark tracking-tighter">CEIT READ</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<BookOpen size={20}/>} label="Browse Books" />
          <NavItem icon={<Layers size={20}/>} label="Categories" />
          <NavItem icon={<User size={20}/>} label="My Profile" />
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search books, authors, ISBN..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-cvsu-green-base/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-800 leading-none">Student Name</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">2021-00000</p>
              </div>
              <div className="w-10 h-10 bg-cvsu-green-100 rounded-full flex items-center justify-center text-cvsu-green-dark font-bold">
                S
              </div>
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE CONTENT */}
        <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
          
          {/* A. WELCOME SECTION */}
          <section>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Welcome back, Student! 👋</h2>
            <p className="text-gray-500 text-sm mt-1">Find your next favorite engineering resource today.</p>
          </section>

          {/* B. STATS CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`${stat.bg} p-4 rounded-2xl`}>{stat.icon}</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-gray-800">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* C. FILTERS */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {["All", "Architecture", "Computer Science", "Engineering"].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat 
                    ? "bg-cvsu-green-base text-white shadow-lg shadow-cvsu-green-base/20" 
                    : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 hover:bg-gray-50">
              Sort by: Newest <ChevronDown size={14} />
            </button>
          </div>

          {/* D. BOOK CATALOG GRID */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            <AnimatePresence>
              {books.map((book) => (
                <motion.div 
                  layout key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      book.status === 'Available' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-1">
                    <p className="text-[10px] font-bold text-cvsu-green-base uppercase">{book.category}</p>
                    <h4 className="font-bold text-gray-800 line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-gray-400 pb-4 italic">by {book.author}</p>
                    <button className="w-full py-2.5 bg-gray-50 text-cvsu-green-dark font-black text-[10px] uppercase tracking-widest rounded-xl group-hover:bg-cvsu-green-base group-hover:text-white transition-all">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>

        </div>
      </main>
    </div>
  );
};

// Sub-component for Sidebar Navigation
const NavItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
    active ? "bg-cvsu-green-base text-white shadow-lg shadow-cvsu-green-base/20" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
  }`}>
    {icon} {label}
  </button>
);

export default StudentDashboard;
