import { motion } from "framer-motion";
import { XIcon } from "lucide-react";

type Props = {
  selectedAdmin: any;
  setSelectedAdmin: (value: any) => void;
};

const AdminDetailsModal = ({ selectedAdmin, setSelectedAdmin }: Props) => {
  if (!selectedAdmin) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-cvsu-green-base p-6 flex justify-between items-center text-white">
          <h3 className="font-montserrat font-bold uppercase tracking-widest">
            Admin Details
          </h3>
          <button onClick={() => setSelectedAdmin(null)}>
            <XIcon size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-cvsu-gray uppercase">Employee ID:</p>
              <p className="text-sm text-gray-700">{selectedAdmin.user_id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-cvsu-gray uppercase">Account Status:</p>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase">
                {selectedAdmin.account_status}
              </span>
            </div>
          </div>
          
          <hr className="border-gray-100" />
          
          <div>
            <p className="text-[10px] font-bold text-cvsu-gray uppercase">Full Name</p>
            <p className="text-gray-700">
              {`${selectedAdmin.first_name} ${selectedAdmin.middle_name} ${selectedAdmin.last_name} ${selectedAdmin.suffix}`}
            </p>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-cvsu-gray uppercase">Email Address</p>
            <p className="text-gray-700">{selectedAdmin.email}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-cvsu-gray uppercase">Contact Number</p>
            <p className="text-gray-700">{selectedAdmin.contact_number || "No contact info"}</p>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-cvsu-gray uppercase">User Role</p>
            <p className="text-gray-700 capitalize">{selectedAdmin.user_type}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDetailsModal;
