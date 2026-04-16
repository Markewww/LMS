import { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { API_BASE_URL } from "@/API/APIConfig";
import Toolbar from "./Toolbar";

interface GraphData {
  month: string;
  [key: string]: any; 
}

export const courseColors: { [key: string]: string } = {
  "BSABE": "#1B4D3E",   
  "BSARCHI": "#D97706", 
  "BSCE": "#2563EB",    
  "BSCpE": "#DC2626",   
  "BSCS": "#7C3AED",    
  "BSEE": "#059669",    
  "BSECE": "#DB2777",   
  "BSIE": "#4B5563",    
  "BSIT-AT": "#0D9488", 
  "BSIT-ET": "#EA580C", 
  "BSIT-ELEX": "#B45309",
  "BSIT": "#0284C7"     
};

const AttendanceGraph = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCourse, setSelectedCourse] = useState(""); 
  
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ REMOVED: hoveredData state that caused the warning

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/get_attendance_graph.php`, {
        params: { 
          year: selectedYear,
          course: selectedCourse
        }
      });
      setData(response.data);
    } catch (error) {
      console.error("Graph Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [selectedYear, selectedCourse]);

  const activeCourses = selectedCourse 
    ? [selectedCourse] 
    : Object.keys(courseColors);

  // --- 1. CUSTOM CURSOR TOOLTIP ---
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const totalVisits = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-cvsu-green-dark text-white px-3 py-1.5 rounded-lg text-xs font-montserrat font-black shadow-lg flex flex-col items-center">
          <span>{totalVisits} Total</span>
          <div className="w-2 h-2 bg-cvsu-green-dark rotate-45 mt-1 -mb-2"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-montserrat font-black text-cvsu-green-dark uppercase">Attendance Analytics</h2>
          <p className="text-xs text-gray-400 italic">Student traffic trends grouped by program</p>
        </div>
      </div>

      <Toolbar 
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        onRefresh={fetchGraphData}
      />

      <div className="h-87.5 w-full bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-bold italic animate-pulse">
            Fetching analytics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {/* ✅ REMOVED: onMouseMove and onMouseLeave handlers referencing setHoveredData */}
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
              
              <Tooltip 
                content={<CustomTooltip />}
                position={{ y: 20 }} 
              />

              <Legend 
                verticalAlign="top" 
                height={40} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'Montserrat' }}
              />
              
              {activeCourses.map((course) => (
                <Area
                  key={course}
                  type="monotone"
                  dataKey={course}
                  stackId="1" 
                  stroke={courseColors[course]}
                  fill={courseColors[course]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AttendanceGraph;
