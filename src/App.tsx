import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Page imports
import Homepage from "@/pages/Homepage";
import Login from "@/pages/login";
import Register from "@/pages/register";
// Admin Scenes
import AdminDashboard from "@/pages/admin/dashboard";
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

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
