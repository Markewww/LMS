/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\student\dashboard\scenes\bookCatalog\components\CatalogToolbar.tsx
import { useState, useEffect, useRef } from "react";
import { Search, QrCode, X, Camera, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface CatalogToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const CatalogToolbar = ({ searchTerm, setSearchTerm }: CatalogToolbarProps) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "student-catalog-qr-reader";

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err) =>
          console.error("Scanner stop error on unmount:", err)
        );
      }
    };
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    setIsScannerOpen(true);

    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerId);
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.65;
              return { width: size, height: size };
            },
            videoConstraints: {
              facingMode: "environment",
              frameRate: { ideal: 10, max: 10 },
            }
          },
          (decodedText) => {
            setSearchTerm(decodedText.trim());
            stopScanner();
          },
          () => {}
        );
      } catch (err: any) {
        console.error("Camera access failed:", err);
        setCameraError("Unable to access local camera hardware. Please check your permissions.");
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      if (html5QrcodeRef.current.isScanning) {
        try {
          await html5QrcodeRef.current.stop();
        } catch (err) {
          console.error("Failed to kill video tracking tracks stream:", err);
        }
      }
      html5QrcodeRef.current = null;
    }
    setIsScannerOpen(false);
    setCameraError(null);
  };

  return (
    <div className="relative w-full max-w-md font-dm">
      {/* Target Wrapped Input Elements Layout Wrapper Container */}
      <div className="relative group w-full">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cvsu-green-base transition-colors pointer-events-none"
          size={18}
        />
        <input
          type="text"
          placeholder="Enter title, author, keywords (e.g., QR, LMS, Java)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cvsu-green-base/20 focus:border-cvsu-green-base text-sm transition-all"
        />

        <button
          type="button"
          onClick={startScanner}
          title="Scan tracking code with camera"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-cvsu-green-base hover:bg-cvsu-green-50 transition-all cursor-pointer"
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* Live Webcam Scanner Overlay Layer Dialog Frame */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="p-4 bg-cvsu-green-base text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Camera size={16} className="animate-pulse" />
                <h4 className="text-xs font-montserrat font-black uppercase tracking-wider">
                  CEIT Asset QR Reader
                </h4>
              </div>
              <button
                type="button"
                onClick={stopScanner}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-900 aspect-square w-full relative flex items-center justify-center p-2">
              {cameraError ? (
                <div className="text-center p-6 text-xs text-red-400 font-medium space-y-3">
                  <p>{cameraError}</p>
                  <button
                    onClick={() => { stopScanner(); startScanner(); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold transition-all uppercase tracking-wider text-[10px]"
                  >
                    <RefreshCw size={12} /> Retry Camera
                  </button>
                </div>
              ) : (
                <div 
                  id={scannerId}
                  className="w-full h-full overflow-hidden rounded-xl bg-black [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                />
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium leading-normal">
                Center the book or research QR code within the scanning square target frame to automatically populate results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogToolbar;
