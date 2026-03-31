import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    X, 
    Users, 
    Tag, 
    Lock, 
    FileUp, 
    PlusCircle, 
    Check, 
    UserCheck, 
    ShieldCheck,
    ChevronDown,
    BookOpen, 
    AlertCircle,
    Loader2,
} from 'lucide-react';

// API Config
import { API_BASE_URL } from "@/API/APIConfig";     


const ResearchPostModal = ({ isOpen, onClose, student }: any) => {
  const [keywordInput, setKeywordInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: [] as string[],
    authors: [] as any[],
    adviser: '',
    technicalCritic: '',
    type: '',
    file: null as File | null
  });

  const isFormValid = formData.title && formData.abstract && formData.type && formData.file;

  useEffect(() => {
    if (isOpen) {
      const fetchStudents = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/get_students.php`);
          if (Array.isArray(response.data)) {
            // Filter out the current logged-in user from suggestions
            setAllStudents(response.data.filter(s => s.student_id !== student?.student_id));
          }
        } catch (error) {
          console.error("Error fetching students for mentions:", error);
        }
      };
      fetchStudents();
    }
  }, [isOpen, student]);

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !formData.keywords.includes(trimmed)) {
        setFormData({
            ...formData,
            keywords: [...formData.keywords, trimmed]
        });
        setKeywordInput('');
    }
  };

  // Handle Author Search & Selection
  const handleAuthorTyping = (val: string) => {
    setAuthorInput(val);
    if (val.trim().length > 1) {
      const filtered = allStudents.filter(s => 
        s.first_name.toLowerCase().includes(val.toLowerCase()) || 
        s.last_name.toLowerCase().includes(val.toLowerCase()) ||
        s.email.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5); // Limit to 5 results
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addAuthor = (selectedStudent: any) => {
    if (!formData.authors.find(a => a.student_id === selectedStudent.student_id)) {
      setFormData({
        ...formData,
        authors: [...formData.authors, selectedStudent]
      });
    }
    setAuthorInput('');
    setSuggestions([]);
  };

  const removeAuthor = (id: string) => {
    setFormData({
      ...formData,
      authors: formData.authors.filter(a => a.student_id !== id)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addKeyword();
    }
  };

  const removeKeyword = (indexToRemove: number) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((_, index) => index !== indexToRemove)
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
      const data = new FormData();
    
      data.append('title', formData.title);
      data.append('abstract', formData.abstract);
      data.append('type', formData.type);
      data.append('adviser', formData.adviser);
      data.append('technicalCritic', formData.technicalCritic);
      data.append('submitted_by', student.student_id || student.id);
      data.append('program', student.course);

      const allAuthors = [
        {
            student_id: student.student_id || student.id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            is_submitter: true
        }, 
        ...formData.authors
    ];
    data.append('authors', JSON.stringify(allAuthors));
      data.append('keywords', JSON.stringify(formData.keywords));
    
      if (formData.file) {
        data.append('file', formData.file);
      } else {
        alert("Please attach a PDF file.");
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/student/add_research.php`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          alert("Project submitted successfully! Pending admin approval.");
          onClose();
        } else {
          alert("Server Error: " + response.data.message); 
          console.log("Full Server Response:", response.data);
        }
      } catch (error) {
        console.error("Submission failed:", error);
        alert("An error occurred during upload.");
      } finally {
        setIsSubmitting(false);
      }
    };



  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex-1"></div>
          <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">Create Research Post</h2>
          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Post Identity */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cvsu-green-base rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">
              {student?.first_name?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">{student?.first_name} {student?.last_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock size={10} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-600 uppercase">CEIT Repository</span>
                </div>
              </div>
            </div>
          </div>

          {/* FACEBOOK-STYLE TYPE DROPDOWN */}
          <div className="relative group">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
              !formData.type ? 'bg-amber-50 border-amber-200' : 'bg-cvsu-bg/50 border-cvsu-green-base/20'
            }`}>
              <BookOpen size={14} className={!formData.type ? 'text-amber-500' : 'text-cvsu-green-base'} />
              <select 
                className={`bg-transparent text-[10px] font-black uppercase border-none focus:ring-0 p-0 appearance-none pr-5 cursor-pointer ${
                    formData.type === '' ? 'text-amber-600' : 'text-cvsu-green-base'
                  }`}
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="" disabled>Select Type</option>
                <option value="Thesis">Thesis</option>
                <option value="Capstone">Capstone</option>
                <option value="Design Project">Design Project</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-5 font-dm">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Project Title"
              className="w-full text-xl font-black placeholder:text-gray-300 border-none focus:ring-0 p-0 text-cvsu-green-base leading-tight"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />

            <textarea 
              placeholder="Write the abstract here..."
              className="w-full min-h-30 resize-none border-none focus:ring-0 p-0 text-gray-700 text-sm leading-relaxed"
              onChange={(e) => setFormData({...formData, abstract: e.target.value})}
            />

            {/* Author Tags */}
            <div className="space-y-3 p-4 border border-gray-200 rounded-2xl relative shadow-inner">
               <div className="flex flex-wrap gap-2 mb-1">
                  {formData.authors.map((auth) => (
                    <span key={auth.student_id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                      {auth.first_name} {auth.last_name}
                      <button onClick={() => removeAuthor(auth.student_id)} className="hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))}
               </div>

               <div className="flex items-center gap-2 text-cvsu-green-base relative">
                  <Users size={18} />
                  <input 
                    type="text" 
                    placeholder="Mention co-authors..." 
                    className="flex-1 text-sm border-none focus:ring-0 bg-transparent"
                    value={authorInput}
                    onChange={(e) => handleAuthorTyping(e.target.value)}
                  />

                  {/* Search Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-gray-100 shadow-xl rounded-xl mt-1 z-50 overflow-hidden divide-y divide-gray-50">
                      {suggestions.map((s) => (
                        <button 
                          key={s.student_id}
                          onClick={() => addAuthor(s)}
                          className="w-full flex items-center justify-between p-3 hover:bg-cvsu-bg text-left transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-800">{s.first_name} {s.last_name}</p>
                            <p className="text-[10px] text-gray-500">{s.email}</p>
                          </div>
                          <Check size={14} className="text-cvsu-green-base opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
               </div>

               <hr className="border-gray-100" />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <UserCheck size={18} className="text-amber-500" />
                    <input 
                      type="text" 
                      placeholder="Thesis Adviser" 
                      className="flex-1 text-xs border-none focus:ring-0 p-0 font-bold"
                      onChange={(e) => setFormData({...formData, adviser: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <ShieldCheck size={18} className="text-purple-500" />
                    <input 
                      type="text" 
                      placeholder="Technical Critic" 
                      className="flex-1 text-xs border-none focus:ring-0 p-0 font-bold"
                      onChange={(e) => setFormData({...formData, technicalCritic: e.target.value})}
                    />
                  </div>
               </div>

               <hr className="border-gray-100" />
                
               <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keywords.map((word, index) => (
                    <span key={index} className="flex items-center gap-1 bg-cvsu-bg text-cvsu-green-base px-2 py-1 rounded-lg text-xs font-bold border border-cvsu-green-base/20">
                      {word}
                      <button onClick={() => removeKeyword(index)} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
               </div>

               <div className="flex items-center gap-2 text-gray-500">
                  <Tag size={18} />
                  <input 
                    type="text" 
                    placeholder="Type keyword and press Enter..." 
                    className="flex-1 text-sm border-none focus:ring-0"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {/* Mobile Add Button */}
                  <button 
                    onClick={addKeyword}
                    className="md:hidden p-1 text-cvsu-green-base"
                  >
                    <PlusCircle size={20} />
                  </button>
               </div>
            </div>


            {/* File Upload Area */}
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all group ${
                !formData.file ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 hover:border-cvsu-green-base/50 hover:bg-gray-50'
              }`}>
               <FileUp className={`mb-2 transition-colors ${!formData.file ? 'text-amber-400' : 'text-gray-400 group-hover:text-cvsu-green-base'}`} />
               <span className={`text-xs font-bold uppercase tracking-widest ${!formData.file ? 'text-amber-600' : 'text-gray-500 group-hover:text-cvsu-green-base'}`}>
                 {formData.file ? formData.file.name : "Attach PDF Document"}
               </span>
               <input 
                 type="file" 
                 accept=".pdf" 
                 className="hidden" 
                 onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
               />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {!isFormValid && !isSubmitting && (
            <p className="text-[10px] text-amber-600 font-bold text-center mb-3 flex items-center justify-center gap-1 uppercase tracking-widest">
              <AlertCircle size={12} /> Please fill in required fields to post
            </p>
          )}
          <button 
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting} // Added !formData.type
              className="w-full bg-cvsu-green-base disabled:bg-gray-300 disabled:shadow-none text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 uppercase text-sm tracking-widest"
            >
              {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  "Post to Library"
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchPostModal;
