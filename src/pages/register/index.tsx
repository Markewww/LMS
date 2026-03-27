import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, EyeIcon, EyeOffIcon, } from "lucide-react";
import { useState } from "react";
import axios from "axios";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register.php`, data);

      // DEBUG LOGS
      console.log("Raw Response:", response);
      console.log("Data from PHP:", response.data);

      if (response.data.success) {
        alert("Registration successful and it is for admin approval! ");
        navigate("/login");
      } else {
        alert("Registration failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during registration. Please try again later.");
    }
  };

  const inputStyles = "w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base transition-all text-sm";
  const labelStyles = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";
   const errorStyle = "text-red-500 text-[10px] mt-1 font-bold";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 sm:bg-cvsu-bg font-dm sm:px-4 sm:py-12">
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 p-2 bg-white rounded-full shadow-md text-cvsu-green-base sm:hidden z-50 transition-transform active:scale-90"
      >
        <ArrowLeft size={24} />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full min-h-screen sm:h-auto sm:min-h-0 sm:max-w-lg bg-white p-8 sm:p-10 flex flex-col justify-center sm:rounded-3xl shadow-2xl border-t-0 sm:border-t-8 border-cvsu-green-base relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-cvsu-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        {/* LOGO AND HEADER SECTION */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-block p-3 bg-cvsu-green-50 rounded-full mb-4 shadow-sm">
            <img 
              src="/src/images/cvsu-logo.png" 
              alt="CvSU Logo" 
              className="h-14 w-14 sm:h-16 sm:w-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tighter leading-none">
            Register
          </h2>
          <p className="text-cvsu-gray text-xs font-bold uppercase tracking-widest mt-2">
            Create your Library Account
          </p>
        </div>

        <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-3.5 relative z-10">
          {/* NAME FIELDS GRID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyles}>First Name</label>
              <input 
                {...register("first_name", { 
                  required: "Required",
                  pattern: { value: /^[A-Za-zñÑ\s]+$/, message: "Letters only" }
                })} 
                className={inputStyles}
                placeholder="Juan"
              />
              {errors.first_name && <p className={errorStyle}>{errors.first_name.message as string}</p>}
            </div>
            <div>
              <label className={labelStyles}>Last Name</label>
              <input 
                {...register("last_name", { 
                  required: "Required",
                  pattern: { value: /^[A-Za-zñÑ\s]+$/, message: "Letters only" }
                })} 
                className={inputStyles} 
                placeholder="Dela Cruz"
              />
              {errors.last_name && <p className={errorStyle}>{errors.last_name.message as string}</p>}
            </div>
          </div>

          {/* STUDENT NUMBER */}
          <div>
            <label className={labelStyles}>Student Number</label>
            <input 
              {...register("student_id", { 
                required: "Required",
                pattern: {value: /^[0-9]+$/, message: "Numbers only"},
                minLength: {value: 9, message: "Must be 9 digits"},
                maxLength: {value: 9, message: "Must be 9 digits"}
            })}
              className={inputStyles}
              placeholder="202XXXXXX"
            />
            {errors.student_id && <p className={errorStyle}>{errors.student_id.message as string}</p>}
          </div>

          {/* EMAIL ADDRESS */}
          <div>
            <label className={labelStyles}>Email Address</label>
            <input 
              {...register("email", { 
              required: "Required", 
              pattern: { value: /^[a-zA-Z0-9._%+-]+@cvsu\.edu\.ph$/, message: "Use @cvsu.edu.ph" } 
            })} 
              className={inputStyles}
              placeholder="student@cvsu.edu.ph"
            />
            {errors.email && <p className={errorStyle}>{errors.email.message as string}</p>}
          </div>

          {/* COURSE SELECTION */}
          <div>
            <label className={labelStyles}>Course / Program</label>
            <select 
              {...register("course", { required: true })} 
              className={inputStyles}>
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

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <label className={labelStyles}>Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Required",
                minLength: { value: 8, message: "Min 8 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_+.])[A-Za-z\d@_+.]{8,}$/,
                  message: "Must have Big, Small, Number, & Symbol (@ _ + .)"
                }
              })} 
                className={`${inputStyles} pr-12`}
                placeholder="••••••••"
              />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green hover:text-cvsu-green-base transition-colors p-1"
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
              </div>
            {errors.password && <p className={errorStyle}>{errors.password.message as string}</p>}
          </div>

          <div className="pt-2">
            <button type="submit" className="ceit-button w-full py-4 text-sm font-black tracking-widest shadow-lg shadow-cvsu-green-base/20 transition-all active:scale-95 uppercase">
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-cvsu-green-base hover:underline font-black"
            >
              Login here
            </button>
          </p>
        </div>

        {/* Desktop Back Button */}
        <button 
          onClick={() => navigate("/")}
          className="hidden sm:block mt-6 text-gray-400 text-[10px] font-black uppercase hover:text-cvsu-green-base transition-all w-full text-center tracking-widest relative z-10"
        >
          ← Back to Homepage
        </button>
      </motion.div>
    </div>
  );
};

export default Register;
