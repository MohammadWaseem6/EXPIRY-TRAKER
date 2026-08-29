import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
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

const CHART_COLORS = ["#4a9fdb", "#3ecf8e", "#f0a63a", "#c23e8f", "#7b4fb0", "#c9d84a"];

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Charts = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("category");

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

  // ---------- Category Data ----------
  const categoryData = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [items]);

  // ---------- Expiry Distribution ----------
  const expiryData = useMemo(() => {
    const buckets = [
      { name: "Expired", value: 0 },
      { name: "0-3 days", value: 0 },
      { name: "4-7 days", value: 0 },
      { name: "8-14 days", value: 0 },
      { name: "15-30 days", value: 0 },
      { name: "30+ days", value: 0 },
    ];
    items.forEach((i) => {
      const d = daysUntil(i.expiryDate);
      if (d < 0) buckets[0].value++;
      else if (d <= 3) buckets[1].value++;
      else if (d <= 7) buckets[2].value++;
      else if (d <= 14) buckets[3].value++;
      else if (d <= 30) buckets[4].value++;
      else buckets[5].value++;
    });
    return buckets;
  }, [items]);

  // ---------- Status Data ----------
  const statusData = useMemo(() => {
    const total = items.length;
    const expiringSoon = items.filter((i) => {
      const d = daysUntil(i.expiryDate);
      return d >= 0 && d <= 3;
    }).length;
    const expired = items.filter((i) => daysUntil(i.expiryDate) < 0).length;
    const fresh = total - expiringSoon - expired;
    const lowStock = items.filter((i) => (i.quantity || 0) <= 5).length;
    return [
      { name: "Fresh", value: fresh },
      { name: "Expiring Soon", value: expiringSoon },
      { name: "Expired", value: expired },
      { name: "Low Stock", value: lowStock },
    ];
  }, [items]);

  // ---------- Monthly Trend (last 6 months) ----------
  const monthlyData = useMemo(() => {
    const months = {};
    items.forEach((i) => {
      const date = new Date(i.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { month: key, count: 0, value: 0 };
      months[key].count++;
      months[key].value += parseFloat(i.price) || 0;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([key, data]) => ({
        month: key,
        count: data.count,
        value: Math.round(data.value * 100) / 100,
      }));
  }, [items]);

  // ---------- Value by Category ----------
  const valueByCategory = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + (parseFloat(i.price) || 0);
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: COLORS.bg }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", padding: "24px" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
            📈 Charts & Analytics
          </h1>
          <p className="text-sm" style={{ color: COLORS.sub }}>
            Visual insights into your inventory
          </p>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: COLORS.panelBorder, color: COLORS.text, border: `1px solid ${COLORS.panelBorder}` }}
          >
            <option value="category">Category Breakdown</option>
            <option value="expiry">Expiry Distribution</option>
            <option value="status">Status Overview</option>
            <option value="trend">Monthly Trend</option>
            <option value="value">Value by Category</option>
          </select>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        {(chartType === "category" || chartType === "all") && (
          <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
              Items by Category
            </h3>
            {categoryData.length === 0 ? (
              <p className="text-center" style={{ color: COLORS.sub }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} />
                  <XAxis dataKey="name" tick={{ fill: COLORS.sub, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.sub, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }} />
                  <Bar dataKey="value" fill={COLORS.active} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Expiry Distribution */}
        {(chartType === "expiry" || chartType === "all") && (
          <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
              Expiry Distribution
            </h3>
            {expiryData.every(d => d.value === 0) ? (
              <p className="text-center" style={{ color: COLORS.sub }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expiryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expiryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }} />
                  <Legend wrapperStyle={{ color: COLORS.sub }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Status Overview */}
        {(chartType === "status" || chartType === "all") && (
          <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
              Stock Status
            </h3>
            {statusData.every(d => d.value === 0) ? (
              <p className="text-center" style={{ color: COLORS.sub }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }} />
                  <Legend wrapperStyle={{ color: COLORS.sub }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Monthly Trend */}
        {(chartType === "trend" || chartType === "all") && (
          <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
              Monthly Items Added
            </h3>
            {monthlyData.length === 0 ? (
              <p className="text-center" style={{ color: COLORS.sub }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} />
                  <XAxis dataKey="month" tick={{ fill: COLORS.sub, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.sub, fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }} />
                  <Area type="monotone" dataKey="count" stroke={COLORS.active} fill={COLORS.active} fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Value by Category */}
        {(chartType === "value" || chartType === "all") && (
          <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
              Total Value by Category ($)
            </h3>
            {valueByCategory.length === 0 ? (
              <p className="text-center" style={{ color: COLORS.sub }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valueByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} />
                  <XAxis type="number" tick={{ fill: COLORS.sub, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: COLORS.sub, fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.panelBorder}`, color: COLORS.text }} />
                  <Bar dataKey="value" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Total Items</p>
          <p className="text-xl font-bold" style={{ color: COLORS.text }}>{items.length}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Categories</p>
          <p className="text-xl font-bold" style={{ color: COLORS.text }}>{new Set(items.map(i => i.category)).size}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Total Value</p>
          <p className="text-xl font-bold" style={{ color: COLORS.text }}>
            ${items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0).toFixed(0)}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Low Stock Items</p>
          <p className="text-xl font-bold" style={{ color: COLORS.warning }}>
            {items.filter(i => (i.quantity || 0) <= 5).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Charts;