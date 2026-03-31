import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Components (To be created in the same directory/components folder)
import BookToolbar from "./components/BookToolbar";
import BookTable from "./components/BookTable";
import AddBookForm from "./components/AddBookForm";
import BookDetailsModal from "./components/BookDetailsModal";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const BookInventory = () => {
  const [books, setBooks] = useState<any>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchBooks = async () => {
    try {
      // Added timestamp to prevent browser caching of old inventory data
      const response = await axios.get(`${API_BASE_URL}/admin/get_books.php?t=${Date.now()}`);
      if (Array.isArray(response.data)) {
        setBooks(response.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  // Filter & Search Logic adapted for Book Inventory
  const filteredBooks = books.filter((b: any) => {
    const term = searchTerm.toLowerCase();
    
    // Checks Title, Author, ISBN, and Category
    const matchesSearch = 
      b.title.toLowerCase().includes(term) || 
      b.author.toLowerCase().includes(term) ||
      b.isbn.toLowerCase().includes(term) ||
      b.category.toLowerCase().includes(term);

    // Checks Category filter dropdown
    const matchesCategory = filterCategory === "all" || b.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteBook = async (bookId: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/delete_book.php`, {
        book_id: bookId
      });

      if (response.data.success) {
        alert("Book removed from inventory.");
        fetchBooks();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-6 font-dm"
    >
      {/* BOOK DETAIL/EDIT MODAL */}
      <BookDetailsModal 
        selectedBook={selectedBook} 
        setSelectedBook={setSelectedBook}
        onUpdate={fetchBooks}
      />

      {/* TOOLBAR (Search & Category Filter) */}
      <BookToolbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />

      {/* TABLE */}
      <BookTable 
        books={filteredBooks}
        onDelete={handleDeleteBook} 
        onViewDetails={(b) => setSelectedBook(b)}
      />

      {/* ADD BOOK FORM */}
      <AddBookForm onSubmit={async (data) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/admin/add_book.php`, data);
          if (response.data.success) {
            alert("Book added to inventory successfully!");
            fetchBooks();
          }
        } catch (error) {
          console.error("Error adding book:", error);
          alert("Failed to add book.");
        }
      }} />
    </motion.div>
  );
};

export default BookInventory;
