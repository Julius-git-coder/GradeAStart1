// Frontend/src/Administrative/AdminAssignments.jsx
import React, { useState } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";
import useManageStore from "../Store/useManageStore";

const AdminAssignments = () => {
  const currentUser = useManageStore((state) => state.currentUser);
  const getAssignments = useManageStore((state) => state.getAssignments);
  const createAssignment = useManageStore((state) => state.createAssignment);
  const deleteAssignment = useManageStore((state) => state.deleteAssignment);
  const getTeamStudents = useManageStore((state) => state.getTeamStudents);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const assignments = getAssignments();
  const teamStudents = getTeamStudents();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description || !formData.dueDate) {
      setError("Please fill in all fields");
      return;
    }

    const result = createAssignment(
      formData.title,
      formData.description,
      formData.dueDate
    );

    if (result.success) {
      setSuccess("Assignment created and sent to all students!");
      setFormData({ title: "", description: "", dueDate: "" });
      setShowCreateModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const result = deleteAssignment(assignmentId);
      if (result.success) {
        setSuccess("Assignment deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
      }
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
                {teamStudents.length}
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

      {error && (
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
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Created:{" "}
                            {new Date(
                              assignment.timestamp
                            ).toLocaleDateString()}
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
                          <span>Sent to {teamStudents.length} students</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="ml-4 text-red-500 hover:text-red-400 p-2 hover:bg-red-500 hover:bg-opacity-10 rounded-lg transition-colors"
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
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-white text-2xl font-bold">
                Create New Assignment
              </h2>
              <p className="text-gray-400 mt-1">
                This will be sent to all {teamStudents.length} students in your
                team
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-white text-sm">{error}</p>
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
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  Create & Send
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
