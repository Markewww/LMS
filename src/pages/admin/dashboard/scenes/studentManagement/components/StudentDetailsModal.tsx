import { useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon, DownloadIcon, PrinterIcon, SaveIcon } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useForm } from "react-hook-form";
import axios from "axios";

import StudentIDCard from "./StudentIDCard"; // Import our new component
import FormField from "./formField"; // Import the form fields component

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

type Props = {
  selectedStudent: any;
  setSelectedStudent: (value: any) => void;
  onUpdate: () => void;
};

const StudentDetailsModal = ({ selectedStudent, setSelectedStudent, onUpdate }: Props) => {
  const { register, handleSubmit, reset } = useForm({ 
    defaultValues: selectedStudent
  });

  useEffect(() => {
    if (selectedStudent) {
      console.log("Form Resetting with:", 
        {
          email: selectedStudent.email,
          contact_number: selectedStudent.contact_number,
        }
      );
      reset({
        ...selectedStudent,
      email: selectedStudent.email || "",
      contact_number: selectedStudent.contact_number || "",
      password: ""
      });
    }
  }, [selectedStudent, reset]);

  if (!selectedStudent) return null;

  const handleDownload = async () => {
    const sides = [
      { id: "id-front", fileName: `FCEITRR-${selectedStudent.student_id}.png` },
      { id: "id-back", fileName: `BCEITRR-${selectedStudent.student_id}.png` }
    ];

    for (const side of sides) {
      const element = document.getElementById(side.id);
      if (!element) continue;

      try {
        // Create a temporary clone to strip out all Tailwind classes that might use oklch
        const dataURL = await htmlToImage.toPng(element, {
          quality: 1.0,
          pixelRatio: 4,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = side.fileName;
        link.click();
      } catch (error) {
        console.error("Image generation failed:", error);
        alert("Failed to generate image. Please try using the Print button and select 'Save as PDF' to save your ID card.");
      }
    }
  };


  const onSaveChanges = async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_student.php`, data);
      if (response.data.success) {
        alert("Student updated successfully!");
        onUpdate();
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-dm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:h-auto"
      >
        <div className="bg-cvsu-green-base p-4 flex justify-between items-center text-white print:hidden">
          <h3 className="font-montserrat font-bold uppercase tracking-widest text-sm">Manage Student Profile</h3>
          <button onClick={() => setSelectedStudent(null)} className="hover:rotate-90 transition-transform"><XIcon size={24}/></button>
        </div>

        <div className="p-6 md:p-8 space-y-8 print:p-0 overflow-y-auto max-h-[85vh]">
          <div className="print-section">
            <StudentIDCard selectedStudent={selectedStudent} />
          </div>

          {/* EDITABLE FORM SECTION */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 print:hidden">
            <div className="flex items-center gap-2 mb-4">
              <SaveIcon className="text-cvsu-green-base" size={20} />
              <h4 className="font-bold text-cvsu-green-dark uppercase text-xs">Edit Information</h4>
            </div>
            <FormField 
            key={selectedStudent.student_id}
            register={register} 
            handleSubmit={handleSubmit} 
            onSaveChanges={onSaveChanges} />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex flex-wrap justify-center gap-4 print:hidden">
            <button onClick={() => window.print()} className="ceit-button py-2 flex items-center gap-2">
              <PrinterIcon size={18} /> PRINT ID
            </button>
            <button onClick={handleDownload} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2">
              <DownloadIcon size={18} /> DOWNLOAD ID
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailsModal;
