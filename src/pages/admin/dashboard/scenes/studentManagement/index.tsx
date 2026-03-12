import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// Components
import StudentToolbar from "./components/StudentToolbar";
import StudentTable from "./components/StudentTable";
import AddStudentForm from "./components/AddStudentForm";
import StudentDetailsModal from "./components/StudentDetailsModal";

const StudentManagement = () => {
  const [students, setStudents] = useState<any>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // State for Modal
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, pending

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost/LMS/src/API/admin/get_students.php");
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleUpdateStatus = async (studentId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to set this student to ${newStatus}?`)) return;
    
    try {
      const response = await axios.post("http://localhost/LMS/src/API/admin/update_student_status.php", {
        student_id: studentId,
        status: newStatus
      });
      if (response.data.success) {
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  // Filter Logic
  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.account_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-dm">
      {/* STUDENT DETAIL MODAL */}
      <StudentDetailsModal 
      selectedStudent={selectedStudent} 
      setSelectedStudent={setSelectedStudent} />

      {/* TOOLBAR */}
      <StudentToolbar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      {/* TABLE */}
      <StudentTable 
        students={filteredStudents}
        onUpdateStatus={handleUpdateStatus}
        onViewDetails={(s) => setSelectedStudent(s)}
      />
      {/* ADD STUDENT FORM */}
      <AddStudentForm onSubmit={async (data) => {
        try {
          const response = await axios.post("http://localhost/LMS/src/API/admin/add_student.php", data);
          if (response.data.success) {
            alert("Student added and QR code generated successfully!");
            fetchStudents(); // Refresh the list
          }
        } catch (error) {
          console.error("Error adding student:", error);
          alert("Failed to add student.");
        }
      }} />
    </motion.div>
  );
};

export default StudentManagement;
