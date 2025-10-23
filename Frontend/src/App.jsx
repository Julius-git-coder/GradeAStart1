// App.js - Main application component with routing
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeContents from "./HomeContents"; // Adjust path as needed
import Administrator from "./Administrative/Administrator";
import StudentSignUp from "./Navigation/StudentSignUp"; // Adjust path as needed
import AdminSignUp from "./Navigation/AdminSignUp"; // Adjust path as needed
import Login from "./Navigation/Login"; // Adjust path as needed

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/student-signup" element={<StudentSignUp />} />
          <Route path="/admin-signup" element={<AdminSignUp />} />
          <Route path="/dashboard" element={<HomeContents />} />
          <Route path="/Administrator" element={<Administrator/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
