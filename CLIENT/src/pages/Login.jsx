import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";
import { Package, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient.login(form);
      if (data.token) {
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a1a2f]">
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[#0f2540] border border-[#1c3a5e] shadow-xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Package className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold text-gray-100">Store</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-100">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-center mt-1 text-gray-400">
          Login in to manage your inventory
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 rounded-lg text-sm text-center bg-[#c23e8f]/15 text-[#c23e8f]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-100">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition bg-[#0a1a2f] text-gray-100 border border-[#1c3a5e] focus:border-[#4a9fdb] placeholder-gray-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-100">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-10 pr-12 py-2.5 rounded-lg outline-none transition bg-[#0a1a2f] text-gray-100 border border-[#1c3a5e] focus:border-[#4a9fdb] placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 bg-[#4a9fdb] text-white hover:bg-[#3d8ec8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm mt-6 text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium hover:underline text-[#4a9fdb] hover:text-[#3d8ec8] transition"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
