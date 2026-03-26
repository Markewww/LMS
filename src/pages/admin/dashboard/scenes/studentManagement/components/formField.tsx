import type { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";

type FormFieldProps = {
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  onSaveChanges: (data: any) => void;
};

const FormField = ({ register, handleSubmit, onSaveChanges }: FormFieldProps) => {
  const labelStyle = "text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1 block";
  const inputStyle = "w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-cvsu-green-base outline-none transition-all";
  const readOnlyStyle = "w-full p-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed font-bold text-gray-500";

  return (
    <form onSubmit={handleSubmit(onSaveChanges)} className="space-y-6">
      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="space-y-4">
        <h5 className="text-[11px] font-black text-cvsu-green-dark border-b border-gray-100 pb-1 uppercase">Personal Information</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className={labelStyle}>Student ID</label>
            <input {...register("student_id")} readOnly className={readOnlyStyle} />
          </div>
          <div className="md:col-span-1">
            <label className={labelStyle}>First Name</label>
            <input {...register("first_name")} className={inputStyle} placeholder="John" />
          </div>
          <div className="md:col-span-1">
            <label className={labelStyle}>Middle Name</label>
            <input {...register("middle_name")} className={inputStyle} placeholder="D." />
          </div>
          <div className="md:col-span-1">
            <label className={labelStyle}>Last Name</label>
            <input {...register("last_name")} className={inputStyle} placeholder="Doe" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
                <label className={labelStyle}>Suffix</label>
                <input {...register("suffix")} className={inputStyle} placeholder="Jr. / III" />
            </div>
            <div className="md:col-span-3">
                <label className={labelStyle}>Program (Course)</label>
                <select {...register("course", { required: true })} className={inputStyle}>
                    <option value="">Select Program</option>
                    <option value="BSABE">BS Agricultural and Biosystems Engineering</option>
                    <option value="BS ARCHI">BS Architecture</option>
                    <option value="BSCE">BS Civil Engineering</option>
                    <option value="BSCpE">BS Computer Engineering</option>
                    <option value="BSCS">BS Computer Science</option>
                    <option value="BSEE">BS Electrical Engineering</option>
                    <option value="BSECE">BS Electronics Engineering</option>
                    <option value="BSIE">BS Industrial Engineering</option>
                    <option value="BSIT">BS Information Technology</option>
                </select>
            </div>
        </div>
      </div>

      {/* SECTION 2: CONTACT & ACCOUNT */}
      <div className="space-y-4">
        <h5 className="text-[11px] font-black text-cvsu-green-dark border-b border-gray-100 pb-1 uppercase">Account & Contact</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Email Address</label>
            <input {...register("email")} type="email" className={inputStyle} placeholder="email@example.com" />
          </div>
          <div>
            <label className={labelStyle}>Contact Number</label>
            <input 
            {...register("contact_number")} 
            className={inputStyle} 
            placeholder="09XXXXXXXXX" 
            autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Account Status</label>
            <select {...register("account_status")} className={inputStyle}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>New Password</label>
            <input 
              {...register("password")} 
              type="password" 
              placeholder="Leave blank to keep current" 
              className={inputStyle} 
            />
          </div>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button type="submit" className="bg-cvsu-green-base text-white px-8 py-2.5 rounded-xl font-bold text-xs hover:bg-cvsu-green-dark transition-all shadow-lg shadow-cvsu-green-base/20 uppercase tracking-widest">
          Update Student Record
        </button>
      </div>
    </form>
  );
};

export default FormField;
