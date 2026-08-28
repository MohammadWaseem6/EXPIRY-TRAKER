import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import { Package, Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react";

const COLORS = {
  bg: "#0a1a2f",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  active: "#4a9fdb",
};

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = form;
      const data = await apiClient.register(registerData);
      if (data.token) {
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: COLORS.bg }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Package className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold" style={{ color: COLORS.text }}>
            Store
          </span>
        </div>

        <h2 className="text-2xl font-bold text-center" style={{ color: COLORS.text }}>
          Create Account
        </h2>
        <p className="text-sm text-center mt-1" style={{ color: COLORS.sub }}>
          Join the inventory management system
        </p>

        {error && (
          <div
            className="mt-4 p-3 rounded-lg text-sm text-center"
            style={{ background: "rgba(194,62,143,0.15)", color: "#c23e8f" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.sub }} />
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition"
                style={{
                  background: COLORS.bg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.panelBorder}`,
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.active}
                onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.sub }} />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition"
                style={{
                  background: COLORS.bg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.panelBorder}`,
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.active}
                onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.sub }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-2.5 rounded-lg outline-none transition"
                style={{
                  background: COLORS.bg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.panelBorder}`,
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.active}
                onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: COLORS.sub }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.sub }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="w-full pl-10 pr-12 py-2.5 rounded-lg outline-none transition"
                style={{
                  background: COLORS.bg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.panelBorder}`,
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.active}
                onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: COLORS.sub }}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: COLORS.text }}>
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition appearance-none"
              style={{
                background: COLORS.bg,
                color: COLORS.text,
                border: `1px solid ${COLORS.panelBorder}`,
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.active}
              onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
            >
              <option value="viewer">👁️ Viewer (Read Only)</option>
              <option value="storekeeper">📦 Storekeeper</option>
              <option value="manager">📋 Manager</option>
            </select>
            <p className="text-xs mt-1" style={{ color: COLORS.sub }}>
              Admin accounts can only be created by invitation.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            style={{
              background: loading ? COLORS.panelBorder : COLORS.active,
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: COLORS.sub }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: COLORS.active }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;