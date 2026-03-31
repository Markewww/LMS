import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddBookFormProps {
  onSubmit: (data: any) => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: 'Fiction', stock: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', author: '', isbn: '', category: 'Fiction', stock: 0 });
    setIsOpen(false);
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-8 right-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition-all hover:scale-105"
    >
      <Plus className="h-5 w-5" />
      <span className="font-semibold">Add New Book</span>
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Enter Book Information</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input 
          required placeholder="Book Title"
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <input 
          required placeholder="Author Name"
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          onChange={(e) => setFormData({...formData, author: e.target.value})}
        />
        <input 
          required placeholder="ISBN"
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
          onChange={(e) => setFormData({...formData, isbn: e.target.value})}
        />
        <select 
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option>Fiction</option>
          <option>Science</option>
          <option>History</option>
          <option>Technology</option>
        </select>
        <input 
          type="number" required placeholder="Initial Stock"
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
        />
        <button type="submit" className="bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Save to Inventory
        </button>
      </form>
    </div>
  );
};

export default AddBookForm;
