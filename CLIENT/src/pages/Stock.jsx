import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  X,
  Eye,
  Edit,
  Trash2,
  Plus,
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

  // Fetch items on mount
  useState(() => {
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = items.map((i) => i.category || "Uncategorized");
    return ["All", ...new Set(cats)];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      
      let matchesStatus = true;
      const days = daysUntil(item.expiryDate);
      if (filterStatus === "Fresh") matchesStatus = days > 3;
      else if (filterStatus === "Expiring Soon") matchesStatus = days >= 0 && days <= 3;
      else if (filterStatus === "Expired") matchesStatus = days < 0;
      else if (filterStatus === "Low Stock") matchesStatus = (item.quantity || 0) <= 5;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, filterCategory, filterStatus]);

  // Stats
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
    if (days < 0) return { label: "Expired", color: COLORS.danger, icon: AlertTriangle };
    if (days <= 3) return { label: "Expiring Soon", color: COLORS.warning, icon: Clock };
    return { label: "Fresh", color: COLORS.success, icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: COLORS.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            📦 Stock Overview
          </h1>
          <p className="text-sm" style={{ color: COLORS.sub }}>
            Manage your inventory items
          </p>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm"
            style={{ background: COLORS.active, color: "#fff" }}
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <p className="text-xs" style={{ color: COLORS.sub }}>Total Items</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{stats.total}</p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <p className="text-xs" style={{ color: COLORS.sub }}>Fresh</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.success }}>{stats.fresh}</p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <p className="text-xs" style={{ color: COLORS.sub }}>Expiring Soon</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.warning }}>{stats.expiringSoon}</p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <p className="text-xs" style={{ color: COLORS.sub }}>Low Stock</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.danger }}>{stats.lowStock}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: COLORS.sub }} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm"
              style={{
                background: COLORS.bg,
                color: COLORS.text,
                border: `1px solid ${COLORS.panelBorder}`,
              }}
              onFocus={(e) => e.target.style.borderColor = COLORS.active}
              onBlur={(e) => e.target.style.borderColor = COLORS.panelBorder}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg outline-none text-sm"
              style={{
                background: COLORS.bg,
                color: COLORS.text,
                border: `1px solid ${COLORS.panelBorder}`,
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg outline-none text-sm"
              style={{
                background: COLORS.bg,
                color: COLORS.text,
                border: `1px solid ${COLORS.panelBorder}`,
              }}
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
              className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
              style={{
                background: COLORS.panel,
                border: `1px solid ${status.color}40`,
              }}
              onClick={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold" style={{ color: COLORS.text }}>
                  {item.name}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ background: `${status.color}20`, color: status.color }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <p className="text-sm" style={{ color: COLORS.sub }}>{item.category || "Uncategorized"}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span style={{ color: COLORS.sub }}>
                  Qty: <span style={{ color: COLORS.text }}>{item.quantity || 0}</span>
                </span>
                <span style={{ color: COLORS.sub }}>
                  Price: <span style={{ color: COLORS.text }}>${item.price || 0}</span>
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs" style={{ color: COLORS.sub }}>
                  Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  {days < 0 && (
                    <span style={{ color: COLORS.danger }}> ({Math.abs(days)} days overdue)</span>
                  )}
                  {days >= 0 && days <= 3 && (
                    <span style={{ color: COLORS.warning }}> ({days} days left)</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <Package className="w-12 h-12 mx-auto" style={{ color: COLORS.sub }} />
          <p className="mt-2" style={{ color: COLORS.sub }}>No items found</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold" style={{ color: COLORS.text }}>
                {selectedItem.name}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-white/10"
                style={{ color: COLORS.sub }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                <span style={{ color: COLORS.sub }}>Category</span>
                <span style={{ color: COLORS.text }}>{selectedItem.category || "Uncategorized"}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                <span style={{ color: COLORS.sub }}>Quantity</span>
                <span style={{ color: COLORS.text }}>{selectedItem.quantity || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                <span style={{ color: COLORS.sub }}>Price</span>
                <span style={{ color: COLORS.text }}>${selectedItem.price || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                <span style={{ color: COLORS.sub }}>Expiry Date</span>
                <span style={{ color: COLORS.text }}>
                  {new Date(selectedItem.expiryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                <span style={{ color: COLORS.sub }}>Status</span>
                <span style={{ color: getStatusBadge(selectedItem).color }}>
                  {getStatusBadge(selectedItem).label}
                </span>
              </div>
              {selectedItem.isAllergen && (
                <div className="flex justify-between py-2 border-b" style={{ borderColor: COLORS.panelBorder }}>
                  <span style={{ color: COLORS.sub }}>Allergen</span>
                  <span style={{ color: COLORS.warning }}>⚠️ Yes</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: COLORS.active, color: "#fff" }}
              >
                <Edit className="w-4 h-4 inline mr-1" /> Edit
              </button>
              <button
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{ background: "rgba(194,62,143,0.2)", color: COLORS.danger }}
              >
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;