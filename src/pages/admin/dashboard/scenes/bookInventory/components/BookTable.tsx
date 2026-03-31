import React from 'react';
import { Eye, Trash2, Edit3, Book as BookIcon } from 'lucide-react';

interface BookTableProps {
  books: any[];
  onDelete: (id: string) => void;
  onViewDetails: (book: any) => void;
}

const BookTable: React.FC<BookTableProps> = ({ books, onDelete, onViewDetails }) => {
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: "Out of Stock", classes: "bg-red-100 text-red-700" };
    if (stock <= 5) return { label: "Low Stock", classes: "bg-orange-100 text-orange-700" };
    return { label: "In Stock", classes: "bg-green-100 text-green-700" };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Book Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">ISBN</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.map((book) => {
              const status = getStockStatus(book.stock);
              return (
                <tr key={book.book_id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <BookIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{book.title}</p>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{book.category}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{book.isbn}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{book.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.classes}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => onViewDetails(book)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit Book"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(book.book_id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookTable;
