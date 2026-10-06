 
import React, { useState } from "react";
import { Keyboard, ArrowRight, ShieldCheck } from "lucide-react";

interface KioskToolbarProps {
  currentStudent: { id: string; name: string } | null;
  onManualSubmit: (scannedValue: string) => void;
  onResetSession: () => void;
}

const KioskToolbar = ({ currentStudent, onManualSubmit, onResetSession }: KioskToolbarProps) => {
  const [manualInput, setManualInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = manualInput.trim();
    if (!cleanValue) return;

    onManualSubmit(cleanValue);
    setManualInput(""); // Flush search input line right away
  };

  return (
    <div className="w-full bg-gray-50 border border-gray-200/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-dm shadow-xs">
      {/* LEFT BLOCK: STATUS IDENTIFICATION LABELS */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
          currentStudent ? "bg-cvsu-green-base text-white shadow-sm" : "bg-blue-50 text-blue-600"
        }`}>
          {currentStudent ? <ShieldCheck size={20} /> : <Keyboard size={20} />}
        </div>
        <div className="text-left">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest font-montserrat">
            Circulation Mode Override
          </h4>
          <p className="text-sm font-bold text-gray-800 mt-0.5">
            {currentStudent ? (
              <span>
                Active Borrower: <span className="text-cvsu-green-base uppercase font-black">{currentStudent.name}</span>
              </span>
            ) : (
              <span className="text-gray-500 italic">Awaiting manual checkout routing criteria...</span>
            )}
          </p>
        </div>
      </div>

      {/* RIGHT BLOCK: INTERACTIVE FORM INPUT OVERRIDE */}
      <form onSubmit={handleSubmit} className="flex flex-1 max-w-md items-center gap-2 w-full">
        <div className="relative w-full group">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={
              !currentStudent 
                ? "Enter Student log or ID card number..." 
                : "Enter Book Barcode or Manuscript QR text..."
            }
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all font-mono placeholder:font-dm placeholder:italic"
          />
          <button
            type="submit"
            disabled={!manualInput.trim()}
            title="Commit track log input overrides"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-cvsu-green-base hover:bg-cvsu-green-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all cursor-pointer"
          >
            <ArrowRight size={14} />
          </button>
        </div>

        {/* FLUSH ACTIONS BUTTON TO DISCARD UNCOMMITTED LEDGERS */}
        {currentStudent && (
          <button
            type="button"
            onClick={onResetSession}
            className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 font-montserrat font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-red-100 transition-all cursor-pointer whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </form>
    </div>
  );
};

export default KioskToolbar;
