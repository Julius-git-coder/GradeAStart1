


import React, { useState, useEffect } from "react";
import { Users, Mail, Phone, UserCheck, Search } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore";

const AdminUsers = () => {
  const { userData } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!userData?.teamId) {
      setLoading(false);
      return;
    }

    // Real-time listener for students
    const studentsQuery = query(
      collection(db, "users"),
      where("teamId", "==", userData.teamId),
      where("role", "==", "student")
    );

    const unsubscribe = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const studentList = [];
        snapshot.forEach((doc) => {
          studentList.push({ id: doc.id, ...doc.data() });
        });
        setStudents(studentList);
        setFilteredStudents(studentList);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading students:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.teamId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Student Management</h1>
          <p className="text-gray-400 mt-1">
            Manage and monitor your team students
          </p>
        </div>
        <div className="bg-yellow-500 bg-opacity-20 rounded-xl p-4 border border-yellow-500">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-white text-2xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <p className="text-green-500 text-sm font-medium">
          Real-time updates enabled - Student list updates automatically
        </p>
      </div>

      {/* Team Info Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Your Team ID</p>
            <p className="text-white text-xl font-bold mt-1 font-mono">
              {userData?.teamId}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(userData?.teamId);
              alert("Team ID copied to clipboard!");
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Copy Team ID
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-3">
          Share this Team ID with students so they can join your team
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or student ID..."
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg pl-12 pr-4 py-3 outline-none focus:border-yellow-500 transition-colors"
          />
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">
            {searchTerm ? "No students found" : "No students yet"}
          </h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Students who join with your Team ID will appear here"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-yellow-500" />
                </div>
                <span className="text-xs text-gray-500">
                  {student.createdAt?.toDate
                    ? new Date(student.createdAt.toDate()).toLocaleDateString()
                    : "Recently joined"}
                </span>
              </div>

              <h3 className="text-white text-lg font-semibold mb-2">
                {student.fullName}
              </h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 truncate">
                    {student.email}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{student.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">ID: {student.studentId}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Team: {student.teamId}</span>
                  <span className="bg-green-500 bg-opacity-20 text-green-500 px-2 py-1 rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;