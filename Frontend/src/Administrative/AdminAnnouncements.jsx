import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  AlertCircle,
  CheckCircle,
  Trash2,
  X,
  Users,
  Send,
} from "lucide-react";
import {
  createAnnouncement,
  subscribeToAnnouncements,
  deleteAnnouncement,
  getStudentsByTeam,
} from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore.jsx";

const AdminAnnouncements = () => {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load students count
  useEffect(() => {
    const loadStudents = async () => {
      if (userData?.teamId) {
        try {
          const studentList = await getStudentsByTeam(userData.teamId);
          setStudents(studentList);
        } catch (error) {
          console.error("Error loading students:", error);
        }
      }
    };
    loadStudents();
  }, [userData?.teamId]);

  // Subscribe to announcements
  useEffect(() => {
    if (userData?.teamId) {
      console.log(
        "Admin subscribing to announcements for team:",
        userData.teamId
      );

      const unsubscribe = subscribeToAnnouncements(
        userData.teamId,
        (updatedAnnouncements) => {
          console.log(
            "Admin received announcements:",
            updatedAnnouncements.length
          );
          setAnnouncements(updatedAnnouncements);
        },
        (error) => {
          console.error("Error in admin announcements subscription:", error);
        }
      );

      return () => unsubscribe();
    }
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

    if (!formData.title || !formData.content) {
      setError("Please fill in all fields");
      return;
    }

    if (!userData?.teamId) {
      setError("Team ID not found. Please try logging in again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
      });

      console.log("Announcement created successfully:", result.id);

      setSuccess(
        `Announcement sent successfully to ${students.length} student${
          students.length !== 1 ? "s" : ""
        }!`
      );
      setFormData({ title: "", content: "", priority: "medium" });

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError(
        error.message || "Failed to create announcement. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      await deleteAnnouncement(announcementId);
      setSuccess("Announcement deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting announcement:", error);
      setError("Failed to delete announcement");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 bg-opacity-20 border-red-500 ";
      case "medium":
        return "bg-yellow-500 bg-opacity-20 border-yellow-500 ";
      case "low":
        return "bg-blue-500 bg-opacity-20 border-blue-500 ";
      default:
        return "bg-gray-500 bg-opacity-20 border-gray-500 ";
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            Announcements
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Create and manage announcements for your team
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">
                Total Announcements
              </p>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-1">
                {announcements.length}
              </p>
            </div>
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">
                Students in Team
              </p>
              <p className="text-white text-2xl sm:text-3xl font-bold mt-1">
                {students.length}
              </p>
            </div>
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Your Team ID</p>
              <p className="text-white text-base sm:text-lg font-bold mt-1 font-mono">
                {userData?.teamId}
              </p>
            </div>
            <Send className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-white text-sm">{success}</p>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      {/* Real-time Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex flex-wrap items-center space-x-3">
        <div className="relative flex h-3 w-3 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <p className="text-white text-sm font-medium">
          Real-time updates enabled - Announcements sync automatically to all{" "}
          {students.length} student{students.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 sm:p-12 border border-gray-700 text-center">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-400 mb-6 text-sm">
            Create your first announcement to notify your students
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Announcement</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 text-white hover:border-yellow-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4 gap-4 sm:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-white text-lg sm:text-xl font-semibold">
                      {announcement.title}
                    </h3>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:space-x-2 sm:gap-0">
                    <p className="text-gray-400 text-xs sm:text-sm min-w-0">
                      {announcement.createdAt &&
                        new Date(
                          announcement.createdAt.toDate()
                        ).toLocaleString()}
                    </p>
                    <span className="text-gray-600 hidden sm:inline">•</span>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Sent to {students.length} student
                      {students.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="text-red-500 hover:text-red-500 transition-colors p-2 hover:bg-red-300 hover:bg-opacity-10 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-5 h-5 " />
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {announcement.content}
                </p>
              </div>

              <div className="mt-4 pt-3 sm:pt-4 border-t border-gray-700 flex flex-wrap items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Visible to all team members</span>
                </div>
                <div className="flex items-center space-x-2 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white">Live</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl sm:text-2xl font-bold">
                  Create New Announcement
                </h2>
                <p className="text-gray-400 mt-1 text-sm">
                  This will be sent to {students.length} student
                  {students.length !== 1 ? "s" : ""} in real-time
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError("");
                  setFormData({ title: "", content: "", priority: "medium" });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-white text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-gray-400 text-xs sm:text-sm font-medium mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-yellow-500 transition-colors text-sm"
                  placeholder="Enter announcement title"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs sm:text-sm font-medium mb-2">
                  Priority Level *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-yellow-500 transition-colors text-sm"
                  required
                  disabled={isSubmitting}
                >
                  <option value="low">Low - General information</option>
                  <option value="medium">Medium - Important update</option>
                  <option value="high">High - Urgent attention required</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-xs sm:text-sm font-medium mb-2">
                  Announcement Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 outline-none focus:border-yellow-500 transition-colors resize-none text-sm"
                  placeholder="Enter announcement details..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-blue-500 bg-opacity-10 border text-white border-blue-500 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <Send className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-xs sm:text-sm font-semibold mb-1">
                      Real-time Delivery
                    </p>
                    <p className="text-white text-xs">
                      This announcement will appear instantly on all student
                      dashboards. Students currently viewing the announcements
                      page will see it without refreshing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError("");
                    setFormData({ title: "", content: "", priority: "medium" });
                  }}
                  disabled={isSubmitting}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 sm:py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-yellow-500  hover:bg-yellow-600 text-gray-900 py-2 px-4 sm:py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Create & Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
