import { useEffect, useState } from "react";
import axios from "axios";

// Components
import AdminDetailsModal from "./components/AdminDetailsModal";
import AdminTable from "./components/AdminTable";
import AddAdminForm from "./components/AddAdminForm";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null); // State for Modal

  // Fetch list of admins from the database
  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost/CEIT/src/API/admin/get_admins.php");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post("http://localhost/CEIT/src/API/add_admin.php", data);
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
    <div className="space-y-10 font-dm relative">
      {/* VIEW ADMIN DETAILS MODAL */}
        <AdminDetailsModal selectedAdmin={selectedAdmin} setSelectedAdmin={setSelectedAdmin} />
      {/* ADMIN TABLE */}
        <AdminTable admins={admins} setSelectedAdmin={setSelectedAdmin} />
      {/* ADD ADMIN FORM */}
        <AddAdminForm onSubmit={onSubmit} />
    </div>
  );
};

export default AdminManagement;
