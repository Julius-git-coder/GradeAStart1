import React, { useState } from "react";
import {
  Code,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../../Service/FirebaseConfig";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        // Redirect based on user role
        if (result.userData.role === "admin") {
          navigate("/Administrator");
        } else if (result.userData.role === "student") {
          navigate("/dashboard");
        } else {
          setError("Invalid user role");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError(error.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center">
              <Code className="w-10 h-10 text-gray-900" />
            </div>
            <div>
              <h1 className="text-white font-bold text-4xl">
                GradeA<span className="text-yellow-500">+</span>
              </h1>
              <p className="text-gray-400 text-sm">Student Management System</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Track Your Progress
              </h3>
              <p className="text-gray-400">
                Monitor your assignments, attendance, and overall performance in
                real-time.
              </p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">
                Stay Connected
              </h3>
              <p className="text-gray-400">
                Receive announcements and collaborate with classmates through
                the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-gray-900" />
              </div>
              <h1 className="text-white font-bold text-2xl">
                GradeA<span className="text-yellow-500">+</span>
              </h1>
            </div>

            <div className="mb-8">
              <h2 className="text-white text-3xl font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400">
                Sign in to continue to your dashboard
              </p>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-white text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg pl-12 pr-4 py-3 outline-none focus:border-yellow-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg pl-12 pr-12 py-3 outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 bg-gray-900 border-gray-700 rounded focus:ring-yellow-500 focus:ring-2"
                  />
                  <span className="text-gray-400 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-yellow-500 hover:text-yellow-400 text-sm font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>

            {/* Sign Up Links */}
            <div className="text-center space-y-2">
              <p className="text-gray-400">Don't have an account?</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => navigate("/student-signup")}
                  className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
                >
                  Student Sign Up
                </button>
                <span className="text-gray-600">|</span>
                <button
                  onClick={() => navigate("/admin-signup")}
                  className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
                >
                  Admin Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              © 2025 GradeA+. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
