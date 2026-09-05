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
            📊 Reports
          </h1>
          <p className="text-sm" style={{ color: COLORS.sub }}>
            Inventory summary and insights
          </p>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition hover:opacity-80"
            style={{ background: COLORS.active, color: "#fff" }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition hover:opacity-80"
            style={{ background: COLORS.panelBorder, color: COLORS.text }}
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
        <Calendar className="w-5 h-5" style={{ color: COLORS.sub }} />
        <span className="text-sm" style={{ color: COLORS.text }}>Date Range:</span>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="px-3 py-1 rounded text-sm"
          style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.panelBorder}` }}
        />
        <span className="text-sm" style={{ color: COLORS.sub }}>to</span>
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="px-3 py-1 rounded text-sm"
          style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.panelBorder}` }}
        />
        <span className="text-sm" style={{ color: COLORS.sub }}>
          ({items.length} items in this period)
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Total Items</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Fresh</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.success }}>{stats.fresh}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Expiring Soon</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.warning }}>{stats.expiringSoon}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Expired</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.danger }}>{stats.expired}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Low Stock</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.warning }}>{stats.lowStock}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <p className="text-xs" style={{ color: COLORS.sub }}>Total Value</p>
          <p className="text-2xl font-bold" style={{ color: COLORS.active }}>${stats.totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>Category Breakdown</h3>
          {categoryData.length === 0 ? (
            <p className="text-center" style={{ color: COLORS.sub }}>No categories</p>
          ) : (
            <div className="space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: COLORS.text }}>{cat.name}</span>
                    <span style={{ color: COLORS.sub }}>{cat.value} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: COLORS.bg }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${cat.pct}%`,
                        background: `linear-gradient(90deg, ${COLORS.active}, ${COLORS.success})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Distribution */}
        <div className="p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
          <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>Expiry Distribution</h3>
          {expiryDistribution.every(b => b.count === 0) ? (
            <p className="text-center" style={{ color: COLORS.sub }}>No items</p>
          ) : (
            <div className="space-y-2">
              {expiryDistribution.map((bucket, idx) => {
                const max = Math.max(1, ...expiryDistribution.map(b => b.count));
                const pct = (bucket.count / max) * 100;
                const colors = ["#c23e8f", "#f0a63a", "#f0a63a", "#4a9fdb", "#4a9fdb", "#3ecf8e"];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: COLORS.text }}>{bucket.label}</span>
                      <span style={{ color: COLORS.sub }}>{bucket.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ background: COLORS.bg }}>
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
      <div className="mb-6 p-5 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
        <h3 className="text-sm font-medium mb-4" style={{ color: COLORS.text }}>
          ⚠️ Low Stock Items (≤ 5 units)
        </h3>
        {lowStockItems.length === 0 ? (
          <p className="text-sm" style={{ color: COLORS.success }}>✅ All items are well stocked!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
                  <th className="text-left py-2 px-3" style={{ color: COLORS.sub }}>Name</th>
                  <th className="text-left py-2 px-3" style={{ color: COLORS.sub }}>Category</th>
                  <th className="text-left py-2 px-3" style={{ color: COLORS.sub }}>Quantity</th>
                  <th className="text-left py-2 px-3" style={{ color: COLORS.sub }}>Price</th>
                  <th className="text-left py-2 px-3" style={{ color: COLORS.sub }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => {
                  const d = daysUntil(item.expiryDate);
                  let status = "Fresh";
                  let statusColor = COLORS.success;
                  if (d < 0) { status = "Expired"; statusColor = COLORS.danger; }
                  else if (d <= 3) { status = "Expiring Soon"; statusColor = COLORS.warning; }
                  return (
                    <tr key={item._id} style={{ borderBottom: `1px solid ${COLORS.bg}` }}>
                      <td className="py-2 px-3" style={{ color: COLORS.text }}>{item.name}</td>
                      <td className="py-2 px-3" style={{ color: COLORS.sub }}>{item.category || "Uncategorized"}</td>
                      <td className="py-2 px-3" style={{ color: COLORS.warning }}>{item.quantity || 0}</td>
                      <td className="py-2 px-3" style={{ color: COLORS.sub }}>${item.price || 0}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${statusColor}20`, color: statusColor }}>
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

      {/* Export Footer */}
      <div className="flex justify-end">
        <span className="text-xs" style={{ color: COLORS.sub }}>
          Generated on {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default Reports;