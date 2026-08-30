/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PlusIcon } from "lucide-react";

// Components
import ResearchToolbar from "./components/ResearchToolbar";
import ResearchTable from "./components/ResearchTable";
import ResearchDetailsModal from "./components/ResearchDetailsModal";
import EditResearchModal from "./components/EditResearchModal"; // 1. Imported the separate edit modal file
import UploadLegacyResearch from "./components/UploadLegacyResearch";

// Alerts
import NotificationModal from "@/components/ui/alerts/NotificationModal";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

// 2. FIXED Contract Disconnect: Wiped verification_code and injected year parameter rule
interface ResearchProject {
  uuid: string;
  code: string | null;
  title: string;
  type: "Thesis" | "Capstone" | "Design Project";
  program: string | null;
  year: number | null; // Fixed the "Two different types exist" compile break
  authors: string | null;
  adviser: string | null;
  technical_critic: string | null;
  abstract: string | null;
  keywords: string | null;
  file_path: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: string | null;
  created_at: string;
}

interface ResearchApprovalProps {
  adminId?: string;
}

const ResearchApproval = ({ adminId = "SA-001" }: ResearchApprovalProps) => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });
  const [submissions, setSubmissions] = useState<ResearchProject[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<ResearchProject | null>(null);
  
  // ─── 3. FIXED: Added the missing filter state parameters ───
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ─── 4. FIXED: Added the missing edit state management hooks ───
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_all_research.php?t=${Date.now()}`);
      if (Array.isArray(response.data)) {
        setSubmissions(response.data);
      }
    } catch (error) {
      console.error("Error fetching research:", error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchSubmissions();
    };
    loadInitialData();
  }, []);

  const handleUpdateStatus = async (uuid: string, newStatus: "approved" | "rejected") => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_research_status.php`, {
        uuid: uuid,
        status: newStatus,
      });
      if (response.data.success) {
        alert(`Research ${newStatus} successfully!`);
        fetchSubmissions();
        setSelectedResearch(null);
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

      const handleDeleteResearch = async (uuid: string) => {
        try {
          const response = await axios.delete(`${API_BASE_URL}/admin/delete_research.php?uuid=${uuid}`);

          if (response.data.success) {
            // ─── CHANGED: Triggers the new custom stylized success state modal ───
            setAlertConfig({
              isOpen: true,
              type: "success",
              title: "Record Deleted",
              message: "The research entry has been cleared from the database successfully."
            });

            fetchSubmissions(); 
            setSelectedResearch(null); 
          } else {
            // Triggers the custom styled error modal fallback
            setAlertConfig({
              isOpen: true,
              type: "error",
              title: "Deletion Blocked",
              message: response.data.message || "An unexpected error occurred."
            });
          }
        } catch (error: any) {
          console.error("Database removal operation failure:", error);
          setAlertConfig({
            isOpen: true,
            type: "error",
            title: "Server Error",
            message: "Failed to communicate with system services to delete the logs."
          });
        }
      };

  // 5. EXTENDED: Multi-column local array search pipeline filter rules
  const filteredData = submissions.filter((r) => {
    const title = r.title?.toLowerCase() || "";
    const submitter = r.submitted_by?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(term) || submitter.includes(term);
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 font-dm"
    >
      {/* HEADER WITH ARCHIVE TRIGGER BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-montserrat font-black text-cvsu-green-dark uppercase tracking-wide">Research Approval Panel</h2>
          <p className="text-xs text-gray-400 italic">Manage, review, and archive university research manuscripts</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center gap-2 bg-cvsu-green-base hover:bg-cvsu-green-dark text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <PlusIcon size={16} />
          Archive Legacy Paper
        </button>
      </div>

      {/* 6. DETAILS PREVIEW MODAL */}
      <ResearchDetailsModal
        research={selectedResearch}
        onClose={() => setSelectedResearch(null)}
        onApprove={(uuid) => handleUpdateStatus(uuid, "approved")}
        onReject={(uuid) => handleUpdateStatus(uuid, "rejected")}
        onOpenEdit={() => setIsEditOpen(true)} // Toggles standalone edit modal visibility frame
        onDelete={handleDeleteResearch} // Injected deletion callback for the modal
      />

      {/* 7. DEDICATED ARCHIVAL EDIT MODAL MOUNT */}
      <EditResearchModal
        isOpen={isEditOpen}
        research={selectedResearch}
        onClose={() => setIsEditOpen(false)}
        onSaveSuccess={() => {
          fetchSubmissions();
          setIsEditOpen(false);
          setSelectedResearch(null);
        }}
      />

      {/* TOOLBAR DROPDOWNS MAP */}
      <ResearchToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* TABLE DATA GRID */}
      <ResearchTable
        submissions={filteredData}
        onUpdateStatus={(uuid, status) => handleUpdateStatus(uuid, status)}
        onViewDetails={(research) => setSelectedResearch(research)}
      />

      {/* UPLOAD FORM PANEL MODAL */}
      <UploadLegacyResearch
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchSubmissions}
        currentAdminId={adminId}
      />

      <NotificationModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
};

export default ResearchApproval;
