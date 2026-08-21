import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiClient } from "../Api/apiClient";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";

const PendingStockRequests = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const isManager = user?.role === "manager" || user?.role === "admin";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getPendingStockRequests(token);
      if (Array.isArray(data)) setRequests(data);
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    if (!window.confirm("Approve this request?")) return;
    try {
      const data = await apiClient.approveStockRequest(token, requestId);
      if (data.request) {
        setMessage("✅ Request approved!");
        fetchRequests();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to approve");
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Reject this request?")) return;
    try {
      const data = await apiClient.rejectStockRequest(token, requestId);
      if (data.request) {
        setMessage("❌ Request rejected.");
        fetchRequests();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Failed to reject");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-7 h-7 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-800">Pending Stock Requests</h1>
        {isManager && (
          <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {requests.filter(r => r.status === "pending").length} pending
          </span>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg border mb-4 ${message.includes("approved") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Requested By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Reason</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">No pending requests</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-gray-800">{req.requestNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{req.branch}</td>
                    <td className="py-3 px-4 text-gray-600">{req.requestedBy?.name}</td>
                    <td className="py-3 px-4 text-gray-600">{req.items?.length || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{req.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Approve/Reject (only for pending) */}
                        {req.status === "pending" && isManager && (
                          <>
                            <button
                              onClick={() => handleApprove(req._id)}
                              className="p-1 text-green-500 hover:text-green-700 transition"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              className="p-1 text-red-400 hover:text-red-600 transition"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
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

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
                <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedRequest.status)}`}>{selectedRequest.status}</span></p>
                <p className="col-span-2"><span className="font-medium">Reason:</span> {selectedRequest.reason}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Item</th>
                      <th className="text-left py-2 px-3">Category</th>
                      <th className="text-left py-2 px-3">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRequest.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3">{item.category || "—"}</td>
                        <td className="py-2 px-3">{item.quantity}</td>
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

export default PendingStockRequests;