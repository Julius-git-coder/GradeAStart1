

import React, { useState } from "react";
import { Bell, FileText, User, Menu, X } from "lucide-react";
import { useAuth } from "./Store/useManageStore";
import Assignments from "./Students/Assignments";
import Announcement from "./Students/Announcement";

// Notification Modal Component (simplified)
const NotificationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-20 w-80 bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-700">
      <div className="p-4 border-b border-gray-600">
        <h3 className="text-white font-semibold">Notifications</h3>
      </div>
      <div className="p-4 text-gray-400 text-center">No new notifications</div>
      <button
        onClick={onClose}
        className="w-full p-2 hover:bg-gray-700 text-gray-300"
      >
        Close
      </button>
    </div>
  );
};

// Sidebar Component (limited menu)
const Sidebar = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const menuItems = [
    { id: "announcements", icon: Bell, label: "Announcements" },
    { id: "assignments", icon: FileText, label: "Assignments" },
  ];

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">GradeA+</h1>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-gray-800 text-white border-l-4 border-yellow-500"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

const HomeContents = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState("announcements");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleBellClick = () => {
    setIsNotificationOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "announcements":
        return <Announcement />;
      case "assignments":
        return <Assignments />;
      default:
        return <Announcement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-gray-400 text-sm">
                Welcome, {userData?.fullName || "Student"}
              </div>
              <button
                onClick={handleBellClick}
                className="relative text-gray-400 hover:text-white"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                  0
                </span>
              </button>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};

export default HomeContents;