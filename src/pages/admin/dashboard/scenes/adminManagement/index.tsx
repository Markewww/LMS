import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Components
import AdminDetailsModal from "./components/AdminDetailsModal";
import AdminTable from "./components/AdminTable";
import AddAdminForm from "./components/AddAdminForm";
import AdminToolbar from "./components/AdminToolbar";

// API CONFIG FILE
import { API_BASE_URL } from "@/API/APIConfig";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null); // State for Modal
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch list of admins from the database
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/get_admins.php`);
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  // --- START OF FILTERING LOGIC ---
  const filteredAdmins = admins.filter((a: any) => {
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = 
      a.user_id.toString().toLowerCase().includes(term) || 
      a.last_name.toLowerCase().includes(term) ||
      a.first_name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term);

    const matchesStatus = filterStatus === "all" || a.account_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/add_admin.php`, data);
      if (response.data.success) {
        alert("New Admin Added Successfully!");
        fetchAdmins();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-10 font-dm relative">
        <AdminToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <AdminDetailsModal selectedAdmin={selectedAdmin} setSelectedAdmin={setSelectedAdmin} onUpdate={fetchAdmins}/>
        <AdminTable admins={filteredAdmins} setSelectedAdmin={setSelectedAdmin} />
        <AddAdminForm onSubmit={onSubmit} />
    </motion.div>
  );
};

export default AdminManagement;
