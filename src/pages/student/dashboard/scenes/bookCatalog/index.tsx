import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Book as BookIcon, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

const StudentBookCatalog = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/get_books.php`);
        if (Array.isArray(response.data)) setBooks(response.data);
      } catch (err) { console.error(err); }
    };
    fetchCatalog();
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6">
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cvsu-green-base transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Search by title or author..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.book_id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cvsu-bg rounded-xl text-cvsu-green-base">
                <BookIcon size={24} />
              </div>
              {parseInt(book.stock) > 0 ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">
                  <CheckCircle size={12} /> Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase">
                  <XCircle size={12} /> Out of Stock
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 leading-tight mb-1">{book.title}</h3>
            <p className="text-sm text-cvsu-gray mb-4">{book.author}</p>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">{book.isbn}</span>
              <span className="font-bold text-cvsu-green-base">{book.category}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudentBookCatalog;
