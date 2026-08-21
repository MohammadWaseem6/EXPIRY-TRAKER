import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiClient } from "../Api/apiClient";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  ClipboardList,
  Package,
  User,
  Calendar,
} from "lucide-react";

const StockingRequests = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState("");
  const [newRequest, setNewRequest] = useState({
    assignedTo: "",
    branch: "HQ",
    items: [{ item: "", expectedQuantity: 1 }],
    notes: "",
  });
  const [users, setUsers] = useState([]);

  const isAdmin = user?.role === "admin" || user?.role === "manager";
  const isStorekeeper = user?.role === "storekeeper";

  // Fetch requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getStockingRequests(token);
      if (Array.isArray(data)) setRequests(data);
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users (for assign dropdown)
  const fetchUsers = async () => {
    try {
      const data = await apiClient.getUsers(token);
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (isAdmin) fetchUsers();
  }, []);

  // Create request
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.createStockingRequest(token, newRequest);
      if (data.request) {
        setMessage("Request created!");
        setNewRequest({
          assignedTo: "",
          branch: "HQ",
          items: [{ item: "", expectedQuantity: 1 }],
          notes: "",
        });
        fetchRequests();
        setShowCreateModal(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to create request");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  // Accept request (Storekeeper)
  const handleAcceptRequest = async (requestId) => {
    try {
      const data = await apiClient.acceptStockingRequest(token, requestId);
      if (data.request) {
        setMessage(" Request accepted!");
        fetchRequests();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to accept");
      }
    } catch (error) {
      setMessage("Something went wrong");
    }
  };

  // Complete request (Storekeeper)
  const handleCompleteRequest = async (requestId) => {
    if (window.confirm("Complete this request?")) {
      try {
        const data = await apiClient.completeStockingRequest(token, requestId);
        if (data.request) {
          setMessage(" Request completed!");
          fetchRequests();
          setTimeout(() => setMessage(""), 3000);
        } else {
          setMessage(data.error || "Failed to complete");
        }
      } catch (error) {
        setMessage("Something went wrong");
      }
    }
  };

  // Cancel request (Admin/Manager)
  const handleCancelRequest = async (requestId) => {
    if (window.confirm("Cancel this request?")) {
      try {
        const data = await apiClient.cancelStockingRequest(token, requestId);
        if (data.request) {
          setMessage(" Request cancelled");
          fetchRequests();
          setTimeout(() => setMessage(""), 3000);
        } else {
          setMessage(data.error || "Failed to cancel");
        }
      } catch (error) {
        setMessage("Something went wrong");
      }
    }
  };

  // Add item row to create form
  const addItemRow = () => {
    setNewRequest({
      ...newRequest,
      items: [...newRequest.items, { item: "", expectedQuantity: 1 }],
    });
  };

  // Remove item row
  const removeItemRow = (index) => {
    const updatedItems = newRequest.items.filter((_, i) => i !== index);
    setNewRequest({ ...newRequest, items: updatedItems });
  };

  // Update item row
  const handleItemChange = (index, field, value) => {
    const updatedItems = newRequest.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewRequest({ ...newRequest, items: updatedItems });
  };

  // Status badge
  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      "in-progress": "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📋 Stocking Requests</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Create Request
          </button>
        )}
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
          {message}
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No requests found</td></tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-gray-800">{request.requestNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{request.branch}</td>
                    <td className="py-3 px-4 text-gray-600">{request.assignedTo?.name || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-600">{request.items?.length || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isStorekeeper && request.status === "pending" && (
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="p-1 text-green-500 hover:text-green-700 transition"
                            title="Accept"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {isStorekeeper && request.status === "in-progress" && (
                          <button
                            onClick={() => handleCompleteRequest(request._id)}
                            className="p-1 text-blue-500 hover:text-blue-700 transition"
                            title="Complete"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        )}
                        {(isAdmin && request.status !== "completed" && request.status !== "cancelled") && (
                          <button
                            onClick={() => handleCancelRequest(request._id)}
                            className="p-1 text-red-400 hover:text-red-600 transition"
                            title="Cancel"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CREATE MODAL ===== */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Stocking Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              {/* Assign to Storekeeper */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Storekeeper *</label>
                <select
                  value={newRequest.assignedTo}
                  onChange={(e) => setNewRequest({ ...newRequest, assignedTo: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Storekeeper</option>
                  {users.filter(u => u.role === "storekeeper").map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                <select
                  value={newRequest.branch}
                  onChange={(e) => setNewRequest({ ...newRequest, branch: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="HQ">HQ</option>
                  <option value="STC">STC</option>
                  <option value="SPADC">SPADC</option>
                  <option value="SABIC">SABIC</option>
                </select>
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                {newRequest.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 bg-gray-50 p-2 rounded-lg">
                    <input
                      type="text"
                      placeholder="Item ID (or name)"
                      value={item.item}
                      onChange={(e) => handleItemChange(index, "item", e.target.value)}
                      required
                      className="col-span-7 px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.expectedQuantity}
                      onChange={(e) => handleItemChange(index, "expectedQuantity", parseInt(e.target.value) || 0)}
                      required
                      className="col-span-4 px-2 py-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="col-span-1 text-red-500 hover:text-red-700 flex items-center justify-center"
                      disabled={newRequest.items.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Enter the Item ID from your database, or a descriptive name.</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  placeholder="Any special instructions..."
                />
              </div>

              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Create Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Request Details</h3>
              <button onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Request #:</span> {selectedRequest.requestNumber}</p>
                <p><span className="font-medium">Branch:</span> {selectedRequest.branch}</p>
                <p><span className="font-medium">Requested By:</span> {selectedRequest.requestedBy?.name}</p>
                <p><span className="font-medium">Assigned To:</span> {selectedRequest.assignedTo?.name}</p>
                <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></p>
                {selectedRequest.completedAt && (
                  <p><span className="font-medium">Completed:</span> {new Date(selectedRequest.completedAt).toLocaleDateString()}</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-left py-2 px-3">Expected</th>
                      <th className="text-left py-2 px-3">Counted</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3">{item.expectedQuantity}</td>
                        <td className="py-2 px-3">{item.countedQuantity || "—"}</td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === "counted" ? "bg-green-100 text-green-700" :
                            item.status === "discrepancy" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRequest.notes && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { setShowDetailModal(false); setSelectedRequest(null); }}
              className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockingRequests;