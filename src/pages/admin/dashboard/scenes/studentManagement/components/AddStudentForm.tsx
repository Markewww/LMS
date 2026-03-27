import { useForm } from "react-hook-form";
import { UserPlusIcon } from "lucide-react";

type Props = {
  onSubmit: (data: any) => void;
};

const AddStudentForm = ({ onSubmit }: Props) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Helper function to capitalize every first letter of each word in a string
  const formatName = (name: string) => {
      if (!name) return "";
            return name
          .toLowerCase()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
  }

  const handleInternalSubmit = async (data: any) => {
    const formData = {
      ...data,
      first_name: formatName(data.first_name),
      last_name: formatName(data.last_name),
      middle_name: formatName(data.middle_name),
      qr_data: `CEIT-RR-STUDENT-${data.student_id}`
    };
    await onSubmit(formData);
    reset();
  };

  const labelStyle = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";
  const inputStyle = "w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base transition-all text-sm";
  const errorStyle = "text-red-500 text-[10px] mt-1 font-bold";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
      <div className="flex items-center gap-2 mb-6">
        <UserPlusIcon className="text-cvsu-green-base" size={24} />
        <h3 className="font-montserrat font-black text-cvsu-green-dark uppercase">Direct Student Registration</h3>
      </div>

      <form onSubmit={handleSubmit(handleInternalSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* STUDENT ID FIELD */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Student ID</label>
          <input 
            {...register("student_id", { 
                required: "Required",
                pattern: {value: /^[0-9]+$/, message: "Numbers only"},
                minLength: {value: 9, message: "Must be 9 digits"},
                maxLength: {value: 9, message: "Must be 9 digits"}
            })}
               className={inputStyle} 
               placeholder="20XXXXXXX" 
          />
          {errors.student_id && <p className={errorStyle}>{errors.student_id.message as string}</p>}
        </div>

        {/* EMAIL FIELD */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Email (@cvsu.edu.ph)</label>
          <input 
            {...register("email", { 
              required: "Required", 
              pattern: { value: /^[a-zA-Z0-9._%+-]+@cvsu\.edu\.ph$/, message: "Use @cvsu.edu.ph" } 
            })} 
            className={inputStyle} 
            placeholder="student@cvsu.edu.ph" 
          />
          {errors.email && <p className={errorStyle}>{errors.email.message as string}</p>}
        </div>

        {/* NAMES FIELD */}
        <div>
          <label className={labelStyle}>First Name</label>
          <input 
            {...register("first_name", { 
              required: "Required",
              pattern: { value: /^[A-Za-zñÑ\s]+$/, message: "Letters only" }
            })} 
            className={inputStyle} 
          />
          {errors.first_name && <p className={errorStyle}>{errors.first_name.message as string}</p>}
        </div>

        <div>
          <label className={labelStyle}>Last Name</label>
          <input 
            {...register("last_name", { 
              required: "Required",
              pattern: { value: /^[A-Za-zñÑ\s]+$/, message: "Letters only" }
            })} 
            className={inputStyle} 
          />
          {errors.last_name && <p className={errorStyle}>{errors.last_name.message as string}</p>}
        </div>

        <div>
          <label className={labelStyle}>Middle Name</label>
          <input 
            {...register("middle_name", { 
              pattern: { value: /^[A-Za-zñÑ\s]+$/, message: "Letters only" }
            })} 
            className={inputStyle} 
          />
          {errors.middle_name && <p className={errorStyle}>{errors.middle_name.message as string}</p>}
        </div>

        {/* PROGRAM FIELD */}
        <div>
          <label className={labelStyle}>Program (Course)</label>
          <select 
            {...register("course", { required: true })} 
            className={inputStyle}>
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
                <option value="BSIT-AT">Automotive Technology</option>
                <option value="BSIT-ET">Electrical Technology</option>
                <option value="BSIT-ELEX">Electronics Technology</option>
            </optgroup>
            <option value="BSIT">Bachelor of Science in Information Technology</option>
          </select>
        </div>

        {/* PASSWORD: Min 8, Big/Small letters, Number, Symbol (@cvsu rules) */}
        <div className="md:col-span-2">
          <label className={labelStyle}>Password</label>
          <input 
            type="password" 
            {...register("password", { 
              required: "Required",
              minLength: { value: 8, message: "Min 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_+.])[A-Za-z\d@_+.]{8,}$/,
                message: "Must have Big, Small, Number, & Symbol (@ _ + .)"
              }
            })} 
            className={inputStyle} 
            placeholder="••••••••" 
          />
          {errors.password && <p className={errorStyle}>{errors.password.message as string}</p>}
        </div>
        <div className="md:col-span-4 pt-4">
          <button type="submit" className="ceit-button w-full">REGISTER STUDENT & GENERATE QR</button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
