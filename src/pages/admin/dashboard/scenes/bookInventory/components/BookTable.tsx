import React from 'react';
import { EyeIcon, Trash2Icon, BookIcon } from 'lucide-react';

interface BookTableProps {
  books: any[];
  onDelete: (id: string) => void;
  onViewDetails: (book: any) => void;
  onEdit: (book: any) => void; // Added for completeness
}

const BookTable: React.FC<BookTableProps> = ({ books, onDelete, onViewDetails, }) => {
  
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", classes: "bg-red-100 text-red-700" };
    if (stock <= 5) return { label: "Low Stock", classes: "bg-orange-100 text-orange-700" };
    return { label: "In Stock", classes: "bg-green-100 text-green-700" };
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
            {books.map((book) => {
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
                        className="text-cvsu-green-base hover:scale-110 p-1 transition-transform"
                        title="View Details"
                      >
                        <EyeIcon size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(book.book_id)}
                        className="text-red-500 hover:scale-110 p-1 transition-transform"
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
      {books.length === 0 && (
        <div className="p-20 text-center text-cvsu-gray italic">
          No book records found.
        </div>
      )}
    </div>
  );
};

export default BookTable;
