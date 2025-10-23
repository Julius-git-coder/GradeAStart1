import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import {
  createAnnouncement,
  subscribeToAnnouncements,
  deleteAnnouncement,
  updateAnnouncement,
} from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore";

const AdminAnnouncements = () => {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (userData?.teamId) {
      // Subscribe to real-time updates
      const unsubscribe = subscribeToAnnouncements(
        userData.teamId,
        (updatedAnnouncements) => {
          setAnnouncements(updatedAnnouncements);
        }
      );

      return () => unsubscribe();
    }
  }, [userData]);

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

    setIsSubmitting(true);

    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
      });

      setSuccess("Announcement created successfully!");
      setFormData({ title: "", content: "", priority: "medium" });

      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError(error.message || "Failed to create announcement");
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
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Failed to delete announcement");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 bg-opacity-20 border-red-500 text-red-500";
      case "medium":
        return "bg-yellow-500 bg-opacity-20 border-yellow-500 text-yellow-500";
      case "low":
        return "bg-blue-500 bg-opacity-20 border-blue-500 text-blue-500";
      default:
        return "bg-gray-500 bg-opacity-20 border-gray-500 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Announcements</h1>
          <p className="text-gray-400 mt-1">
            Create and manage announcements for your team
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-400 mb-6">
            Create your first announcement to notify your students
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
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
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white text-xl font-semibold">
                      {announcement.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {announcement.createdAt &&
                      new Date(
                        announcement.createdAt.toDate()
                      ).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="text-red-500 hover:text-red-400 transition-colors p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Bell className="w-4 h-4" />
                  <span>Sent to all students in your team</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-2xl font-bold">
                Create New Announcement
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-white text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-white text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Priority Level *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Announcement Content *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-yellow-500 transition-colors resize-none"
                  placeholder="Enter announcement details..."
                  required
                />
              </div>

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-500 text-sm">
                  <strong>Note:</strong> This announcement will be sent to all
                  students in your team in real-time.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Creating..." : "Create Announcement"}
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
