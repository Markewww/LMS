import React, { useState } from "react";
import { EyeIcon, Trash2Icon, BookIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface BookRecord {
  book_id: string | number;
  title: string;
  author: string;
  type?: string | null;
  category: string;
  stock: number;
}

interface BookTableProps {
  books: BookRecord[]; // Replaced 'any[]' with an explicit type schema for full safety
  onDelete: (id: string | number) => void;
  onViewDetails: (book: BookRecord) => void;
  onEdit?: (book: BookRecord) => void; 
}

const BookTable: React.FC<BookTableProps> = ({ books, onDelete, onViewDetails }) => {
  // ─── PAGINATION STATE CONFIGURATIONS ───
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Max boundary row display constraint split

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", classes: "bg-red-100 text-red-700" };
    if (stock <= 5) return { label: "Low Stock", classes: "bg-orange-100 text-orange-700" };
    return { label: "In Stock", classes: "bg-green-100 text-green-700" };
  };

  // Calculate local page math range parameters
  const totalRows = books.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
  
  // Slice target array data collection chunk using active indicators
  const paginatedBooks = books.slice(startIndex, endIndex);

  const changePage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-dm">
      {/* HEADER - Matches StudentTable Design */}
      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
        <BookIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase tracking-wider">
          Book Inventory
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* TH STYLING - Matches StudentTable */}
            <tr className="bg-cvsu-green-50 text-cvsu-green-dark text-[10px] uppercase font-bold tracking-wider">
              <th className="p-4">Accession No.</th>
              <th className="p-4">Book Details</th>
              <th className="p-4">Type/Category</th>
              <th className="p-4 text-center">Stock Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {paginatedBooks.map((book) => {
              const status = getStockStatus(book.stock);
              return (
                <tr key={book.book_id} className="hover:bg-gray-50 transition-colors">
                  {/* Book ID / Accession Number */}
                  <td className="p-4 font-bold text-gray-700">{book.book_id}</td>
                  
                  {/* Title & Author */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 line-clamp-1">{book.title}</span>
                      <span className="text-xs text-cvsu-gray italic">{book.author}</span>
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="p-4 text-gray-600">
                    <span className="capitalize">{book.type || "Book"}</span>
                    <span className="text-gray-300 mx-2">|</span>
                    <span className="text-xs">{book.category}</span>
                  </td>
                  
                  {/* Stock Status Badge */}
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status.classes}`}>
                      {status.label}
                    </span>
                  </td>
                  
                  {/* Actions - Matches StudentTable Scale Effect */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => onViewDetails(book)}
                        className="text-cvsu-green-base hover:scale-110 p-1 transition-transform cursor-pointer"
                        title="View Details"
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(book.book_id)}
                        className="text-red-500 hover:scale-110 p-1 transition-transform cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2Icon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE - Matches StudentTable style */}
      {totalRows === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">
          No book records found.
        </div>
      )}

      {/* ─── DYNAMIC PAGINATION CONTROLS FOOTER BIND ─── */}
      {totalRows > rowsPerPage && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          {/* Slicing range metrics info label text string */}
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-700">{endIndex}</span> of{" "}
            <span className="font-bold text-gray-700">{totalRows}</span> records
          </div>

          {/* Interactive Navigation Action Buttons Map Group */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
              title="First Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-cvsu-green-base text-white shadow-xs min-w-24 text-center">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>

            <button
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTable;
