import { useMemo, useState, useEffect } from "react";
import {
  AlertOctagon,
  DollarSign,
  Layers,
  CalendarX,
  Search,
  Download,
} from "lucide-react";
import { exportItemsToCSV } from "../utils/exportCSV";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";

// ===== COLORS =====
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
  grid: "#1c3a5e",
};

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-5 ${className}`}
    style={{
      background: COLORS.panel,
      border: `1px solid ${COLORS.panelBorder}`,
    }}
  >
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Panel className="flex items-center gap-3">
    <div className="p-2 rounded-lg" style={{ background: `${color}22` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: COLORS.sub }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: COLORS.text }}>
        {value}
      </p>
    </div>
  </Panel>
);

const ExpiredView = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("overdue");

  //  Fetch items when component mounts
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

  // Filter expired items
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

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ background: COLORS.bg }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      style={{ background: COLORS.bg, padding: "24px", minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>
          Expired Items
        </h2>
        <button
          onClick={() => exportItemsToCSV(filtered, "expired-items")}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40"
          style={{ background: "#c23e8f", color: "#fff" }}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Filters */}
      <Panel>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.sub }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expired items..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: COLORS.bg,
                border: `1px solid ${COLORS.panelBorder}`,
                color: COLORS.text,
              }}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.panelBorder}`,
              color: COLORS.text,
            }}
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
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.panelBorder}`,
              color: COLORS.text,
            }}
          >
            <option value="overdue">Sort: Most overdue</option>
            <option value="name">Sort: Name</option>
            <option value="value">Sort: Value</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
              {[
                "Item",
                "Category",
                "Qty",
                "Price",
                "Expired On",
                "Overdue",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 text-[10px] font-medium uppercase"
                  style={{ color: COLORS.sub }}
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
                style={{ borderBottom: `1px solid ${COLORS.grid}` }}
              >
                <td
                  className="py-2.5 font-medium"
                  style={{ color: COLORS.text }}
                >
                  {item.name || "Unnamed item"}
                </td>
                <td className="py-2.5" style={{ color: COLORS.sub }}>
                  {item.category || "Uncategorized"}
                </td>
                <td className="py-2.5" style={{ color: COLORS.sub }}>
                  {item.quantity ?? "-"}
                </td>
                <td className="py-2.5" style={{ color: COLORS.sub }}>
                  ${(parseFloat(item.price) || 0).toFixed(2)}
                </td>
                <td className="py-2.5" style={{ color: COLORS.sub }}>
                  {new Date(item.expiryDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-2.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(194,62,143,0.15)",
                      color: "#e05fae",
                    }}
                  >
                    {item.daysOverdue}d overdue
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm"
                  style={{ color: COLORS.sub }}
                >
                  {expired.length === 0
                    ? "Nothing expired — stock is clean 🎉"
                    : "No items match your filters"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
};

export default ExpiredView;
