import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Components
import ResearchToolbar from "./components/ResearchToolbar";
import ResearchTable from "./components/ResearchTable";
import ResearchDetailsModal from "./components/ResearchDetailsModal";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const ResearchApproval = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

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
    fetchSubmissions(); 
  }, []);

  const handleUpdateStatus = async (uuid: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/update_research_status.php`, {
        uuid: uuid,
        status: newStatus
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

  // ADDED: Optional chaining (?.) to prevent errors if submission data is missing fields
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
      {/* DETAILS MODAL */}
      <ResearchDetailsModal 
        research={selectedResearch}
        onClose={() => setSelectedResearch(null)}
        onApprove={(uuid: string) => handleUpdateStatus(uuid, 'approved')}
        onReject={(uuid: string) => handleUpdateStatus(uuid, 'rejected')}
      />

      {/* TOOLBAR */}
      <ResearchToolbar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          filterStatus={filterStatus} 
          setFilterStatus={setFilterStatus} 
      />

      {/* TABLE */}
      <ResearchTable 
          submissions={filteredData}
          onUpdateStatus={(uuid: string, status: any) => handleUpdateStatus(uuid, status)}
          onViewDetails={(research) => setSelectedResearch(research)}
      />
    </motion.div>
  );
};

export default ResearchApproval;
