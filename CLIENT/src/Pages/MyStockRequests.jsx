import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { apiClient } from "../Api/apiClient";
import { ClipboardList, CheckCircle, XCircle, Clock } from "lucide-react";

const MyStockRequests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const data = await apiClient.getMyStockRequests(token);
        if (Array.isArray(data)) setRequests(data);
      } catch (error) {
        console.error("Fetch my requests error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

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
        <ClipboardList className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">My Stock Requests</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Branch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Reason</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No requests found</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-medium text-gray-800">{req.requestNumber}</td>
                    <td className="py-3 px-4 text-gray-600">{req.branch}</td>
                    <td className="py-3 px-4 text-gray-600">{req.items?.length || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{req.reason}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyStockRequests;