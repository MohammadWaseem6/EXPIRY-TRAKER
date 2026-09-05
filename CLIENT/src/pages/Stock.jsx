import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Boxes,
  Sparkles,
  Layers,
  ShieldAlert,
} from "lucide-react";

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
      return { label: "Expired", color: "#c23e8f", icon: AlertTriangle };
    if (days <= 3)
      return { label: "Expiring Soon", color: "#f0a63a", icon: Clock };
    return { label: "Fresh", color: "#3ecf8e", icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 bg-[#0a1a2f]">
        <div className="relative w-9 h-9">
          <div className="absolute inset-0 rounded-full border-2 border-[#1c3a5e]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4a9fdb] animate-spin" />
        </div>
        <span className="text-xs tracking-wide text-[#5b7699]">
          Loading inventory…
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1a2f] min-h-screen p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,rgba(74,159,219,0.06),transparent_55%)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#4a9fdb] to-[#2f6fa8] shrink-0">
            <Boxes className="w-5 h-5 text-white" strokeWidth={2.1} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e8eef7]">
              Stock Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#7f97b8] mt-0.5">
              Manage your inventory items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-lg bg-[#3ecf8e]/10 text-[#3ecf8e] border border-[#3ecf8e]/20">
              <CheckCircle className="w-3.5 h-3.5" />
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Total Items"
          value={stats.total}
          color="#e8eef7"
          icon={Layers}
        />
        <StatCard
          label="Fresh"
          value={stats.fresh}
          color="#3ecf8e"
          icon={Sparkles}
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          color="#f0a63a"
          icon={Clock}
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          color="#c23e8f"
          icon={ShieldAlert}
        />
      </div>

      {/* Search & Filter */}
      <div className="rounded-xl p-4 mb-6 bg-[#0f2540] border border-[#1c3a5e] shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5b7699]" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] focus:ring-1 focus:ring-[#4a9fdb]/30 transition-colors placeholder-[#5b7699]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] transition-colors cursor-pointer"
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
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-lg outline-none text-sm bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] focus:border-[#4a9fdb] transition-colors cursor-pointer"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item) => {
          const status = getStatusBadge(item);
          const days = daysUntil(item.expiryDate);
          const StatusIcon = status.icon;

          return (
            <div
              key={item._id}
              className="group rounded-xl p-4 hover:shadow-lg transition-all duration-150 cursor-pointer bg-[#0f2540] border border-[#1c3a5e] hover:border-[#2c5581]"
              style={{ borderLeft: `3px solid ${status.color}` }}
              onClick={() => {
                setSelectedItem(item);
                setShowDetailModal(true);
              }}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-[#e8eef7] truncate text-sm sm:text-base group-hover:text-[#7fc4ea] transition-colors">
                  {item.name}
                </h3>
                <span
                  className="text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0"
                  style={{
                    background: `${status.color}18`,
                    color: status.color,
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span className="hidden xs:inline">{status.label}</span>
                  <span className="xs:hidden">{status.label.charAt(0)}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7f97b8] truncate mt-0.5">
                {item.category || "Uncategorized"}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1c3a5e]/60 text-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] text-[#5b7699]">Qty</span>
                  <span className="text-[#e8eef7] font-medium text-xs sm:text-sm">
                    {item.quantity || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] text-[#5b7699]">Price</span>
                  <span className="text-[#e8eef7] font-medium text-xs sm:text-sm">
                    ${item.price || 0}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] sm:text-[11px] text-[#5b7699]">
                    {days < 0 ? "Overdue" : "Left"}
                  </span>
                  <span
                    className="font-medium text-xs sm:text-sm"
                    style={{ color: status.color }}
                  >
                    {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRelease(item._id);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-[#3ecf8e]/12 text-[#3ecf8e] border border-[#3ecf8e]/25 hover:bg-[#3ecf8e]/20 transition-colors"
                  title="Release Item"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Release
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl p-10 sm:p-12 text-center bg-[#0f2540] border border-dashed border-[#1c3a5e]">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#3a5578]" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-[#7f97b8]">No items found</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="rounded-2xl p-5 sm:p-6 w-full max-w-md bg-[#0f2540] border border-[#1c3a5e] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ background: `${getStatusBadge(selectedItem).color}18` }}
                >
                  <Package
                    className="w-5 h-5"
                    style={{ color: getStatusBadge(selectedItem).color }}
                    strokeWidth={2}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#e8eef7] truncate">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#7f97b8] hover:text-[#c9d8ec] transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              <DetailRow label="Category" value={selectedItem.category || "Uncategorized"} />
              <DetailRow label="Quantity" value={selectedItem.quantity || 0} />
              <DetailRow label="Price" value={`$${selectedItem.price || 0}`} />
              <DetailRow
                label="Expiry Date"
                value={new Date(selectedItem.expiryDate).toLocaleDateString()}
              />
              <DetailRow
                label="Status"
                value={getStatusBadge(selectedItem).label}
                valueColor={getStatusBadge(selectedItem).color}
              />
              {selectedItem.isAllergen && (
                <DetailRow label="Allergen" value="Yes" valueColor="#f0a63a" />
              )}
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="mt-6 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-[#4a9fdb] text-white hover:bg-[#3d8ec8]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="rounded-xl p-3 sm:p-4 bg-[#0f2540] border border-[#1c3a5e] flex items-center justify-between gap-2">
    <div className="min-w-0">
      <p className="text-[10px] sm:text-xs text-[#7f97b8] truncate">{label}</p>
      <p
        className="text-lg sm:text-xl lg:text-2xl font-bold truncate"
        style={{ color }}
      >
        {value}
      </p>
    </div>
    {Icon && (
      <div
        className="hidden xs:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" style={{ color }} strokeWidth={2} />
      </div>
    )}
  </div>
);

// DetailRow Component
const DetailRow = ({ label, value, valueColor }) => (
  <div className="flex justify-between py-2.5 border-b border-[#1c3a5e]/60 last:border-b-0">
    <span className="text-xs sm:text-sm text-[#7f97b8]">{label}</span>
    <span
      className="text-xs sm:text-sm font-medium text-[#e8eef7]"
      style={valueColor ? { color: valueColor } : {}}
    >
      {value}
    </span>
  </div>
);

export default Stock;