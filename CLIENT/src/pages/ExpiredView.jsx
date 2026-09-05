import { useMemo, useState, useEffect } from "react";
import {
  AlertOctagon,
  DollarSign,
  Layers,
  CalendarX,
  Search,
  Download,
  CheckCircle,
} from "lucide-react";
import { exportItemsToCSV } from "../utils/exportCSV";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-4 sm:p-5 ${className} bg-[#0f2540] border border-[#1c3a5e]`}
  >
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Panel className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${color}22` }}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] sm:text-xs text-gray-400 truncate">{label}</p>
      <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-100 truncate">{value}</p>
    </div>
  </Panel>
);

const ExpiredView = ({ items: propItems, onRelease }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("overdue");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (propItems) {
      setItems(propItems);
      setLoading(false);
    } else if (token) {
      apiClient
        .getItems(token)
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch((err) => console.error("Fetch items error:", err))
        .finally(() => setLoading(false));
    }
  }, [token, propItems]);

  const expired = useMemo(() => {
    return items
      .filter((i) => daysUntil(i.expiryDate) < 0)
      .map((i) => ({ ...i, daysOverdue: Math.abs(daysUntil(i.expiryDate)) }));
  }, [items]);

  const categories = useMemo(
    () => [
      "all",
      ...new Set(expired.map((i) => i.category || "Uncategorized")),
    ],
    [expired],
  );

  const filtered = useMemo(() => {
    let list = expired.filter((i) => {
      const matchesSearch = (i.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || (i.category || "Uncategorized") === category;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "overdue")
      list.sort((a, b) => b.daysOverdue - a.daysOverdue);
    if (sortBy === "name")
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (sortBy === "value")
      list.sort(
        (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0),
      );

    return list;
  }, [expired, search, category, sortBy]);

  const stats = useMemo(() => {
    const valueAtRisk = expired.reduce(
      (s, i) => s + (parseFloat(i.price) || 0),
      0,
    );
    const oldest = expired.reduce((max, i) => Math.max(max, i.daysOverdue), 0);
    const categoriesAffected = new Set(
      expired.map((i) => i.category || "Uncategorized"),
    ).size;
    return { count: expired.length, valueAtRisk, oldest, categoriesAffected };
  }, [expired]);

  // ---------- RELEASE HANDLER ----------
  const handleRelease = async (itemId) => {
    if (window.confirm("Release this expired item? It will be permanently removed from inventory.")) {
      try {
        const response = await apiClient.releaseItem(token, itemId);
        if (response.message) {
          setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
          setMessage("Item released and removed from inventory!");
          setTimeout(() => setMessage(""), 3000);
          if (onRelease) onRelease(itemId);
        } else {
          setMessage(response.error || "Failed to release item");
        }
      } catch (error) {
        setMessage("Something went wrong");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a1a2f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 bg-[#0a1a2f] p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-[#c23e8f]" />
          Expired Items
        </h2>
        <button
          onClick={() => exportItemsToCSV(filtered, "expired-items")}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition disabled:opacity-40 bg-[#c23e8f] text-white hover:bg-[#a8327a]"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="p-3 rounded-lg text-sm text-center bg-green-500/15 text-[#3ecf8e]">
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={AlertOctagon}
          label="Expired Items"
          value={stats.count}
          color="#c23e8f"
        />
        <StatCard
          icon={DollarSign}
          label="Value At Risk"
          value={`$${stats.valueAtRisk.toFixed(0)}`}
          color="#c23e8f"
        />
        <StatCard
          icon={CalendarX}
          label="Oldest Overdue"
          value={`${stats.oldest}d`}
          color="#f0a63a"
        />
        <StatCard
          icon={Layers}
          label="Categories Affected"
          value={stats.categoriesAffected}
          color="#7b4fb0"
        />
      </div>

      {/* Table Panel */}
      <Panel>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expired items..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none bg-[#0a1a2f] border border-[#1c3a5e] text-gray-100 placeholder-gray-500 focus:border-[#4a9fdb] transition-colors"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none bg-[#0a1a2f] border border-[#1c3a5e] text-gray-100 focus:border-[#4a9fdb] transition-colors"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none bg-[#0a1a2f] border border-[#1c3a5e] text-gray-100 focus:border-[#4a9fdb] transition-colors"
          >
            <option value="overdue">Sort: Most overdue</option>
            <option value="name">Sort: Name</option>
            <option value="value">Sort: Value</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#1c3a5e]">
                {[
                  "Item",
                  "Category",
                  "Qty",
                  "Price",
                  "Expired On",
                  "Overdue",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-2 sm:px-3 text-[10px] font-medium uppercase text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#1c3a5e]/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 px-2 sm:px-3 font-medium text-gray-100 truncate max-w-[80px] sm:max-w-[150px]">
                    {item.name || "Unnamed item"}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-gray-400 truncate max-w-[60px] sm:max-w-[100px]">
                    {item.category || "Uncategorized"}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-gray-400">
                    {item.quantity ?? "-"}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-gray-400">
                    ${(parseFloat(item.price) || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3 text-gray-400 whitespace-nowrap">
                    {new Date(item.expiryDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2.5 px-2 sm:px-3">
                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[#c23e8f]/15 text-[#e05fae] whitespace-nowrap">
                      {item.daysOverdue}d overdue
                    </span>
                  </td>
                  <td className="py-2.5 px-2 sm:px-3">
                    <button
                      onClick={() => handleRelease(item._id)}
                      className="text-[10px] sm:text-xs px-2 py-1 rounded-lg transition flex items-center gap-1 bg-[#3ecf8e]/15 text-[#3ecf8e] hover:bg-[#3ecf8e]/25 whitespace-nowrap"
                    >
                      <CheckCircle className="w-3 h-3" /> Release
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-sm text-gray-400"
                  >
                    {expired.length === 0
                      ? "Nothing expired — stock is clean"
                      : "No items match your filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default ExpiredView;