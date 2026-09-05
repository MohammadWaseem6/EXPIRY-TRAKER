import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Reports = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

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

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const total = items.length;
    const expiringSoon = items.filter((i) => {
      const d = daysUntil(i.expiryDate);
      return d >= 0 && d <= 3;
    }).length;
    const expired = items.filter((i) => daysUntil(i.expiryDate) < 0).length;
    const fresh = total - expiringSoon - expired;
    const lowStock = items.filter((i) => (i.quantity || 0) <= 5).length;
    const totalValue = items.reduce((s, i) => s + (parseFloat(i.price) || 0), 0);
    const categories = [...new Set(items.map((i) => i.category || "Uncategorized"))];
    return { total, fresh, expiringSoon, expired, lowStock, totalValue, categories };
  }, [items]);

  // ---------- Category breakdown ----------
  const categoryData = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, pct: ((value / items.length) * 100).toFixed(1) }));
  }, [items]);

  // ---------- Expiry distribution ----------
  const expiryDistribution = useMemo(() => {
    const buckets = [
      { label: "Expired", count: 0 },
      { label: "0-3 days", count: 0 },
      { label: "4-7 days", count: 0 },
      { label: "8-14 days", count: 0 },
      { label: "15-30 days", count: 0 },
      { label: "30+ days", count: 0 },
    ];
    items.forEach((i) => {
      const d = daysUntil(i.expiryDate);
      if (d < 0) buckets[0].count++;
      else if (d <= 3) buckets[1].count++;
      else if (d <= 7) buckets[2].count++;
      else if (d <= 14) buckets[3].count++;
      else if (d <= 30) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  }, [items]);

  // ---------- Low stock items ----------
  const lowStockItems = useMemo(() => {
    return items.filter((i) => (i.quantity || 0) <= 5).sort((a, b) => (a.quantity || 0) - (b.quantity || 0));
  }, [items]);

  // ---------- Export CSV ----------
  const exportCSV = () => {
    const headers = ["Name", "Category", "Quantity", "Price", "Expiry Date", "Status"];
    const rows = items.map((i) => {
      const d = daysUntil(i.expiryDate);
      let status = "Fresh";
      if (d < 0) status = "Expired";
      else if (d <= 3) status = "Expiring Soon";
      return [i.name, i.category || "Uncategorized", i.quantity || 0, i.price || 0, new Date(i.expiryDate).toLocaleDateString(), status];
    });
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Print ----------
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#0a1a2f]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-[#0a1a2f]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Inventory summary and insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition hover:opacity-80 bg-[#4a9fdb] text-white flex-1 sm:flex-none justify-center"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition hover:opacity-80 bg-[#1c3a5e] text-gray-100 flex-1 sm:flex-none justify-center"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 p-4 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-100">Date Range:</span>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="px-3 py-1 rounded text-xs sm:text-sm bg-[#0a1a2f] text-gray-100 border border-[#1c3a5e] focus:border-[#4a9fdb] outline-none transition flex-1 sm:flex-none min-w-[120px]"
        />
        <span className="text-xs sm:text-sm text-gray-400">to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="px-3 py-1 rounded text-xs sm:text-sm bg-[#0a1a2f] text-gray-100 border border-[#1c3a5e] focus:border-[#4a9fdb] outline-none transition flex-1 sm:flex-none min-w-[120px]"
        />
        <span className="text-xs sm:text-sm text-gray-400 w-full sm:w-auto text-center sm:text-left">
          ({items.length} items in this period)
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total Items" value={stats.total} color="text-gray-100" />
        <StatCard label="Fresh" value={stats.fresh} color="text-[#3ecf8e]" />
        <StatCard label="Expiring Soon" value={stats.expiringSoon} color="text-[#f0a63a]" />
        <StatCard label="Expired" value={stats.expired} color="text-[#c23e8f]" />
        <StatCard label="Low Stock" value={stats.lowStock} color="text-[#f0a63a]" />
        <StatCard label="Total Value" value={`$${stats.totalValue.toFixed(0)}`} color="text-[#4a9fdb]" />
      </div>

      {/* Category Breakdown & Expiry Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
          <h3 className="text-sm font-medium mb-4 text-gray-100">Category Breakdown</h3>
          {categoryData.length === 0 ? (
            <p className="text-center text-gray-400">No categories</p>
          ) : (
            <div className="space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex flex-wrap justify-between text-xs sm:text-sm mb-1 gap-1">
                    <span className="text-gray-100 truncate max-w-[150px]">{cat.name}</span>
                    <span className="text-gray-400">{cat.value} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0a1a2f]">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${cat.pct}%`,
                        background: `linear-gradient(90deg, #4a9fdb, #3ecf8e)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Distribution */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
          <h3 className="text-sm font-medium mb-4 text-gray-100">Expiry Distribution</h3>
          {expiryDistribution.every(b => b.count === 0) ? (
            <p className="text-center text-gray-400">No items</p>
          ) : (
            <div className="space-y-2">
              {expiryDistribution.map((bucket, idx) => {
                const max = Math.max(1, ...expiryDistribution.map(b => b.count));
                const pct = (bucket.count / max) * 100;
                const colors = ["#c23e8f", "#f0a63a", "#f0a63a", "#4a9fdb", "#4a9fdb", "#3ecf8e"];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-100">{bucket.label}</span>
                      <span className="text-gray-400">{bucket.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0a1a2f]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: colors[idx % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="mb-6 p-4 sm:p-5 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
        <h3 className="text-sm font-medium mb-4 text-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#f0a63a]" />
          Low Stock Items (≤ 5 units)
        </h3>
        {lowStockItems.length === 0 ? (
          <p className="text-sm text-[#3ecf8e] flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> All items are well stocked!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#1c3a5e]">
                  {["Name", "Category", "Quantity", "Price", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-2 sm:px-3 text-[10px] font-medium uppercase text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const d = daysUntil(item.expiryDate);
                  let status = "Fresh";
                  let statusColor = "#3ecf8e";
                  if (d < 0) { status = "Expired"; statusColor = "#c23e8f"; }
                  else if (d <= 3) { status = "Expiring Soon"; statusColor = "#f0a63a"; }
                  return (
                    <tr key={item._id} className="border-b border-[#0a1a2f]">
                      <td className="py-2 px-2 sm:px-3 text-gray-100 truncate max-w-[80px] sm:max-w-[150px]">{item.name}</td>
                      <td className="py-2 px-2 sm:px-3 text-gray-400 truncate max-w-[60px] sm:max-w-[100px]">{item.category || "Uncategorized"}</td>
                      <td className="py-2 px-2 sm:px-3 text-[#f0a63a]">{item.quantity || 0}</td>
                      <td className="py-2 px-2 sm:px-3 text-gray-400">${item.price || 0}</td>
                      <td className="py-2 px-2 sm:px-3">
                        <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <span className="text-[10px] sm:text-xs text-gray-400">
          Generated on {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ label, value, color }) => (
  <div className="p-3 sm:p-4 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{label}</p>
    <p className={`text-base sm:text-lg lg:text-xl font-bold truncate ${color}`}>{value}</p>
  </div>
);

export default Reports;