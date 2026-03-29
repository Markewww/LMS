import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Page imports
import Homepage from "@/pages/Homepage";
import Login from "@/pages/login";
import Register from "@/pages/register";
// Admin Scenes
import AdminDashboard from "@/pages/admin/dashboard";
import AttendanceKiosk from "@/pages/admin/dashboard/scenes/activityLogs/attendance/components/AttendanceKiosk";
// Student Scenes
import StudentDashboard from "@/pages/student/dashboard";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/dashboard/attendance-kiosk" element={<AttendanceKiosk />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
