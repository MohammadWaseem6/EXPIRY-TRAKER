import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";

const COLORS = {
  bg: "#0a1a2f",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  active: "#4a9fdb",
  success: "#3ecf8e",
  warning: "#f0a63a",
  danger: "#c23e8f",
};

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Stock = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      apiClient
        .getItems(token)
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch((err) => console.error("Fetch items error:", err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleRelease = async (itemId) => {
    if (
      window.confirm(
        "Release this item? It will be permanently removed from inventory."
      )
    ) {
      try {
        const response = await apiClient.releaseItem(token, itemId);
        if (response.message) {
          setMessage("Item released and removed from inventory!");
          setItems((prevItems) =>
            prevItems.filter((item) => item._id !== itemId)
          );
          setTimeout(() => setMessage(""), 3000);
        } else {
          setMessage(response.error || "Failed to release item");
        }
      } catch (error) {
        setMessage("Something went wrong");
      }
    }
  };

  const categories = useMemo(() => {
    const cats = items.map((i) => i.category || "Uncategorized");
    return ["All", ...new Set(cats)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || item.category === filterCategory;

      let matchesStatus = true;
      const days = daysUntil(item.expiryDate);
      if (filterStatus === "Fresh") matchesStatus = days > 3;
      else if (filterStatus === "Expiring Soon")
        matchesStatus = days >= 0 && days <= 3;
      else if (filterStatus === "Expired") matchesStatus = days < 0;
      else if (filterStatus === "Low Stock")
        matchesStatus = (item.quantity || 0) <= 5;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const total = items.length;
    const expiringSoon = items.filter((i) => {
      const d = daysUntil(i.expiryDate);
      return d >= 0 && d <= 3;
    }).length;
    const expired = items.filter((i) => daysUntil(i.expiryDate) < 0).length;
    const lowStock = items.filter((i) => (i.quantity || 0) <= 5).length;
    const fresh = total - expiringSoon - expired;
    return { total, fresh, expiringSoon, expired, lowStock };
  }, [items]);

  const getStatusBadge = (item) => {
    const days = daysUntil(item.expiryDate);
    if (days < 0)
      return { label: "Expired", color: COLORS.danger, icon: AlertTriangle };
    if (days <= 3)
      return { label: "Expiring Soon", color: COLORS.warning, icon: Clock };
    return { label: "Fresh", color: COLORS.success, icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a1a2f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a1a2f] min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e8eef7]">
            Stock Overview
          </h1>
          <p className="text-sm text-[#7f97b8] mt-1">
            Manage your inventory items
          </p>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          {message && (
            <span className="text-sm text-[#3ecf8e]">{message}</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-[#0f2540] border border-[#1c3a5e]">
          <p className="text-xs text-[#7f97b8]">Total Items</p>
          <p className="text-2xl font-bold text-[#e8eef7]">{stats.total}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#0f2540] border border-[#1c3a5e]">
          <p className="text-xs text-[#7f97b8]">Fresh</p>
          <p className="text-2xl font-bold text-[#3ecf8e]">{stats.fresh}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#0f2540] border border-[#1c3a5e]">
          <p className="text-xs text-[#7f97b8]">Expiring Soon</p>
          <p className="text-2xl font-bold text-[#f0a63a]">{stats.expiringSoon}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#0f2540] border border-[#1c3a5e]">
          <p className="text-xs text-[#7f97b8]">Low Stock</p>
          <p className="text-2xl font-bold text-[#c23e8f]">{stats.lowStock}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl p-4 mb-6 bg-[#0f2540] border border-[#1c3a5e]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7f97b8]" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Fresh">Fresh</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const status = getStatusBadge(item);
          const days = daysUntil(item.expiryDate);
          const StatusIcon = status.icon;

          return (
            <div
              key={item._id}
              className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer bg-[#0f2540] border border-[#1c3a5e]"
              onClick={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-[#e8eef7]">
                  {item.name}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{
                    background: `${status.color}20`,
                    color: status.color,
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-[#7f97b8]">
                {item.category || "Uncategorized"}
              </p>
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-[#7f97b8]">
                  Qty: <span className="text-[#e8eef7] font-medium">{item.quantity || 0}</span>
                </span>
                <span className="text-[#7f97b8]">
                  Price: <span className="text-[#e8eef7] font-medium">${item.price || 0}</span>
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-[#7f97b8]">
                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  {days < 0 && (
                    <span className="text-[#c23e8f]">
                      {" "}
                      ({Math.abs(days)} days overdue)
                    </span>
                  )}
                  {days >= 0 && days <= 3 && (
                    <span className="text-[#f0a63a]">
                      {" "}
                      ({days} days left)
                    </span>
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRelease(item._id);
                  }}
                  className="p-1 text-green-400 hover:text-green-300 transition"
                  title="Release Item"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl p-12 text-center bg-[#0f2540] border border-[#1c3a5e]">
          <Package className="w-12 h-12 mx-auto text-[#7f97b8]" />
          <p className="mt-2 text-[#7f97b8]">No items found</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md bg-[#0f2540] border border-[#1c3a5e]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-[#e8eef7]">
                {selectedItem.name}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-[#7f97b8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                <span className="text-[#7f97b8]">Category</span>
                <span className="text-[#e8eef7]">
                  {selectedItem.category || "Uncategorized"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                <span className="text-[#7f97b8]">Quantity</span>
                <span className="text-[#e8eef7]">
                  {selectedItem.quantity || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                <span className="text-[#7f97b8]">Price</span>
                <span className="text-[#e8eef7]">
                  ${selectedItem.price || 0}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                <span className="text-[#7f97b8]">Expiry Date</span>
                <span className="text-[#e8eef7]">
                  {new Date(selectedItem.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                <span className="text-[#7f97b8]">Status</span>
                <span className="font-medium" style={{ color: getStatusBadge(selectedItem).color }}>
                  {getStatusBadge(selectedItem).label}
                </span>
              </div>
              {selectedItem.isAllergen && (
                <div className="flex justify-between py-2 border-b border-[#1c3a5e]">
                  <span className="text-[#7f97b8]">Allergen</span>
                  <span className="text-[#f0a63a]">Yes</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="mt-6 w-full px-4 py-2 rounded-lg text-sm font-medium transition bg-[#4a9fdb] text-white hover:bg-[#3d8ec8]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;