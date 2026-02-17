'use client'

import { useState, useMemo } from "react";
import { Search, Filter, Users, MoreVertical, ExternalLink } from "lucide-react";

const MOCK_STUDENTS = [
  { id: "109283745", name: "Alexander Thompson", program: "Computer Science",        graduationYear: "2024" },
  { id: "293847561", name: "Sarah Jenkins",      program: "Mechanical Engineering",  graduationYear: "2023" },
  { id: "384756293", name: "Marcus Rodriguez",   program: "Business Administration", graduationYear: "2025" },
  { id: "475629384", name: "Elena Petrova",      program: "Computer Science",        graduationYear: "2024" },
  { id: "562938475", name: "Julian Chen",        program: "Electrical Engineering",  graduationYear: "2022" },
  { id: "629384756", name: "Olivia Wright",      program: "Architecture",            graduationYear: "2024" },
  { id: "738475629", name: "David Kim",          program: "Data Science",            graduationYear: "2025" },
  { id: "847562938", name: "Sophia Martinez",    program: "Cybersecurity",           graduationYear: "2023" },
  { id: "956293847", name: "Lucas Brown",        program: "Philosophy",              graduationYear: "2024" },
  { id: "102938475", name: "Emma Wilson",        program: "Mechanical Engineering",  graduationYear: "2024" },
];

export default function UniversityDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("All Programs");
  const [yearFilter, setYearFilter] = useState("All Years");

  const programs = useMemo(() => {
    return ["All Programs", ...Array.from(new Set(MOCK_STUDENTS.map(s => s.program)))];
  }, []);

  const years = useMemo(() => {
    return ["All Years", ...Array.from(new Set(MOCK_STUDENTS.map(s => s.graduationYear)))].sort();
  }, []);

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student.id.includes(searchTerm);
      const matchesProgram = programFilter === "All Programs" || student.program === programFilter;
      const matchesYear = yearFilter === "All Years" || student.graduationYear === yearFilter;
      return matchesSearch && matchesProgram && matchesYear;
    });
  }, [searchTerm, programFilter, yearFilter]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] pt-32 pb-12">
      <div className="max-w-[1440px] mx-auto px-12">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-[#043682] mb-2 leading-tight">University Dashboard</h1>
          <p className="text-gray-600 text-xl font-bold">Managing credentials for Western University</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-8 rounded-[2rem] shadow-md border border-gray-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-[#043682] focus:ring-4 focus:ring-[#043682]/10 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
            
            <div className="lg:col-span-3 flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500 shrink-0" />
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-[#043682] outline-none transition-all cursor-pointer text-gray-900 font-bold"
              >
                {programs.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-[#043682] outline-none transition-all cursor-pointer text-gray-900 font-bold"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="lg:col-span-1 flex justify-center">
              <button 
                onClick={() => { setSearchTerm(""); setProgramFilter("All Programs"); setYearFilter("All Years"); }}
                className="text-[#043682] font-black hover:underline underline-offset-4"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-8 py-6 text-xs font-black text-[#043682] uppercase tracking-widest">Student Details</th>
                  <th className="px-8 py-6 text-xs font-black text-[#043682] uppercase tracking-widest">Program</th>
                  <th className="px-8 py-6 text-xs font-black text-[#043682] uppercase tracking-widest">Year</th>
                  <th className="px-8 py-6 text-xs font-black text-[#043682] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#043682] rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-lg leading-tight">{student.name}</p>
                            <p className="text-sm text-gray-600 font-bold mt-0.5">ID: {student.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-900 font-black">{student.program}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-900 font-black">{student.graduationYear}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button className="p-2.5 bg-gray-100 text-[#043682] rounded-xl hover:bg-[#043682] hover:text-white transition-all shadow-sm">
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button className="p-2.5 text-gray-500 hover:text-gray-900 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="max-w-xs mx-auto">
                        <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-600 font-medium">Try adjusting your search terms or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Mockup */}
          <div className="px-8 py-6 bg-gray-100 border-t-2 border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 font-bold">
                Showing Page <span className="text-[#043682]">1</span> out of <span className="text-[#043682]">1</span>
              </p>
              <div className="w-px h-4 bg-gray-300"></div>
              <p className="text-sm text-gray-600 font-bold">
                Total Students: <span className="text-[#043682]">{MOCK_STUDENTS.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-black text-gray-400 bg-white cursor-not-allowed">Previous</button>
              <button className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-black text-gray-900 bg-white hover:border-[#043682] hover:text-[#043682] hover:shadow-md transition-all">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}