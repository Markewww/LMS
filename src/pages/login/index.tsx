import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
      try {
        const response = await axios.post("http://localhost/LMS/src/API/login.php", data);
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
    <div className="min-h-screen flex items-center justify-center bg-cvsu-bg font-dm px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="ceit-card w-full max-w-md bg-white p-10 border-t-8 border-cvsu-green-base shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase">CEIT Login</h2>
          <p className="text-cvsu-gray text-sm mt-2">Access the Reading Room Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-cvsu-green-dark mb-2">STUDENT/ADMIN ID</label>
            <input 
              type="text" 
              {...register("id", { required: "ID is required" })}
              className="w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-lg outline-none focus:ring-2 focus:ring-cvsu-green-base"
              placeholder="Enter your ID"
            />
            {errors.id && <p className="text-red-500 text-xs mt-1">{String(errors.id.message)}</p>}
          </div>

           <div>
            <label className="block text-sm font-bold text-cvsu-green-dark mb-2 uppercase">Password</label>
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
          <div className="text-center mt-4">
            <p className="text-cvsu-gray text-sm">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate("/register")}
                className="text-cvsu-green-base font-bold hover:underline transition"
              >
                Register
              </button>
            </p>
          </div>
        </form>

        <button 
          onClick={() => navigate("/")}
          className="mt-6 text-cvsu-gray text-sm hover:text-cvsu-green-base transition w-full text-center"
        >
          ← Back to Homepage
        </button>
      </motion.div>
    </div>
  );
};

export default Login;
