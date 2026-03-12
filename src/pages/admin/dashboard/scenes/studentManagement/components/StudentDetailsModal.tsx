import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type Props = {
  selectedStudent: any;
  setSelectedStudent: (value: any) => void;
};

const StudentDetailsModal = ({ selectedStudent, setSelectedStudent }: Props) => {
  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-dm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-cvsu-green-base p-6 flex justify-between items-center text-white">
          <h3 className="font-montserrat font-bold uppercase tracking-widest">
            Student Identification
          </h3>
          <button onClick={() => setSelectedStudent(null)}>
            <XIcon size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 flex flex-col items-center">
          {/* THE QR CODE PART */}
          <div className="p-4 bg-white border-2 border-cvsu-green-100 rounded-2xl shadow-inner">
            <QRCodeSVG
              value={selectedStudent.qr_data}
              size={220}
              level="H"
              imageSettings={{
                src: "/src/images/cvsu-logo.png",
                height: 45,
                width: 45,
                excavate: true,
              }}
            />
          </div>

          {/* Student Info */}
          <div className="w-full space-y-3 text-center">
            <div>
              <p className="text-[10px] font-bold text-cvsu-gray uppercase">Student ID</p>
              <p className="text-lg font-black text-cvsu-green-dark">{selectedStudent.student_id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-cvsu-gray uppercase">Full Name</p>
              <p className="text-gray-700 font-bold">
                {`${selectedStudent.first_name} ${selectedStudent.middle_name || ""} ${selectedStudent.last_name} ${selectedStudent.suffix || ""}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-cvsu-gray uppercase">Program</p>
              <p className="text-gray-600 text-sm">{selectedStudent.course}</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.print()} 
            className="text-xs text-cvsu-green-base font-bold hover:underline"
          >
            Print Library ID Card
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailsModal;
