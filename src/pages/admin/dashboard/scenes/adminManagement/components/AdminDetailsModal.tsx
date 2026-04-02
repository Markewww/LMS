import { useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon, SaveIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";

// Components
import FormField from "./formField";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

type Props = {
  selectedAdmin: any;
  setSelectedAdmin: (value: any) => void;
  onUpdate: () => void;
};

const AdminDetailsModal = ({ selectedAdmin, setSelectedAdmin, onUpdate }: Props) => {
  const { register, handleSubmit, reset } = useForm({ 
    defaultValues: selectedAdmin
  });

  // Sync form values when a new admin is selected
  useEffect(() => {
    if (selectedAdmin) {
      reset({
        ...selectedAdmin,
        password: "" // Keep password field empty for security
      });
    }
  }, [selectedAdmin, reset]);

  if (!selectedAdmin) return null;

  const onSaveChanges = async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_admin.php`, data);
      if (response.data.success) {
        alert("Administrator profile updated successfully!");
        onUpdate(); // Triggers fetchAdmins() in the parent index.tsx
        setSelectedAdmin(null);
      } else {
        alert("Update failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-dm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <div className="bg-cvsu-green-base p-4 flex justify-between items-center text-white">
          <h3 className="font-montserrat font-bold uppercase tracking-widest text-sm">
            Manage Admin Profile
          </h3>
          <button onClick={() => setSelectedAdmin(null)} className="hover:rotate-90 transition-transform">
            <XIcon size={24}/>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* READ-ONLY INFO SECTION */}
          <div className="grid grid-cols-2 gap-4 bg-cvsu-bg p-4 rounded-xl border border-cvsu-green-base/10">
            <div>
              <p className="text-[10px] font-black text-cvsu-green-dark uppercase">Employee ID</p>
              <p className="text-sm font-bold text-gray-700">{selectedAdmin.user_id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-cvsu-green-dark uppercase">Account Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                selectedAdmin.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {selectedAdmin.account_status || 'Active'}
              </span>
            </div>
          </div>

          {/* EDITABLE FORM SECTION */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <SaveIcon className="text-cvsu-green-base" size={20} />
              <h4 className="font-bold text-cvsu-green-dark uppercase text-xs">Edit Information</h4>
            </div>
            
            {/* Reuse your existing FormField component */}
            <FormField 
              key={selectedAdmin.user_id}
              register={register} 
              handleSubmit={handleSubmit} 
              onSaveChanges={onSaveChanges} 
              selectedAdmin={selectedAdmin} 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDetailsModal;
