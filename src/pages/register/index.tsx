import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log("Registering User:", data);
    // Logic for XAMPP/PHP will go here later
    alert("Registration Successful! You can now log in.");
    navigate("/login");
  };

  const inputStyles = "w-full p-3 bg-cvsu-green-50 border border-cvsu-green-100 rounded-lg outline-none focus:ring-2 focus:ring-cvsu-green-base transition-all";
  const labelStyles = "block text-sm font-bold text-cvsu-green-dark mb-1 uppercase";

  return (
    <div className="min-h-screen flex items-center justify-center bg-cvsu-bg font-dm px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="ceit-card w-full max-w-lg bg-white p-10 border-t-8 border-cvsu-green-base shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-montserrat font-black text-cvsu-green-base uppercase tracking-tighter">Student Registration</h2>
          <p className="text-cvsu-gray text-sm mt-2">Create an account to generate your Library QR ID</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* FULL NAME */}
          <div>
            <label className={labelStyles}>Full Name</label>
            <input 
              type="text" 
              {...register("name", { required: "Full name is required" })}
              className={inputStyles}
              placeholder="Dela Cruz, Juan A."
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
          </div>

          {/* STUDENT NUMBER */}
          <div>
            <label className={labelStyles}>Student Number</label>
            <input 
              type="text" 
              {...register("studentNumber", { required: "Student number is required" })}
              className={inputStyles}
              placeholder="202XXXXXX"
            />
            {errors.studentNumber && <p className="text-red-500 text-xs mt-1">{String(errors.studentNumber.message)}</p>}
          </div>

          {/* COURSE SELECTION */}
          <div>
            <label className={labelStyles}>Course</label>
            <select 
              {...register("course", { required: "Please select your course" })}
              className={inputStyles}
            >
              <option value="">Select Course</option>
              <option value="BSIT">BS Information Technology</option>
              <option value="BSCS">BS Computer Science</option>
              <option value="BSCE">BS Civil Engineering</option>
              <option value="BSEE">BS Electrical Engineering</option>
              <option value="BSCpE">BS Computer Engineering</option>
            </select>
          </div>

          {/* PASSWORD */}
          <div>
            <label className={labelStyles}>Password</label>
            <input 
              type="password" 
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
              className={inputStyles}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
          </div>

          <button type="submit" className="ceit-button w-full py-4 text-lg uppercase mt-4">
            Create Account
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-cvsu-gray text-sm">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-cvsu-green-base font-bold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
