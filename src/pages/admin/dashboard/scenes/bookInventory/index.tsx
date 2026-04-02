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
  const [filters, setFilters] = useState({ type: 'all', genre: 'all', year: 'all', status: 'all' });

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_books.php`);
      // Assuming you have a useState for books
      setBooks(response.data); 
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const filteredBooks = books.filter((book: any) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (book.book_id?.toString() || "").toLowerCase().includes(term) ||
      (book.title || "").toLowerCase().includes(term) ||
      (book.author || "").toLowerCase().includes(term) ||
      (book.isbn || "").toLowerCase().includes(term);
    const matchesType = 
      filters.type === "all" || 
      book.type?.toLowerCase() === filters.type.toLowerCase();
    const matchesGenre = 
      filters.genre === "all" || 
      book.category?.toLowerCase() === filters.genre.toLowerCase();
    const bookYear = parseInt(book.copyright_year);

    let matchesYear = true;
    if (filters.year !== "all") {
      if (filters.year === "2024") matchesYear = bookYear === 2024;
      else if (filters.year === "2023") matchesYear = bookYear === 2023;
      else if (filters.year === "2020-2022") matchesYear = bookYear >= 2020 && bookYear <= 2022;
      else if (filters.year === "old") matchesYear = bookYear < 2020;
    }

    const matchesStatus = 
      filters.status === "all" || 
      (filters.status === "available" && book.stock > 0) ||
      (filters.status === "borrowed" && book.stock <= 0);

    return matchesSearch && matchesType && matchesGenre && matchesYear && matchesStatus;
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

  const handleAddBook = async (formData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/add_book.php`, formData);
      if (response.data.success) {
        alert("Book added to inventory successfully!");
        fetchBooks();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to connect to the server.");
    }
  }

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
        filters={filters}
        setFilters={setFilters}
      />

      {/* TABLE */}
      <BookTable 
        books={filteredBooks}
        onDelete={handleDeleteBook} 
        onViewDetails={(b) => setSelectedBook(b)}
        onEdit={(b) => {
          setSelectedBook(b);
        }}
      />

      {/* ADD BOOK FORM */}
      <AddBookForm onSubmit={handleAddBook} />
    </motion.div>
  );
};

export default BookInventory;
