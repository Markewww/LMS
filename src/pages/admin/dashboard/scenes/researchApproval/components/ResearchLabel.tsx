import { QRCode } from "react-qrcode-logo";
import Barcode from "react-barcode";

interface ResearchProject {
  code: string | null;
  title: string;
  type: string;
  program: string | null;
  year: number | null;
}

type Props = {
  research: ResearchProject;
};

const ResearchLabel = ({ research }: Props) => {
  if (!research.code || research.code.trim() === "") {
    return (
      <div className="w-100 p-6 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-xl text-center text-xs text-amber-800 font-medium italic">
        ⚠️ Design View Locked: Label canvas requires an active catalog tracking code.
      </div>
    );
  }

  return (
    <div 
      id="research-label-card"
      className="w-105 bg-white border border-gray-200 p-5 rounded-xl flex flex-col font-dm shadow-sm"
    >
      {/* Label Header Branding */}
      <div className="border-b border-gray-100 pb-2 mb-3 text-left">
        <h4 className="text-[11px] font-montserrat font-black text-cvsu-green-base uppercase tracking-wider">
          CvSU Main Campus — CEIT Reading Room
        </h4>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
          Research Manuscript Registry Asset
        </p>
      </div>

      {/* Visual Identity Grid */}
      <div className="flex flex-col items-center gap-3 border-b border-gray-100 pb-3 mb-3">
        {/* QR Code (top) */}
        <div className="bg-gray-50/50 p-2 rounded-lg border border-gray-100 flex justify-center items-center">
          <QRCode
            value={research.code}
            logoImage="/src/images/cvsu-logo.png"
            qrStyle="squares"
            eyeRadius={0}
            fgColor="#000000"
            size={500}
            ecLevel="H"
            style={{
              width: "160px",
              height: "160px",
              imageRendering: "pixelated",
            }}
          />
        </div>

        {/* Barcode (bottom) */}
        <div className="w-full flex justify-center overflow-hidden">
          <Barcode
            value={research.code}
            height={35}
            width={1}
            fontSize={12}
            margin={1}
          />
        </div>
      </div>

      {/* Bibliographic Context Data */}
      <div className="text-left space-y-1">
        <div>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Manuscript Title</span>
          <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight font-montserrat uppercase">
            {research.title}
          </h5>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1.5">
          <div>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Classification</span>
            <span className="text-[10px] font-bold text-cvsu-green-dark uppercase">
              {research.type} {research.year ? `(${research.year})` : ""}
            </span>
          </div>
          <div>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Program Scope</span>
            <span className="text-[10px] font-bold text-blue-700 uppercase line-clamp-1">
              {research.program || "General CEIT"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchLabel;
