import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { EyeIcon, EyeOffIcon, ArrowLeft, } from "lucide-react";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const labelStyles = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";

  const onSubmit = async (data: any) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/login.php`, data);
        if (response.data.success) {
            const user = response.data.user;
            // Store user data in the browser's storage (for session management)
            localStorage.setItem("user", JSON.stringify(user));

            if (user.type === "superadmin" || user.type === "admin") {
                navigate("/admin/dashboard");
            } else if (user.type === "student") {
                navigate("/student/dashboard");
            } else {
                alert("Unknown user type. Please contact support.");
                localStorage.removeItem("user");
            }
        } else {
            alert("Login failed: " + response.data.message);
        }
      } catch (error) {
        console.error("Login Error:", error);
        alert("An error occurred during login. Please try again later.");
      }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 sm:bg-cvsu-bg font-dm sm:px-4">
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 bg-white rounded-full shadow-md text-cvsu-green-base sm:hidden z-50"
      >
        <ArrowLeft size={24} />
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-screen sm:h-auto sm:max-w-md bg-white p-8 sm:p-10 flex flex-col justify-center sm:rounded-3xl shadow-2xl border-t-0 sm:border-t-8 border-cvsu-green-base relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-cvsu-green-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="text-center mb-8 relative z-10">
          <div className="inline-block p-3 bg-cvsu-green-50 rounded-full shadow-sm">
            <img 
              src="/src/images/cvsu-logo.png" 
              alt="CvSU Logo" 
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            />
          </div>
          <h2 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase">Login</h2>
          <p className="text-cvsu-gray text-sm mt-2">Access the Reading Room Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className={labelStyles}>STUDENT/ADMIN ID</label>
            <input 
              type="text" 
              {...register("id", { required: "ID is required" })}
              className="w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-lg outline-none focus:ring-2 focus:ring-cvsu-green-base"
              placeholder="Enter your ID"
            />
            {errors.id && <p className="text-red-500 text-xs mt-1">{String(errors.id.message)}</p>}
          </div>

           <div>
            <label className={labelStyles}>Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                className="w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-lg outline-none focus:ring-2 focus:ring-cvsu-green-base pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cvsu-gray hover:text-cvsu-green-base transition-colors"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" className="ceit-button w-full py-4 text-lg">
            SIGN IN
          </button>

          {/* SIGN UP LINK */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate("/register")}
                className="text-cvsu-green-base hover:underline font-black"
              >
                Register here
              </button>
            </p>
          </div>
        </form>

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

export default Login;
