/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { XIcon, DownloadCloud, FileText, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import cvsuHeaderImg from "@/images/cvsu-header-bagong-pilipinas-HD.png";

interface ExportDocxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_PROGRAMS = [
  "BSABE", "BSARCHI", "BSCE", "BSCpE", "BSCS", "BSEE",
  "BSECE", "BSIE", "BSIndT-AT", "BSIndT-ET", "BSIndT-ELEX", "BSIT",
];

const PALETTE_COLORS = [
  "#15803d", "#10b981", "#eab308", "#2563eb",
  "#f97316", "#8b5cf6", "#14b8a6", "#f43f5e",
  "#0ea5e9", "#a855f7", "#84cc16", "#64748b",
];

const ExportDocxPreviewModal = ({ isOpen, onClose }: ExportDocxPreviewModalProps) => {
  const [researches, setResearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchApprovedResearches = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/admin/export_research_docx.php?preview=1`);
        if (res.data.success) {
          setResearches(res.data.researches || []);
        }
      } catch (err) {
        console.error("Failed to load preview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedResearches();
  }, [isOpen]);

  if (!isOpen) return null;

  // Compute program counts matching export_research_docx.php
  const countsMap: Record<string, number> = {};
  ALL_PROGRAMS.forEach((p) => (countsMap[p] = 0));

  researches.forEach((item) => {
    const prog = (item.program || "").trim() || "Unspecified";
    countsMap[prog] = (countsMap[prog] || 0) + 1;
  });

  const sortedPrograms = Object.entries(countsMap).sort((a, b) => b[1] - a[1]);
  const totalResearches = researches.length;

  // Build conic-gradient segments for visual pie chart preview
  let cumulativePct = 0;
  const gradientStops = sortedPrograms
    .map(([, count], idx) => {
      if (totalResearches === 0 || count === 0) return null;
      const pct = (count / totalResearches) * 100;
      const start = cumulativePct;
      cumulativePct += pct;
      const color = PALETTE_COLORS[idx % PALETTE_COLORS.length];
      return `${color} ${start.toFixed(2)}% ${cumulativePct.toFixed(2)}%`;
    })
    .filter(Boolean);

  const pieBackground =
    gradientStops.length > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "#e5e7eb";

  const handleConfirmDownload = () => {
    window.open(`${API_BASE_URL}/admin/export_research_docx.php`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-dm">
      <div className="bg-gray-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-cvsu-green-dark">
            <FileText size={20} />
            <div>
              <h3 className="font-montserrat font-black uppercase text-sm tracking-wide">
                Word Document Layout Preview
              </h3>
              <p className="text-[11px] text-gray-500">
                Review the generated layout before downloading the .DOCX file
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <XIcon size={18} />
          </button>
        </div>

{/* HERE */}
        {/* Scrollable Document Paper Container */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 flex justify-center items-start">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-2">
              <Loader2 className="animate-spin text-cvsu-green-base" size={28} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Generating Document Preview...
              </span>
            </div>
          ) : (
            /* Simulated Word Page Sheet */
            <div className="bg-white w-full max-w-190 shadow-md border border-gray-200 text-gray-800 mb-4">
              {/* Header Image (100% width) */}
              <div className="w-full">
                <img
                  src={cvsuHeaderImg}
                  alt="CvSU Bagong Pilipinas Header"
                  className="w-full h-auto block"
                />
              </div>

              {/* Document Body Content */}
              <div className="p-8 sm:p-10 space-y-6">
                {/* Document Title & Subtitle */}
                <div className="text-center space-y-1">
                  <h1 className="text-xl font-bold text-[#15803D]">
                    Reading Room Researches Masterlist
                  </h1>
                  <p className="text-xs italic text-gray-500">
                    Approved Research Inventory | Generated on{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Pie Chart & Legend Preview */}
                <div className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-6 bg-gray-50/40">
                  <div
                    className="w-40 h-40 rounded-full shrink-0 border border-gray-200 shadow-inner"
                    style={{ background: pieBackground }}
                  />
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                    {sortedPrograms.map(([prog, count], idx) => {
                      const pct =
                        totalResearches > 0
                          ? ((count / totalResearches) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <div key={prog} className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{
                              backgroundColor:
                                PALETTE_COLORS[idx % PALETTE_COLORS.length],
                            }}
                          />
                          <span className="font-mono text-gray-700">
                            {prog}: <b>{count}</b> ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                    <div className="col-span-2 pt-1.5 mt-1 border-t border-gray-200 font-bold text-[#15803D]">
                      Total Approved Researches: {totalResearches}
                    </div>
                  </div>
                </div>

                {/* Approved Researches Masterlist Table */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-[#15803D]">
                    Approved Researches Masterlist (Latest Uploads First)
                  </h2>
                  <table className="w-full text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-[#15803D] text-white">
                        <th className="border border-gray-300 px-2.5 py-1.5 text-left w-28">
                          Code
                        </th>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-left">
                          Title
                        </th>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-left w-28">
                          Program
                        </th>
                        <th className="border border-gray-300 px-2.5 py-1.5 text-center w-16">
                          Year
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {researches.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-gray-300 px-3 py-4 text-center italic text-gray-500"
                          >
                            No approved research records found.
                          </td>
                        </tr>
                      ) : (
                        researches.map((item, idx) => (
                          <tr
                            key={item.uuid || idx}
                            className={idx % 2 === 1 ? "bg-gray-50" : "bg-white"}
                          >
                            <td className="border border-gray-300 px-2.5 py-1.5 font-bold">
                              {item.code || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-2.5 py-1.5">
                              {item.title}
                            </td>
                            <td className="border border-gray-300 px-2.5 py-1.5">
                              {item.program || "N/A"}
                            </td>
                            <td className="border border-gray-300 px-2.5 py-1.5 text-center">
                              {item.year || "N/A"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

{/* HERE */}
        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirmDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-widest shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <DownloadCloud size={15} />
            <span>Download .DOCX</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDocxPreviewModal;

