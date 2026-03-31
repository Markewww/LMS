import React from 'react';
import { X, Book, User, Hash, Tag, Package } from 'lucide-react';

interface BookDetailsModalProps {
  selectedBook: any;
  setSelectedBook: (book: any) => void;
  onUpdate: () => void;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ selectedBook, setSelectedBook }) => {
  if (!selectedBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Book className="h-5 w-5" />
            Book Details
          </h2>
          <button onClick={() => setSelectedBook(null)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DetailItem icon={<Book className="h-4 w-4" />} label="Title" value={selectedBook.title} />
          <DetailItem icon={<User className="h-4 w-4" />} label="Author" value={selectedBook.author} />
          <DetailItem icon={<Hash className="h-4 w-4" />} label="ISBN" value={selectedBook.isbn} />
          <DetailItem icon={<Tag className="h-4 w-4" />} label="Category" value={selectedBook.category} />
          <DetailItem icon={<Package className="h-4 w-4" />} label="Stock Level" value={selectedBook.stock} />
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button className="flex-1 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-100">Close</button>
          <button className="flex-1 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Info</button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }: any) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-500">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  </div>
);

export default BookDetailsModal;
