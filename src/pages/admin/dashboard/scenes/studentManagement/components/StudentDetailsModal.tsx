import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { QRCode } from "react-qrcode-logo";

type Props = {
  selectedStudent: any;
  setSelectedStudent: (value: any) => void;
};

const StudentDetailsModal = ({ selectedStudent, setSelectedStudent }: Props) => {
  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-dm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden print:shadow-none print:m-0"
      >
        {/* Header */}
        <div className="bg-cvsu-green-base p-6 flex justify-between items-center text-white print:hidden">
          <h3 className="font-montserrat font-bold uppercase tracking-widest">
            Student Identification
          </h3>
          <button onClick={() => setSelectedStudent(null)}>
            <XIcon size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 flex flex-col items-center">
          {/* ID Card Layout Container */}
          <div className="flex flex-col md:flex-col gap-8 items-center justify-center print:flex-row print:gap-4">
            {/* ID FRONT */}
            <div id="id-front" className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white shadow-lg print:shadow-none print:border-black">
              <div className="bg-cvsu-green-base p-2 flex items-center gap-2">
              <img src="/src/images/cvsu-logo.png" className="h-10 w-10" alt="logo" />
              <div className="leading-tight">
                <p className="text-[12px] text-white font-bold uppercase">Cavite State University</p>
                <p className="text-[10px] text-white/80 uppercase">CEIT Reading Room</p>
              </div>
            </div>
            <div className="flex-1 flex p-2 gap-3 items-center">
              <div className="w-20 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center text-[8px] text-gray-400 italic">PHOTO</div>
              <div className="flex-1 space-y-1">
                <p className="text-[15px] font-black text-cvsu-green-dark uppercase leading-tight">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{selectedStudent.course}</p>
                <div className="pt-2">
                  <p className="text-[9px] text-gray-400">STUDENT NUMBER</p>
                  <p className="text-[12px] font-bold text-gray-800">{selectedStudent.student_id}</p>
                </div>
              </div>
            </div>
            <div className="bg-cvsu-green-base h-1 w-full"></div>
            </div>
            {/* ID BACK */}
            <div id="id-back" className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-row bg-white shadow-lg print:shadow-none print:border-black">
               {/* BACK - LEFT SIDE */}
               <div className="flex-none w-1/2 flex flex-col items-center justify-center p-4 bg-cvsu-green-50/30">
                  <QRCode
                    value={selectedStudent.qr_data}
                    logoImage="/src/images/cvsu-logo.png"
                    qrStyle="dots"
                    eyeRadius={6}
                    fgColor="#1b651b"
                    ecLevel="H"
                    size={150} // Smaller for the back of the ID
                  />
                  <p className="text-[7px] mt-2 font-black text-cvsu-green-base uppercase tracking-wider">Library Access Key</p>
                </div>
                  
                  {/* BACK - RIGHT SIDE */}
                  <div className="flex-1 flex flex-col p-4 border-l border-gray-100">
                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-cvsu-green-dark uppercase underline">Terms & Conditions</p>
                        <p className="text-[6px] text-gray-600 leading-tight">
                          • This card must be presented upon entry.
                        </p>
                        <p className="text-[6px] text-gray-600 leading-tight">
                          • Users must scan the QR for every Time-In/Out.
                        </p>
                        <p className="text-[6px] text-gray-600 leading-tight">
                          • Lost cards must be reported immediately.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[5px] text-gray-400 italic leading-relaxed">
                          If found, please return to: <br />
                          <span className="font-bold text-gray-500">CEIT Reading Room, Indang, Cavite.</span>
                        </p>
                      </div>
                    </div>
                    {/* Version Tag at Bottom Right */}
                    <div className="text-right">
                      <p className="text-[5px] font-bold text-gray-300 uppercase tracking-widest">
                        LMS v1.0
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          <div className="flex gap-4 print:hidden">
            <button 
                onClick={() => window.print()}
                className="ceit-button py-2 flex items-center gap-2"
            >
                PRINT ID CARD
            </button>
            <button 
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 border border-gray-300 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
                CANCEL
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDetailsModal;
