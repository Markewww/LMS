/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\login\index.tsx
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

// API CONFIG FILE AND UI CUSTOM ALERT INCLUSION 
import { API_BASE_URL } from "@/API/APIConfig";
import NotificationModal from "@/components/ui/alerts/NotificationModal";
import type { AlertType } from "@/components/ui/alerts/NotificationModal";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // MODAL TRIGGER ALERTS PACK CONFIG STATES
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });

  const labelStyles = "block text-[10px] font-black text-gray-400 uppercase mb-1 ml-1";

  const triggerAlert = (type: AlertType, title: string, message: string) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  const onSubmit = async (data: any) => {
    try {
      // Repaired broken template string literals from raw file parsing errors
      const response = await axios.post(`${API_BASE_URL}/login.php`, data);
      
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        if (user.type === "superadmin" || user.type === "admin") {
          navigate("/admin/dashboard");
        } else if (user.type === "student") {
          navigate("/student/dashboard");
        } else {
          triggerAlert("warning", "Unknown Designation", "The assigned account role type is unrecognized. Please contact technical support.");
          localStorage.removeItem("user");
        }
      } else {
        // Replaced raw web window alerts with the new modal error system
        triggerAlert("error", "Authentication Denied", response.data.message || "Invalid account identity credentials entered. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      triggerAlert("error", "System Synchronization Loss", "An error occurred while connecting to the database server. Check your connection layer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 sm:bg-cvsu-bg font-dm sm:px-4">
      {/* Mobile Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 bg-white rounded-full shadow-md text-cvsu-green-base sm:hidden z-50 p-2 border border-gray-100 cursor-pointer"
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
          <div className="inline-block p-3 bg-cvsu-green-50 rounded-full shadow-sm mb-4">
            <img
              src="/src/images/cvsu-logo.png"
              alt="CvSU Logo"
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain select-none pointer-events-none"
            />
          </div>
          <h2 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tight">Login</h2>
          <p className="text-cvsu-gray text-xs font-medium mt-1 uppercase tracking-wider">Reading Room Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="text-left">
            <label className={labelStyles}>Student / Admin ID</label>
            <input
              type="text"
              {...register("id", { required: "ID number is required" })}
              className="w-full p-3.5 bg-cvsu-green-50/50 border border-cvsu-green-100 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base transition-all text-sm font-medium"
              placeholder="Enter your ID number"
            />
            {errors.id && <p className="text-red-500 text-xs mt-1.5 font-bold pl-1">{String(errors.id.message)}</p>}
          </div>

          <div className="text-left">
            <label className={labelStyles}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password field is required" })}
                className="w-full p-3.5 bg-cvsu-green-50/50 border border-cvsu-green-100 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base pr-12 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cvsu-gray hover:text-cvsu-green-base transition-colors p-1 rounded cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-bold pl-1">{String(errors.password.message)}</p>}
          </div>

          <button 
            type="submit" 
            className="ceit-button w-full py-4 text-xs font-montserrat font-black uppercase tracking-widest text-white bg-cvsu-green-base hover:bg-cvsu-green-dark rounded-xl shadow-md cursor-pointer transition-all mt-2 active:scale-[0.99]"
          >
            Sign In
          </button>

          {/* SIGN UP ROUTE MATRIX LINK */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-cvsu-green-base hover:underline font-black cursor-pointer"
              >
                Register here
              </button>
            </p>
          </div>
        </form>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="hidden sm:block mt-6 text-gray-400 text-[10px] font-black uppercase hover:text-cvsu-green-base transition-all w-full text-center tracking-widest relative z-10 cursor-pointer"
        >
          ← Back to Homepage
        </button>
      </motion.div>

      {/* RENDER INJECTED CUSTOM NOTIFICATION OVERLAY CANVAS MODAL */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
};

export default Login;
