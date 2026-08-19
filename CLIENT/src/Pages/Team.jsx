import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiClient } from "../Api/apiClient";
import {
  User,
  Shield,
  Trash2,
  Edit,
  Plus,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Team = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState("");
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "viewer",
    branch: "HQ",
  });

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getUsers(token);
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Invite user
  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.inviteUser(token, inviteForm);
      if (data.user) {
        setMessage(`✅ User invited! Temp password: ${data.tempPassword}`);
        setInviteForm({ name: "", email: "", role: "viewer", branch: "HQ" });
        fetchUsers();
        setShowInviteModal(false);
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(data.error || "Failed to invite");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.updateUser(
        token,
        editingUser._id,
        editingUser,
      );
      if (data.user) {
        setMessage("✅ User updated!");
        fetchUsers();
        setShowEditModal(false);
        setEditingUser(null);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to update");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Delete ${userName}?`)) {
      const data = await apiClient.deleteUser(token, userId);
      if (data.message) {
        setMessage("✅ User deleted!");
        fetchUsers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to delete");
      }
    }
  };

  // Role badge colors
  const getRoleBadge = (role) => {
    const map = {
      admin: "bg-purple-100 text-purple-700",
      storekeeper: "bg-blue-100 text-blue-700",
      viewer: "bg-gray-100 text-gray-700",
    };
    return map[role] || map.viewer;
  };

  // Branch badge
  const getBranchBadge = (branch) => {
    const map = {
      HQ: "bg-green-100 text-green-700",
      STC: "bg-orange-100 text-orange-700",
      SPADC: "bg-blue-100 text-blue-700",
      SABIC: "bg-yellow-100 text-yellow-700",
    };
    return map[branch] || "bg-gray-100 text-gray-700";
  };

  // Cconst isAdmin = user?.role === "admin";heck if current user is admin
  const isAdmin = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">👥 Team Members</h1>
        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  User
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Branch
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentUser = u._id === user?._id;

                  return (
                    <tr
                      key={u._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <span className="font-medium text-gray-800">
                            {u.name}{" "}
                            {isCurrentUser && (
                              <span className="text-xs text-blue-500">
                                (You)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getBranchBadge(u.branch)}`}
                        >
                          {u.branch || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleBadge(u.role)}`}
                        >
                          {u.role || "viewer"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isAdmin && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setShowEditModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition"
                              title="Edit Role / Branch"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1 text-gray-400 hover:text-red-600 transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== INVITE MODAL ===== */}
      {showInviteModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Invite New Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Ahmed Al-Saud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="ahmed@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={inviteForm.branch}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, branch: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="HQ">HQ</option>
                  <option value="STC">STC</option>
                  <option value="SPADC">SPADC</option>
                  <option value="SABIC">SABIC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="storekeeper">Storekeeper</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Invite Member
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              A temporary password will be generated and shown after creation.
            </p>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && editingUser && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Edit User: {editingUser.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={editingUser.branch || "HQ"}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, branch: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="HQ">HQ</option>
                  <option value="STC">STC</option>
                  <option value="SPADC">SPADC</option>
                  <option value="SABIC">SABIC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role || "viewer"}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="storekeeper">Storekeeper</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive !== false}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
