/* eslint-disable @typescript-eslint/no-explicit-any */
// src\components\shared\ChangePassword.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import NotificationModal from "@/components/ui/alerts/NotificationModal";
import type { AlertType } from "@/components/ui/alerts/NotificationModal";

interface ChangePasswordProps {
  onSuccessClose?: () => void;
}

const ChangePassword = ({ onSuccessClose }: ChangePasswordProps) => {
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean; type: AlertType; title: string; message: string;
  }>({ isOpen: false, type: "info", title: "", message: "" });

  const triggerAlert = (type: AlertType, title: string, message: string) => {
    setAlertConfig({ isOpen: true, type, title, message });
  };

  const toggleVisibility = (field: string) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (formData: any) => {
    const userSession = localStorage.getItem("user");
    if (!userSession) return;

    const parsedUser = JSON.parse(userSession);
    setSubmitting(true);

    try {
      // Build transmission payloads directly to map your unified user_id column contract
      const response = await axios.post(`${API_BASE_URL}/auth/change_password.php`, {
        user_id: parsedUser.id || parsedUser.student_id || parsedUser.employee_id,
        current_password: formData.current_password,
        new_password: formData.new_password
      });

      if (response.data.success) {
        triggerAlert("success", "Security Updated", response.data.message);
        reset(); 
        if (onSuccessClose) {
          setTimeout(() => onSuccessClose(), 1500); 
        }
      } else {
        triggerAlert("error", "Verification Error", response.data.message);
      }
    } catch (err) {
      console.error(err);
      triggerAlert("error", "Synchronization Drop", "Failed connecting to password authentication manager.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles = "w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base text-xs font-medium transition-all pr-10 mt-1";
  const labelStyles = "block text-[10px] font-black text-gray-400 uppercase tracking-wider font-montserrat";

  return (
    <div className="pt-4 max-w-xl text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* INPUT: CURRENT PASSWORD */}
        <div className="relative">
          <label className={labelStyles}>Current Password</label>
          <input
            type={showPass.curr ? "text" : "password"}
            {...register("current_password", { required: "Current password is required" })}
            placeholder="Enter current password"
            className={inputStyles}
          />
          <button
            type="button"
            onClick={() => toggleVisibility("curr")}
            className="absolute right-3 bottom-3.5 text-gray-400 hover:text-cvsu-green-base cursor-pointer p-0.5"
          >
            {showPass.curr ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.current_password && (
            <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">
              {String(errors.current_password.message)}
            </p>
          )}
        </div>

        {/* INPUT: NEW PASSWORD */}
        <div className="relative">
          <label className={labelStyles}>New Secure Password</label>
          <input
            type={showPass.new ? "text" : "password"}
            {...register("new_password", {
              required: "New password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters long" }
            })}
            placeholder="Minimum 6 characters"
            className={inputStyles}
          />
          <button
            type="button"
            onClick={() => toggleVisibility("new")}
            className="absolute right-3 bottom-3.5 text-gray-400 hover:text-cvsu-green-base cursor-pointer p-0.5"
          >
            {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.new_password && (
            <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">
              {String(errors.new_password.message)}
            </p>
          )}
        </div>

        {/* INPUT: CONFIRM NEW PASSWORD */}
        <div className="relative">
          <label className={labelStyles}>Confirm New Password</label>
          <input
            type={showPass.conf ? "text" : "password"}
            {...register("confirm_password", {
              required: "Please confirm your password",
              validate: (val) => val === watch("new_password") || "The passwords you entered do not match"
            })}
            placeholder="Re-type new password"
            className={inputStyles}
          />
          <button
            type="button"
            onClick={() => toggleVisibility("conf")}
            className="absolute right-3 bottom-3.5 text-gray-400 hover:text-cvsu-green-base cursor-pointer p-0.5"
          >
            {showPass.conf ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {errors.confirm_password && (
            <p className="text-red-500 text-[10px] mt-1 font-bold pl-1">
              {String(errors.confirm_password.message)}
            </p>
          )}
        </div>

        {/* ACTION SUBMIT BUTTON CONTAINER */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-3 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-widest transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Rewriting Signatures...
            </>
          ) : (
            <>
              <ShieldCheck size={14} /> Commit Changes
            </>
          )}
        </button>
      </form>

      <NotificationModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
};

export default ChangePassword;
