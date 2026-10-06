/* eslint-disable @typescript-eslint/no-explicit-any */
// src\pages\admin\dashboard\components\attendanceGraph\index.tsx
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from "recharts";
import { API_BASE_URL } from "@/API/APIConfig";
import Toolbar from "./Toolbar";
import { courseColors } from "./courseColors";

interface GraphData {
  xAxisKey: string; 
  [key: string]: string | number;
}

const AttendanceGraph = () => {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedRange, setSelectedRange] = useState("1Y"); 
  const [data, setData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);

  // FIXED PARAMETER REFERENCE: Merged space-fragmented variables safely
  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/get_attendance_graph.php`, {
        params: {
          year: selectedYear,
          course: selectedCourse,
          range: selectedRange 
        },
      });
      if (Array.isArray(response.data)) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Graph Error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedCourse, selectedRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGraphData();
    }, 300); 
    return () => clearTimeout(timer);
  }, [fetchGraphData]);

  const processedData = useMemo(() => {
    if (selectedCourse) return data;
    return data.map((item) => ({
      ...item,
      total: Object.keys(courseColors).reduce(
        (sum, course) => sum + (Number(item[course]) || 0), 
        0
      ),
    }));
  }, [data, selectedCourse]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) => {
    if (active && payload && payload.length) {
      const totalVisits = payload.reduce((sum: number, entry) => sum + entry.value, 0);
      return (
        <div className="bg-cvsu-green-dark text-white px-3 py-1.5 rounded-lg text-xs font-montserrat font-black shadow-lg flex flex-col items-center">
          <span>{totalVisits} Total Students</span>
          <div className="w-2 h-2 bg-cvsu-green-dark rotate-45 mt-1 -mb-1"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 font-dm">
      {/* Title Segment Row */}
      <div className="flex items-center justify-between mb-4 text-left">
        <div>
          <h2 className="text-lg font-montserrat font-black text-cvsu-green-dark uppercase">
            Attendance Analytics
          </h2>
          <p className="text-xs text-gray-400 italic">
            Student Reading Room Visits
          </p>
        </div>
      </div>

      {/* Controller Filters Toolbar Section */}
      <Toolbar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange} 
        onRefresh={fetchGraphData}
      />

      {/* Main Core Chart Container Display Area */}
      <div className="h-87.5 w-full bg-gray-50/50 rounded-3xl p-6 border border-gray-100 mt-4">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 font-bold italic animate-pulse">
            Fetching analytics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              {/* Dynamic dataKey tracks whatever timeline string configuration PHP produces */}
              <XAxis
                dataKey="xAxisKey"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip content={<CustomTooltip />} position={{ y: 20 }} />

              {selectedCourse && (
                <Legend
                  verticalAlign="top"
                  height={40}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'Montserrat' }}
                />
              )}

              {!selectedCourse ? (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#1B4D3E"
                  fill="#1B4D3E"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ) : (
                <Area
                  key={selectedCourse}
                  type="monotone"
                  dataKey={selectedCourse}
                  stroke={courseColors[selectedCourse] || "#1B4D3E"}
                  fill={courseColors[selectedCourse] || "#1B4D3E"}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AttendanceGraph;
