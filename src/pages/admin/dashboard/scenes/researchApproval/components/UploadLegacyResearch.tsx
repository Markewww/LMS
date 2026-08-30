/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { XIcon, FilePlusIcon, UploadCloudIcon, TagIcon, UserPlusIcon, PlusCircleIcon } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";

interface UploadLegacyResearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAdminId: string;
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

const UploadLegacyResearch = ({ isOpen, onClose, onSuccess, currentAdminId }: UploadLegacyResearchProps) => {
  // ─── 1. UPDATED ARRAYS STATE SCHEMAS ───
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    type: "Thesis",
    program: "",
    year: "",
    authors: [] as string[], // Tracked directly as dynamic string array collection
    adviser: "",
    technical_critic: "",
    abstract: "",
    keywords: [] as string[], // Tracked directly as dynamic string array collection
  });

  // Automatically injects the prefix template when both course and year are active
  useEffect(() => {
    if (formData.program && formData.year) {
      const alias = programAliases[formData.program] || "ALIAS";
      const expectedPrefix = `CEIT-${alias}-${formData.year}-`;
      
      setFormData(prev => {
        // Only update if the prefix isn't already there to prevent wiping user input numbers
        if (!prev.code.startsWith(expectedPrefix)) {
          return { ...prev, code: expectedPrefix };
        }
        return prev;
      });
    } else {
      // Clear code if filters are deselected
      setFormData(prev => ({ ...prev, code: "" }));
    }
  }, [formData.program, formData.year]);


  // Intermediate state parameters handling text input buffers before chip processing
  const [authorInput, setAuthorInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Protection rule for the template call number code
    if (name === "code") {
        const alias = programAliases[formData.program] || "ALIAS";
        const prefix = `CEIT-${alias}-${formData.year}-`;

        if (!value.startsWith(prefix)) {
            return; // Prevent user from typing outside the expected prefix
        }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── 2. INTERACTIVE CHIP MANAGEMENT ACTIONS ───
  const addAuthor = () => {
    const val = authorInput.trim();
    if (val && !formData.authors.includes(val)) {
      setFormData((prev) => ({ ...prev, authors: [...prev.authors, val] }));
      setAuthorInput("");
    }
  };

  const removeAuthor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, idx) => idx !== index),
    }));
  };

  const addKeyword = () => {
    const val = keywordInput.trim();
    if (val && !formData.keywords.includes(val)) {
      setFormData((prev) => ({ ...prev, keywords: [...prev.keywords, val] }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, idx) => idx !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF document file.");
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Project Title is required.");
    if (formData.authors.length === 0) return alert("Please specify at least one author.");

    try {
      setSubmitting(true);
      const data = new FormData();
      
      // Append non-array textual parameters 
      data.append("code", formData.code);
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("program", formData.program);
      data.append("year", formData.year);
      data.append("adviser", formData.adviser);
      data.append("technical_critic", formData.technical_critic);
      data.append("abstract", formData.abstract);
      data.append("submitted_by", currentAdminId);

      // Convert structural array data layers back into clean comma-separated strings for PHP parsing
      data.append("authors", formData.authors.join(", "));
      data.append("keywords", formData.keywords.join(", "));

      if (pdfFile) {
        data.append("pdf_file", pdfFile);
      }

      const response = await axios.post(`${API_BASE_URL}/admin/upload_legacy_research.php`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        alert("Legacy research paper archived successfully!");
        setFormData({
          code: "",
          title: "",
          type: "Thesis",
          program: "",
          year: "",
          authors: [],
          adviser: "",
          technical_critic: "",
          abstract: "",
          keywords: [],
        });
        setPdfFile(null);
        onSuccess();
        onClose();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Archiving failure:", error);
      alert("Failed to archive research details: " + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
    
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-dm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
        
        {/* Header Modal Panel */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-cvsu-green-50">
          <div className="flex items-center gap-2.5 text-cvsu-green-dark">
            <FilePlusIcon size={22} />
            <h3 className="font-montserrat font-black uppercase text-base tracking-wide">Archive Legacy Research</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg bg-white/80 shadow-xs">
            <XIcon size={18} />
          </button>
        </div>

        {/* Form Body Layout Content Grid */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Project Code / Call Number
              </label>
              <input 
                type="text" 
                name="code" 
                value={formData.code} 
                onChange={handleInputChange} 
                /* 
                    Dynamically evaluates the format pattern base:
                    EXAMPLE: "CEIT-IT-2023-100" or fallback placeholder text
                */
                disabled={!formData.program || !formData.year}
                placeholder={
                    !formData.program || !formData.year
                    ? "Select Program & Year first to unlock..."
                    : "Enter last 3 digits (e.g., 100)"
                }
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base bg-white transition-all ${
                  (!formData.program || !formData.year) 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                    : "font-bold text-cvsu-green-dark"
                }`}
                />
                {formData.program && formData.year && (
                  <span className="text-10px text-gray-500 mt-1 block italic">
                    Complete the template by appending the last <b className="text-cvsu-green-base font-bold">3 digits</b>.
                  </span>
                )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Project Classification Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base bg-white">
                <option value="Thesis">Thesis</option>
                <option value="Capstone">Capstone</option>
                <option value="Design Project">Design Project</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Research Project Title *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Enter full research documentation title..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ─── 3. INTERACTIVE DROPDOWN SPECIFICATION FOR DEGREE PROGRAM ─── */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Degree Program / Course Track *</label>
              <select name="program" required value={formData.program} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base bg-white">
                <option value="">Select Program</option>
                <option value="BSABE">Bachelor of Science in Agricultural and Biosystems Engineering</option>
                <option value="BSARCHI">Bachelor of Science in Architecture</option>
                <option value="BSCE">Bachelor of Science in Civil Engineering</option>
                <option value="BSCpE">Bachelor of Science in Computer Engineering</option>
                <option value="BSCS">Bachelor of Science in Computer Science</option>
                <option value="BSEE">Bachelor of Science in Electrical Engineering</option>
                <option value="BSECE">Bachelor of Science in Electronics Engineering</option>
                <option value="BSIE">Bachelor of Science in Industrial Engineering</option>
                <optgroup label="Bachelor of Science in Industrial Technology Major in:">
                  <option value="BSIndT-AT">Automotive Technology</option>
                  <option value="BSIndT-ET">Electrical Technology</option>
                  <option value="BSIndT-ELEX">Electronics Technology</option>
                </optgroup>
                <option value="BSIT">Bachelor of Science in Information Technology</option>
              </select>
            </div>

            {/* ─── 3. INTERACTIVE DROPDOWN SPECIFICATION FOR RESEARCH YEAR ─── */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Year of Publication / Graduation</label>
              <input 
                type="number" 
                name="year" 
                min="1900" 
                max={new Date().getFullYear()} 
                value={formData.year} 
                onChange={handleInputChange} 
                placeholder="e.g., 2024" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base" 
              />
            </div>

            {/* ─── 4. INTERACTIVE AUTHOR CHIP INPUT FIELD ─── */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Research Authors *</label>
              <div className="w-full p-2 rounded-xl border border-gray-200 bg-white min-h-44px flex flex-col justify-between focus-within:border-cvsu-green-base transition-all">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {formData.authors.map((author, index) => (
                    <span key={index} className="flex items-center gap-1 bg-cvsu-bg text-cvsu-green-base px-2 py-0.5 rounded-lg text-xs font-bold border border-cvsu-green-base/20">
                      {author}
                      <button type="button" onClick={() => removeAuthor(index)} className="hover:text-red-500 cursor-pointer">
                        <XIcon size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* ─── CONTINUATION LOGIC CODES START HERE ─── */}
                <div className="flex items-center gap-2 text-gray-500 px-1">
                  <UserPlusIcon size={16} className="shrink-0 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type author and press Enter..."
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAuthor();
                      }
                    }}
                    className="flex-1 text-sm border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
                  />
                  <button type="button" onClick={addAuthor} className="text-cvsu-green-base p-0.5 hover:scale-105 transition-transform cursor-pointer">
                    <PlusCircleIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Research Adviser</label>
              <input type="text" name="adviser" value={formData.adviser} onChange={handleInputChange} placeholder="Full adviser title name..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Technical Critic</label>
              <input type="text" name="technical_critic" value={formData.technical_critic} onChange={handleInputChange} placeholder="Full panel technical critic name..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base" />
            </div>
          </div>

          {/* ─── 5. INTERACTIVE KEYWORD CHIP INPUT FIELD ─── */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Keywords</label>
            <div className="w-full p-2 rounded-xl border border-gray-200 bg-white min-h-44px flex flex-col justify-between focus-within:border-cvsu-green-base transition-all">
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {formData.keywords.map((word, index) => (
                  <span key={index} className="flex items-center gap-1 bg-cvsu-bg text-cvsu-green-base px-2 py-0.5 rounded-lg text-xs font-bold border border-cvsu-green-base/20">
                    {word}
                    <button type="button" onClick={() => removeKeyword(index)} className="hover:text-red-500 cursor-pointer">
                      <XIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-gray-500 px-1">
                <TagIcon size={16} className="shrink-0 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type keyword and press Enter..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1 text-sm border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
                />
                <button type="button" onClick={addKeyword} className="text-cvsu-green-base p-0.5 hover:scale-105 transition-transform cursor-pointer">
                  <PlusCircleIcon size={18} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Abstract Documentation Summary</label>
            <textarea 
              name="abstract" 
              value={formData.abstract} 
              onChange={handleInputChange} 
              placeholder="Paste historical study abstract content here..." 
              rows={4} 
              className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-cvsu-green-base resize-none" 
            />
          </div>

          {/* Optional PDF File Attachment Container */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col items-center justify-center text-center">
            <UploadCloudIcon className="text-gray-400 mb-2" size={28} />
            <span className="text-xs font-bold text-gray-600 font-montserrat uppercase">Document PDF File Attachment (Optional)</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Leave blank if legacy manuscript files are missing or out of contact.</p>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="mt-3 text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cvsu-green-base file:text-white file:cursor-pointer hover:file:bg-cvsu-green-dark" 
            />
            {pdfFile && <p className="text-xs text-cvsu-green-base font-bold mt-2">✓ Selected: {pdfFile.name}</p>}
          </div>

          {/* Form Action Controls Trigger Buttons Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={submitting} 
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="px-5 py-2.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Archiving..." : "Archive Record"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default UploadLegacyResearch;