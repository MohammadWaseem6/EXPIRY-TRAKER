import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";
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
  AreaChart,
  Area,
} from "recharts";
import {
  LayoutGrid,
  Tags,
  Clock,
  Activity,
  TrendingUp as TrendIcon,
  DollarSign,
  Package,
  AlertTriangle,
  Boxes,
} from "lucide-react";

const CHART_COLORS = ["#4a9fdb", "#3ecf8e", "#f0a63a", "#c23e8f", "#7b4fb0", "#c9d84a"];

const FILTERS = [
  { key: "all", label: "All", icon: LayoutGrid },
  { key: "category", label: "Category", icon: Tags },
  { key: "expiry", label: "Expiry", icon: Clock },
  { key: "status", label: "Status", icon: Activity },
  { key: "trend", label: "Monthly Trend", icon: TrendIcon },
  { key: "value", label: "Value", icon: DollarSign },
];

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const fmtMoney = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const ChartCard = ({ title, children, span = false }) => (
  <div
    className={`p-4 sm:p-5 rounded-xl ${span ? "lg:col-span-2" : ""} bg-[#0f2540] dark:bg-[#0f2540] border border-[#1c3a5e]`}
  >
    <h3 className="text-sm font-medium mb-4 text-gray-100">
      {title}
    </h3>
    {children}
  </div>
);

const Empty = () => (
  <div className="flex items-center justify-center h-[260px] text-sm text-gray-400">
    No data yet
  </div>
);

const tooltipStyle = { 
  background: "#0a1a2f", 
  border: "1px solid #1c3a5e", 
  color: "#e8eef7" 
};

const Charts = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("all");

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

  const categoryData = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [items]);

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
    return buckets.filter((b) => b.value > 0);
  }, [items]);

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
    ].filter((s) => s.value > 0);
  }, [items]);

  const monthlyData = useMemo(() => {
    const months = {};
    items.forEach((i) => {
      if (!i.createdAt) return;
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

  const valueByCategory = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + (parseFloat(i.price) || 0);
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [items]);

  const kpis = useMemo(() => {
    const totalValue = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
    const lowStock = items.filter((i) => (i.quantity || 0) <= 5).length;
    const categories = new Set(items.map((i) => i.category || "Uncategorized")).size;
    return { total: items.length, categories, totalValue, lowStock };
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a1a2f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  const show = (key) => chartType === "all" || chartType === key;
  const wide = chartType !== "all";

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#0a1a2f]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-gray-100">
            <Boxes className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Charts & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Visual insights into your inventory
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
          {FILTERS.map(({ key, label, icon: Icon }) => {
            const isActive = chartType === key;
            return (
              <button
                key={key}
                onClick={() => setChartType(key)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition flex-1 sm:flex-none justify-center ${
                  isActive 
                    ? "bg-blue-500 text-white border border-blue-500" 
                    : "bg-[#0f2540] text-gray-400 border border-[#1c3a5e] hover:bg-[#1c3a5e]"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">{label}</span>
                <span className="xs:hidden">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Total Items", value: kpis.total, icon: Package, color: "#4a9fdb" },
          { label: "Categories", value: kpis.categories, icon: Tags, color: "#3ecf8e" },
          { label: "Total Value", value: fmtMoney(kpis.totalValue), icon: DollarSign, color: "#3ecf8e" },
          { label: "Low Stock", value: kpis.lowStock, icon: AlertTriangle, color: "#f0a63a" },
        ].map((k) => (
          <div
            key={k.label}
            className="p-3 sm:p-4 rounded-xl flex items-center gap-3 bg-[#0f2540] border border-[#1c3a5e]"
          >
            <div 
              className="p-2 rounded-lg flex-shrink-0"
              style={{ background: `${k.color}22` }}
            >
              <k.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: k.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">{k.label}</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-100 truncate">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {show("category") && (
          <ChartCard title="Items by Category" span={wide}>
            {categoryData.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c3a5e" />
                  <XAxis dataKey="name" tick={{ fill: "#7f97b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#7f97b8", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#4a9fdb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}

        {show("expiry") && (
          <ChartCard title="Expiry Distribution" span={wide}>
            {expiryData.length === 0 ? (
              <Empty />
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
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: "#7f97b8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}

        {show("status") && (
          <ChartCard title="Stock Status" span={wide}>
            {statusData.length === 0 ? (
              <Empty />
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
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: "#7f97b8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}

        {show("trend") && (
          <ChartCard title="Monthly Items Added" span={wide}>
            {monthlyData.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c3a5e" />
                  <XAxis dataKey="month" tick={{ fill: "#7f97b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#7f97b8", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#4a9fdb" 
                    fill="#4a9fdb" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}

        {show("value") && (
          <ChartCard title="Total Value by Category ($)" span={wide}>
            {valueByCategory.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(260, valueByCategory.length * 48)}>
                <BarChart data={valueByCategory} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c3a5e" />
                  <XAxis type="number" tick={{ fill: "#7f97b8", fontSize: 11 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: "#7f97b8", fontSize: 11 }} 
                    width={90} 
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
                  <Bar dataKey="value" fill="#3ecf8e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default Charts;