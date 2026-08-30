import { useState, useEffect } from "react";
import axios from "axios";
import { X, SaveIcon, Edit3Icon, PlusCircleIcon, Tag, UserIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface ResearchProject {
  uuid: string;
  code: string | null;
  title: string;
  type: "Thesis" | "Capstone" | "Design Project";
  program: string | null;
  year: number | null;
  authors: string | null;
  adviser: string | null;
  technical_critic: string | null;
  abstract: string | null;
  keywords: string | null;
  file_path: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  created_at: string;
}

interface EditResearchModalProps {
  isOpen: boolean;
  research: ResearchProject | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const programAliases: Record<string, string> = {
  "BSABE": "ABE",
  "BSARCHI": "ARCHI",
  "BSCE": "CE",
  "BSCpE": "CPE",
  "BSCS": "CS",
  "BSEE": "EE",
  "BSECE": "ECE",
  "BSIE": "IE",
  "BSIndT-AT": "BIT",
  "BSIndT-ET": "BIT",
  "BSIndT-ELEX": "BIT",
  "BSIT": "IT"
};


const EditResearchModal = ({ isOpen, research, onClose, onSaveSuccess }: EditResearchModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "Thesis" as ResearchProject["type"],
    program: "",
    year: "",
    adviser: "",
    technical_critic: "",
    abstract: "",
    code: "",
    authors: [] as string[],
    keywords: [] as string[],
  });

  const [authorInput, setAuthorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const parseMetadataString = (inputString: string | null): string[] => {
    if (!inputString) return [];
    const trimmed = inputString.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: unknown) => 
            typeof item === "object" && item !== null 
              ? `${(item as Record<string, string>).first_name || ""} ${(item as Record<string, string>).last_name || ""}`.trim() 
              : String(item)
          );
        }
      } catch (error) {
        console.warn("Error parsing metadata string:", error);
      }
    }
    return trimmed.split(",").map(item => item.trim()).filter(Boolean);
  };

  useEffect(() => {
    if (research && isOpen) {
      setEditForm({
        title: research.title || "",
        type: research.type || "Thesis",
        program: research.program || "",
        year: research.year ? String(research.year) : "",
        adviser: research.adviser || "",
        technical_critic: research.technical_critic || "",
        abstract: research.abstract || "",
        code: research.code || "",
        authors: parseMetadataString(research.authors),
        keywords: parseMetadataString(research.keywords),
      });
    }
  }, [research, isOpen]);

    // Automatically injects the prefix template when both course and year choices shift
  useEffect(() => {
    if (isOpen && editForm.program && editForm.year) {
      const alias = programAliases[editForm.program] || "ALIAS";
      const expectedPrefix = `CEIT-${alias}-${editForm.year}-`;
      
      setEditForm(prev => {
        // Only update if the current input string doesn't already start with the required template header
        if (!prev.code.startsWith(expectedPrefix)) {
          return { ...prev, code: expectedPrefix };
        }
        return prev;
      });
    }
  }, [editForm.program, editForm.year, isOpen]);

  if (!isOpen || !research) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Protection rule for the template call number code
    if (name === "code" && editForm.program && editForm.year) {
      const alias = programAliases[editForm.program] || "ALIAS";
      const prefix = `CEIT-${alias}-${editForm.year}-`;
      
      // If the administrator backs up or attempts to type over the system prefix, reject the change
      if (!value.startsWith(prefix)) {
        return;
      }
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };


  const addAuthor = () => {
    const val = authorInput.trim();
    if (val && !editForm.authors.includes(val)) {
      setEditForm(prev => ({ ...prev, authors: [...prev.authors, val] }));
      setAuthorInput("");
    }
  };

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (val && !editForm.keywords.includes(val)) {
      setEditForm(prev => ({ ...prev, keywords: [...prev.keywords, val] }));
      setKeywordInput("");
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title.trim()) return alert("Project Title cannot be empty.");
    if (editForm.authors.length === 0) return alert("Please include at least one author.");

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/admin/update_research_details.php`, {
        uuid: research.uuid,
        title: editForm.title,
        type: editForm.type,
        program: editForm.program,
        year: editForm.year ? parseInt(editForm.year) : null,
        adviser: editForm.adviser,
        technical_critic: editForm.technical_critic,
        abstract: editForm.abstract,
        code: editForm.code,
        authors: editForm.authors.join(", "),
        keywords: editForm.keywords.join(", ")
      });

      if (response.data.success) {
        alert("Research details updated successfully!");
        onSaveSuccess();
        onClose();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.warn("Failed updating research parameters:", error);
      alert("Failed saving data modifications.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-dm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-amber-500 text-white font-dm">
          <h2 className="font-montserrat font-black uppercase tracking-tight flex items-center gap-2">
            <Edit3Icon size={20} /> Modify Research Metadata
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors cursor-pointer">
            <X />
          </button>
        </div>

        {/* Form Body Layout */}
        <form onSubmit={handleSaveChanges} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Classification *</label>
              <select name="type" value={editForm.type} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 bg-transparent">
                <option value="Thesis">Thesis</option>
                <option value="Capstone">Capstone</option>
                <option value="Design Project">Design Project</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Call Number / Project Code *
              </label>
              <input 
                type="text" 
                name="code" 
                value={editForm.code}
                onChange={handleInputChange}
                // Disables manual editing until core classification selections are determined
                disabled={!editForm.program || !editForm.year}
                placeholder={
                  !editForm.program || !editForm.year
                    ? "Select Program & Year first to unlock..."
                    : "Enter trailing indexing numbers..."
                }
                className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 transition-all ${
                  (!editForm.program || !editForm.year)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-100"
                    : "font-bold text-amber-600 bg-white"
                }`} 
              />
              {editForm.program && editForm.year && (
                <span className="text-[9px] text-gray-400 mt-1 block italic">
                  Complete the template by appending the last trailing digits.
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Research Project Title *</label>
            <textarea name="title" rows={2} required value={editForm.title} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Course Track *</label>
              <select name="program" value={editForm.program} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 bg-white">
                <option value="">Select Track</option>
                {Object.keys(programAliases).map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Graduation Year</label>
              <input type="number" name="year" value={editForm.year} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Authors Input Grid */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Authors Layout *</label>
            <div className="border rounded-xl p-2 flex flex-wrap gap-1.5 focus-within:border-amber-500 bg-white min-h-44px">
              {editForm.authors.map((auth, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 font-bold">
                  {auth}
                  <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setEditForm(prev => ({ ...prev, authors: prev.authors.filter((_, idx) => idx !== i) }))} />
                </span>
              ))}
              <div className="flex items-center gap-2 pl-1 w-full mt-1 border-t pt-2">
                <UserIcon size={14} className="text-gray-400" />
                                <input 
                  type="text" 
                  placeholder="Add author name and press enter..." 
                  value={authorInput} 
                  onChange={(e) => setAuthorInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAuthor())} 
                  className="text-xs border-none outline-none p-0 bg-transparent flex-1 focus:ring-0 focus:outline-none" 
                />
                <PlusCircleIcon size={16} className="text-amber-500 cursor-pointer" onClick={addAuthor} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Research Adviser</label>
              <input type="text" name="adviser" value={editForm.adviser} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Technical Critic</label>
              <input type="text" name="technical_critic" value={editForm.technical_critic} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Keywords Input Grid */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Keywords Layout</label>
            <div className="border rounded-xl p-2  flex flex-wrap gap-1.5 focus-within:border-amber-500 bg-white min-h-44px">
              {editForm.keywords.map((word, i) => (
                <span key={i} className="bg-cvsu-bg text-cvsu-green-base text-xs px-2 py-0.5 rounded border border-cvsu-green-base/20 flex items-center gap-1 font-bold">
                  {word}
                  <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setEditForm(prev => ({ ...prev, keywords: prev.keywords.filter((_, idx) => idx !== i) }))} />
                </span>
              ))}
              <div className="flex items-center gap-2 pl-1 w-full mt-1 border-t pt-2">
                <Tag size={14} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Add indexing keyword..." 
                  value={keywordInput} 
                  onChange={(e) => setKeywordInput(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} 
                  className="text-xs border-none outline-none p-0 bg-transparent flex-1 focus:ring-0 focus:outline-none" 
                />
                <PlusCircleIcon size={16} className="text-amber-500 cursor-pointer" onClick={addKeyword} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Abstract Summary Text</label>
            <textarea name="abstract" rows={4} value={editForm.abstract} onChange={handleInputChange} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-500 resize-none" />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
            <button type="button" onClick={onClose} disabled={submitting} className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/10">
              <SaveIcon size={14} /> {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResearchModal;

