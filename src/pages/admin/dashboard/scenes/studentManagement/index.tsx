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
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchStudents = async () => {
    try {
      // Added timestamp to prevent browser caching of old student data
      const response = await axios.get(`http://localhost/LMS/src/API/admin/get_students.php?t=${Date.now()}`);
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // Filter & Enhanced Search Logic
  const filteredStudents = students.filter((s: any) => {
    const term = searchTerm.toLowerCase();
    
    // Checks Student ID, Last Name, First Name, and Course/Program
    const matchesSearch = 
      s.student_id.toLowerCase().includes(term) || 
      s.last_name.toLowerCase().includes(term) ||
      s.first_name.toLowerCase().includes(term) ||
      s.course.toLowerCase().includes(term);

    // Checks Dropdown status filter
    const matchesStatus = filterStatus === "all" || s.account_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-dm">
      {/* STUDENT DETAIL MODAL */}
      <StudentDetailsModal 
        selectedStudent={selectedStudent} 
        setSelectedStudent={setSelectedStudent}
        onUpdate={fetchStudents}
      />

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
        // Passed fetchStudents directly since handleUpdateStatus was removed
        onUpdateStatus={fetchStudents} 
        onViewDetails={(s) => setSelectedStudent(s)}
      />

      {/* ADD STUDENT FORM */}
      <AddStudentForm onSubmit={async (data) => {
        try {
          const response = await axios.post("http://localhost/LMS/src/API/admin/add_student.php", data);
          if (response.data.success) {
            alert("Student added successfully!");
            fetchStudents();
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
