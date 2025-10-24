


import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  Clock,
  X,
} from "lucide-react";
import { createAssignment } from "../../Service/FirebaseConfig";
import { db } from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

const AdminAssignments = () => {
  const { userData } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener for assignments
  useEffect(() => {
    if (!userData?.teamId) return;

    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("teamId", "==", userData.teamId),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignmentList = [];
        snapshot.forEach((doc) => {
          assignmentList.push({ id: doc.id, ...doc.data() });
        });
        // Sort by creation date, newest first
        assignmentList.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setAssignments(assignmentList);
      },
      (error) => {
        console.error("Error loading assignments:", error);
      }
    );

    return () => unsubscribe();
  }, [userData?.teamId]);

  // Real-time listener for students count
  useEffect(() => {
    if (!userData?.teamId) return;

    const studentsQuery = query(
      collection(db, "users"),
      where("teamId", "==", userData.teamId),
      where("role", "==", "student")
    );

    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [userData?.teamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.dueDate) {
      setError("Please fill in all fields");
      return;
    }

    // Validate due date is not in the past
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError("Due date cannot be in the past");
      return;
    }

    setIsSubmitting(true);

    try {
      await createAssignment({
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
      });

      setSuccess("Assignment created and sent to all students!");
      setFormData({ title: "", description: "", dueDate: "" });
      
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error creating assignment:", error);
      setError(error.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "assignments", assignmentId));
      setSuccess("Assignment deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      setError("Failed to delete assignment");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Manage Assignments</h1>
          <p className="text-gray-400 mt-1">
            Create and manage assignments for your team
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Real-time Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <p className="text-green-500 text-sm font-medium">
          Real-time updates enabled - Assignments sync automatically
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Assignments</p>
              <p className="text-white text-3xl font-bold mt-1">
                {assignments.length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Assignments</p>
              <p className="text-white text-3xl font-bold mt-1">
                {assignments.filter((a) => !isOverdue(a.dueDate)).length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Students</p>
              <p className="text-white text-3xl font-bold mt-1">
                {students.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-white text-sm">{success}</p>
        </div>
      )}

      {error && !showCreateModal && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">All Assignments</h2>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No assignments yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Create your first assignment for your students
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Assignment</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {assignments.map((assignment) => {
              const overdue = isOverdue(assignment.dueDate);
              return (
                <div
                  key={assignment.id}
                  className="p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white text-lg font-semibold">
                          {assignment.title}
                        </h3>
                        {overdue ? (
                          <span className="bg-red-500 bg-opacity-20 text-red-500 text-xs font-semibold px-3 py-1 rounded-full">
                            Overdue
                          </span>
                        ) : (
                          <span className="bg-green-500 bg-opacity-20 text-green-500 text-xs font-semibold px-3 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Created:{" "}
                            {assignment.createdAt?.toDate
                              ? new Date(
                                  assignment.createdAt.toDate()
                                ).toLocaleDateString()
                              : "Recently"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>Sent to {students.length} students</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="ml-4 text-red-500 hover:text-red-400 p-2 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold">
                  Create New Assignment
                </h2>
                <p className="text-gray-400 mt-1">
                  This will be sent to all {students.length} students in your
                  team
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: "", description: "", dueDate: "" });
                  setError("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-white text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-white text-sm">{success}</p>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g., Chapter 5 Homework"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="Describe the assignment requirements, resources, and expectations..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={getMinDate()}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"
                  required
                />
              </div>

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-500 text-sm">
                  <strong>Note:</strong> This assignment will be visible to all
                  students in your team immediately after creation.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: "", description: "", dueDate: "" });
                    setError("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition-colors ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create & Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;