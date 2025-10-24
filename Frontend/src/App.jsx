import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./Store/useManageStore";
import HomeContents from "./HomeContents";
import Administrator from "./Administrative/Administrator";
import StudentSignUp from "./Navigation/StudentSignUp";
import AdminSignUp from "./Navigation/AdminSignUp";
import Login from "./Navigation/Login";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userData?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on role
    if (userData?.role === "admin") {
      return <Navigate to="/Administrator" replace />;
    } else if (userData?.role === "student") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser && userData) {
    // Redirect to appropriate dashboard based on role
    if (userData.role === "admin") {
      return <Navigate to="/Administrator" replace />;
    } else if (userData.role === "student") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/student-signup"
        element={
          <PublicRoute>
            <StudentSignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/admin-signup"
        element={
          <PublicRoute>
            <AdminSignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <HomeContents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Administrator"
        element={
          <ProtectedRoute allowedRole="admin">
            <Administrator />
          </ProtectedRoute>
        }
      />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
