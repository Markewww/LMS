import { SaveIcon, LockIcon } from "lucide-react";

type Props = {
  register: any;
  handleSubmit: any;
  onSaveChanges: (data: any) => void;
  selectedAdmin: any; // Add this prop to check the user_type
};

const FormField = ({ register, handleSubmit, onSaveChanges, selectedAdmin }: Props) => {
  // Check if the admin being edited is a superadmin
  const isSuperAdmin = selectedAdmin?.user_type === "superadmin";

  return (
    <form onSubmit={handleSubmit(onSaveChanges)} className="space-y-6">
      {isSuperAdmin && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-[10px] font-bold uppercase mb-4">
          <LockIcon size={14} />
          Superadmin profiles are protected. Only the password can be updated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERSONAL INFORMATION */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">First Name</label>
            <input
              {...register("first_name")}
              disabled={isSuperAdmin} // Disable if Superadmin
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Middle Name</label>
            <input
              {...register("middle_name")}
              disabled={isSuperAdmin}
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Last Name</label>
            <input
              {...register("last_name")}
              disabled={isSuperAdmin}
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
        </div>

        {/* ACCOUNT & CONTACT */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              disabled={isSuperAdmin}
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Contact Number</label>
            <input
              {...register("contact_number")}
              disabled={isSuperAdmin}
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Suffix</label>
            <input
              {...register("suffix")}
              disabled={isSuperAdmin}
              className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all ${
                isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
              }`}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PASSWORD - ALWAYS ENABLED */}
        <div>
          <label className="block text-[10px] font-black text-red-600 uppercase mb-1">New Password</label>
          <input
            type="password"
            {...register("password")}
            placeholder="Change Password"
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none text-sm transition-all"
          />
        </div>
        
        {/* STATUS CONTROL */}
        <div>
          <label className="block text-[10px] font-black text-cvsu-green-dark uppercase mb-1">Update Status</label>
          <select
            {...register("account_status")}
            disabled={isSuperAdmin}
            className={`w-full px-4 py-2 border rounded-lg outline-none text-sm transition-all appearance-none ${
              isSuperAdmin ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-white border-gray-200 focus:ring-2 focus:ring-cvsu-green-base"
            }`}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-cvsu-green-base text-white py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-cvsu-green-dark transition-colors flex items-center justify-center gap-2"
        >
          <SaveIcon size={16} /> Save Changes
        </button>
      </div>
    </form>
  );
};

export default FormField;
