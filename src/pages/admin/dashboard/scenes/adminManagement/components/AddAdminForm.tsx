import { UserPlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";

type Props = {
  onSubmit: (data: any) => void;
};

const AddAdminForm = ({ onSubmit }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const handleInternalSubmit = async (data: any) => {
    await onSubmit(data);
    reset();
  }

  const labelStyle = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";
  const inputStyle = "w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base transition-all text-sm";
  const errorStyle = "text-red-500 text-[10px] mt-1 font-bold";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center gap-2 mb-6">
        <UserPlusIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">
          Add New Administrator
        </h3>
      </div>

      <form onSubmit={handleSubmit(handleInternalSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Employee ID */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Employee ID</label>
          <input 
            {...register("user_id", { 
            required: "Employee ID is required",
            pattern: {
              value: /^[a-zA-Z0-9-]+$/,
              message: "Only letters, numbers, and dashes allowed"
            }
          })} 
            className={inputStyle} 
            placeholder="EMP-2025-001" 
          />
          {errors.user_id && <p className={errorStyle}>{errors.user_id.message as string}</p>}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Email Address</label>
          <input 
            {...register("email", { 
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@cvsu\.edu\.ph$/,
              message: "Must be a valid @cvsu.edu.ph email"
            }
          })} 
            className={inputStyle} 
            placeholder="example@cvsu.edu.ph" 
          />
          {errors.email && <p className={errorStyle}>{errors.email.message as string}</p>}
        </div>

        {/* Contact */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Contact Number</label>
          <input 
            {...register("contact_number", { 
            required: "Required",
            pattern: {
                value: /^09\d{9}$/,
                message: "Must be a valid 11-digit Philippine mobile number starting with 09"
            }
          })} 
            className={inputStyle} 
            placeholder="09123456789" 
          />
        </div>

        {/* First Name */}
        <div className="md:col-span-2">
          <label className={labelStyle}>First Name</label>
          <input 
            {...register("first_name", { required: true })} 
            className={inputStyle} 
            placeholder="Juan" 
          />
        </div>

        {/* Last Name */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Last Name</label>
          <input 
            {...register("last_name", { required: true })} 
            className={inputStyle} 
            placeholder="Dela Cruz" 
          />
        </div>

        {/* Middle Name */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Middle Name</label>
          <input 
            {...register("middle_name")} 
            className={inputStyle} 
            placeholder="Santos" 
          />
        </div>

        {/* Suffix */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Suffix</label>
          <input 
            {...register("suffix")} 
            className={inputStyle} 
            placeholder="Jr. / III" 
          />
        </div>

        {/* Password */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Initial Password</label>
          <input 
            type="password" 
            {...register("password", { 
            required: "Password is required",
            minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
            }
          })} 
            className={inputStyle} 
            placeholder="••••••••" 
          />
            {errors.password && <p className={errorStyle}>{errors.password.message as string}</p>}
        </div>

        <div className="md:col-span-4 flex items-end pt-4">
          <button type="submit" className="ceit-button w-full uppercase">
            Register Admin Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdminForm;
