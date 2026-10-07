// src\components\shared\AccountSettings.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ChevronRight } from "lucide-react";
import ChangePassword from "./ChangePassword"; 

const AccountSettings = () => {
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  return (
    // UPDATED: max-w-none and w-full ensures the component expands across the entire available workspace canvas area
    <div className="w-full max-w-none bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm text-left font-dm select-none transition-all duration-300">
      
      {/* SECTION CARD INTERACTIVE TOGGLE HEADER VIEW */}
      <div 
        onClick={() => setIsFormExpanded(!isFormExpanded)}
        className="flex items-center justify-between border-b border-gray-50 mb-2 cursor-pointer group hover:opacity-95 transition-opacity"
        title={isFormExpanded ? "Click to collapse security form" : "Click to expand security form"}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-cvsu-bg rounded-xl text-cvsu-green-base border border-cvsu-green-base/5 shadow-2xs group-hover:bg-cvsu-green-base group-hover:text-white transition-all duration-200">
            <KeyRound size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-montserrat font-black uppercase text-gray-800 text-sm tracking-wide group-hover:text-cvsu-green-base transition-colors">
              Update Security Credentials
            </h3>
            <p className="text-[11px] text-gray-400 font-medium truncate">
              Modify account password protocols protecting reading room profiles
            </p>
          </div>
        </div>

        {/* UPDATED: Rotates a single ChevronRight icon dynamically based on the state variable */}
        <motion.div 
          animate={{ rotate: isFormExpanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-gray-400 group-hover:text-cvsu-green-base pl-2 shrink-0"
        >
          <ChevronRight size={18} />
        </motion.div>
      </div>

      {/* UPDATED: Smooth Height-Expanding Dropdown Animation Wrapper Container */}
      <AnimatePresence initial={false}>
        {isFormExpanded && (
          <motion.div
            key="password-form-drawer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            className="overflow-hidden"
          >
            <ChangePassword onSuccessClose={() => setIsFormExpanded(false)} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AccountSettings;
