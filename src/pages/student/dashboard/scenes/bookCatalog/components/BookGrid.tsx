import { BookOpen, CheckCircle, XCircle } from "lucide-react";

export interface Book {
  uuid: string;
  title: string;
  authors: string | null;
  publisher: string | null;
  copyright_year: string | number | null;
  isbn: string | null;
  category: "book" | "magazine" | "journal";
  stock: number;
  qr_data?: string | null;
  barcode?: string | null;
}

interface BookGridProps {
  books: Book[];
}

const BookGrid = ({ books }: BookGridProps) => {
  // FIXED: Patched unclosed syntax checking parameters from extraction anomalies
  if (books.length === 0) {
    return (
      <div className="p-16 text-center text-sm text-gray-400 font-dm italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 w-full">
        No books found matching your current search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-dm text-left w-full">
      {books.map((book) => (
        <div
          key={book.uuid}
          className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              {/* FIXED: Restored production icon casing parameters */}
              <div className="p-3 bg-cvsu-bg rounded-xl text-cvsu-green-base">
                <BookOpen size={24} />
              </div>
              
              {book.stock > 0 ? (
                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle size={12} /> Available ({book.stock})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  <XCircle size={12} /> Out of Stock
                </span>
              )}
            </div>

            <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate" title={book.title}>
              {book.title}
            </h3>
            
            {/* FIXED: Repaired literal string template evaluations */}
            <p className="text-sm text-cvsu-gray mb-4 truncate">
              {book.authors || "Unknown Author"}{" "}
              {book.copyright_year ? `(${book.copyright_year})` : ""}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-mono tracking-tight">
              {book.isbn || "No ISBN"}
            </span>
            <span className="font-bold text-cvsu-green-base uppercase text-[10px] bg-cvsu-bg px-2 py-0.5 rounded tracking-wide">
              {book.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookGrid;
