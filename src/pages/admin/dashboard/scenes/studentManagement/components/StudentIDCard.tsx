import { QRCode } from "react-qrcode-logo";

type Props = {
  selectedStudent: any;
};

const StudentIDCard = ({ selectedStudent }: Props) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center print:flex-row print:gap-4 scale-90 md:scale-100">
      {/* ID FRONT */}
      <div id="id-front" style={{ backgroundColor: '#ffffff' }} className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white shadow-lg print:shadow-none print:border-black shrink-0">
        <div className="bg-cvsu-green-base p-2 flex items-center gap-2">
          <img src="/src/images/cvsu-logo.png" className="h-10 w-10" alt="logo" />
          <div className="leading-tight">
            <p className="text-[12px] text-white font-bold uppercase">Cavite State University</p>
            <p className="text-[10px] text-white/80 uppercase">CEIT Reading Room</p>
          </div>
        </div>
        <div className="flex-1 flex p-2 gap-3 items-center">
          <div className="w-20 h-24 bg-gray-200 border border-gray-300 flex items-center justify-center text-[8px] text-gray-400 italic">PHOTO</div>
          <div className="flex-1">
            <p className="text-[15px] font-black text-cvsu-green-dark uppercase leading-tight">{selectedStudent.first_name}</p>
            <p className="text-[15px] font-black text-cvsu-green-dark uppercase leading-tight">{selectedStudent.last_name}</p>
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
      <div id="id-back" style={{ backgroundColor: '#ffffff' }} className="w-81 h-51 border border-gray-300 rounded-lg overflow-hidden flex flex-row bg-white shadow-lg print:shadow-none print:border-black shrink-0">
        <div className="flex-none w-1/2 flex flex-col items-center justify-center p-4 bg-cvsu-green-50/30">
          <QRCode
            value={selectedStudent.qr_data}
            logoImage="/src/images/cvsu-logo.png"
            qrStyle="squares"
            eyeRadius={0}
            fgColor="#000000"
            ecLevel="Q"
            size={500}
            style={{ 
              width: '120px',
              height: '120px',
              imageRendering: "pixelated" }}
          />
          <p className="text-[7px] mt-2 font-black text-cvsu-green-base uppercase tracking-wider">Library Access Key</p>
        </div>
        <div className="flex-1 flex flex-col p-4 border-l border-gray-100">
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <p className="text-[8px] font-black text-cvsu-green-dark uppercase underline">Terms & Conditions</p>
            <p className="text-[5px] text-gray-600 leading-tight">• Must be presented upon entry.</p>
            <p className="text-[5px] text-gray-600 leading-tight">• Scan QR for Time-In/Out.</p>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-[5px] text-gray-400 italic">If found, return to: <br /><span className="font-bold text-gray-500 uppercase">CEIT Reading Room, Indang.</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentIDCard;
