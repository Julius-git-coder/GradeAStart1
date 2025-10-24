import React, { useState, useEffect } from "react";
import { Bell, AlertCircle, Clock } from "lucide-react";
import { subscribeToAnnouncements } from "../../Service/FirebaseConfig";
import { useAuth } from "../Store/useManageStore.jsx";

const Announcement = () => {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userData?.teamId) {
      setLoading(false);
      setError("No team ID found. Please log in again.");
      return;
    }

    console.log(
      "Student component subscribing to announcements for team:",
      userData.teamId
    );

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAnnouncements(
      userData.teamId,
      (updatedAnnouncements) => {
        console.log(
          "Student received announcements update:",
          updatedAnnouncements.length
        );
        setAnnouncements(updatedAnnouncements);
        setLoading(false);
        setError(null);
      },
      (subscriptionError) => {
        console.error(
          "Error in announcements subscription:",
          subscriptionError
        );
        setError("Failed to load announcements. Please refresh the page.");
        setLoading(false);
      }
    );

    return () => {
      console.log("Student component unsubscribing from announcements");
      unsubscribe();
    };
  }, [userData?.teamId]);

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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-5 h-5" />;
      case "medium":
        return <Bell className="w-5 h-5" />;
      case "low":
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";

    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        return "Recently";
      }

      return date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-3xl font-bold">Announcements</h1>
          <p className="text-gray-400 mt-1">
            Stay updated with the latest announcements from your instructor
          </p>
        </div>
        <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-500 text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white text-3xl font-bold">Announcements</h1>
        <p className="text-gray-400 mt-1">
          Stay updated with the latest announcements from your instructor
        </p>
      </div>

      {/* Real-time Indicator */}
      <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
        <p className="text-green-500 text-sm font-medium">
          Real-time updates enabled - New announcements appear automatically
        </p>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">
            No announcements yet
          </h3>
          <p className="text-gray-400">
            Your instructor hasn't posted any announcements. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${getPriorityColor(
                        announcement.priority
                      )}`}
                    >
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {formatDate(
                          announcement.createdAt || announcement.clientCreatedAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                    announcement.priority
                  )}`}
                >
                  {announcement.priority.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>

              {announcement.priority === "high" && (
                <div className="mt-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm font-medium">
                    This is a high priority announcement - Please take note!
                  </p>
                </div>
              )}

              {announcement.adminName && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-500 text-sm">
                    Posted by {announcement.adminName}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      {announcements.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-white font-semibold mb-1">
                About Announcements
              </h4>
              <p className="text-gray-400 text-sm">
                Announcements are posted by your instructor to keep you informed
                about important updates, deadlines, and class information. New
                announcements appear here automatically in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Announcement;
