import { useState } from "react";
import { SearchIcon, DownloadCloud, FileText } from "lucide-react";
import { API_BASE_URL } from "@/API/APIConfig";
import ExportDocxPreviewModal from "./ExportDocxPreviewModal";

type Props = {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
};

const ResearchToolbar = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
}: Props) => {
  const statuses = ["all", "pending", "approved"];
  const [isDocxPreviewOpen, setIsDocxPreviewOpen] = useState(false);

  const handleExportResearchExcel = () => {
    window.open(`${API_BASE_URL}/admin/export_research_excel.php`, "_blank");
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        {/* SEARCH BAR */}
        <div className="relative w-full md:w-96">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search Title"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-cvsu-green-base outline-none text-sm font-dm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                filterStatus === status
                  ? "bg-cvsu-green-base text-white shadow-cvsu-green-base/20"
                  : "bg-gray-100 text-cvsu-gray hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportResearchExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 group"
            title="Export current research submissions to formatted Excel spreadsheet"
          >
            <DownloadCloud
              size={15}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDocxPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white rounded-xl text-xs font-black font-montserrat uppercase tracking-widest shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 group"
            title="Preview and export approved research masterlist to Word (.docx)"
          >
            <FileText
              size={15}
              className="group-hover:translate-y-0.5 transition-transform"
            />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* WORD EXPORT PREVIEW MODAL */}
      <ExportDocxPreviewModal
        isOpen={isDocxPreviewOpen}
        onClose={() => setIsDocxPreviewOpen(false)}
      />
    </>
  );
};

export default ResearchToolbar;
