import { useState, type KeyboardEvent, useEffect } from "react";
import { XIcon } from "lucide-react";
import type { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from "react-hook-form";

type FormFieldProps = {
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSaveChanges: (data: any) => void;
  isEdit?: boolean;
  setValue: UseFormSetValue<any>; // Needed to sync chips back to form
  watch: UseFormWatch<any>;      // Needed to watch current author field
};

const FormField = ({ register, handleSubmit, onSaveChanges, isEdit = false, setValue, watch }: FormFieldProps) => {
  const [authors, setAuthors] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const labelStyle = "text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1 block";
  const inputStyle = "w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-cvsu-green-base outline-none transition-all";
  const readOnlyStyle = "w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed font-bold text-gray-500";

  // LOAD EXISTING AUTHORS IF EDITING
  const existingAuthors = watch("author");
  useEffect(() => {
    if (isEdit && existingAuthors && authors.length === 0) {
      // Split the comma-separated string from DB back into chips
      setAuthors(existingAuthors.split(", ").map((a: string) => a.trim()));
    }
  }, [existingAuthors, isEdit]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !authors.includes(val)) {
        const newAuthors = [...authors, val];
        setAuthors(newAuthors);
        setInputValue("");
        // Sync with hidden form field
        setValue("author", newAuthors.join(", "));
      }
    }
  };

  const removeAuthor = (index: number) => {
    const newAuthors = authors.filter((_, i) => i !== index);
    setAuthors(newAuthors);
    setValue("author", newAuthors.join(", "));
  };

  return (
    <form onSubmit={handleSubmit(onSaveChanges)} className="space-y-6">
      <div className="space-y-4">
        <h5 className="text-[11px] font-black text-cvsu-green-dark border-b border-gray-100 pb-1 uppercase tracking-wider">Resource Identification</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className={labelStyle}>Accession No. (UUID)</label>
            <input {...register("book_id")} readOnly={isEdit} className={isEdit ? readOnlyStyle : inputStyle} />
          </div>
          <div className="md:col-span-3">
            <label className={labelStyle}>Book Title</label>
            <input {...register("title", { required: true })} className={inputStyle} placeholder="ENTER TITLE" />
          </div>
        </div>

        {/* MULTI-CHIP AUTHOR FIELD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelStyle}>Author(s) - Press Enter to Add</label>
            <div className={`${inputStyle} flex flex-wrap gap-2 items-center min-h-11`}>
              {authors.map((author, index) => (
                <span key={index} className="flex items-center gap-1 bg-cvsu-green-base text-white px-2 py-1 rounded-full text-[11px] font-bold">
                  {author}
                  <button type="button" onClick={() => removeAuthor(index)} className="hover:text-red-200 transition-colors">
                    <XIcon size={12} />
                  </button>
                </span>
              ))}
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={authors.length === 0 ? "Type and press Enter..." : ""}
                className="flex-1 bg-transparent outline-none min-w-37.5"
              />
              {/* Hidden field to keep register working */}
              <input type="hidden" {...register("author", { required: "At least one author required" })} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelStyle}>Publisher</label>
            <input {...register("publisher")} className={inputStyle} placeholder="Publisher Name" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h5 className="text-[11px] font-black text-cvsu-green-dark border-b border-gray-100 pb-1 uppercase tracking-wider">Classification & Inventory</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>ISBN / ISSN</label>
            <input {...register("isbn")} className={`${inputStyle} font-mono`} placeholder="000-0-00-000000-0" />
          </div>
          <div>
            <label className={labelStyle}>Resource Type</label>
            <select {...register("type", { required: true })} className={inputStyle}>
              <option value="book">Book</option>
              <option value="magazine">Magazine</option>
              <option value="journal">Journal</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Copyright Year</label>
            <input type="number" {...register("copyright_year")} className={inputStyle} placeholder="YYYY" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Category (Genre)</label>
            <select {...register("category")} className={inputStyle}>
              <option value="General">General</option>
              <option value="Science">Science & Tech</option>
              <option value="Fiction">Fiction</option>
              <option value="History">History</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Stock Quantity</label>
            <input type="number" {...register("stock", { required: true, min: 0 })} className={inputStyle} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button type="submit" className="bg-cvsu-green-base text-white px-8 py-2.5 rounded-xl font-bold text-xs hover:bg-cvsu-green-dark transition-all shadow-lg shadow-cvsu-green-base/20 uppercase tracking-widest">
          {isEdit ? "Update Inventory Record" : "Save to Inventory"}
        </button>
      </div>
    </form>
  );
};

export default FormField;
