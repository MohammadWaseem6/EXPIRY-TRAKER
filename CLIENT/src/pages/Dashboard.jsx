/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/static-components */
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  LayoutDashboard,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Calendar,
  List,
  Copy,
} from "lucide-react";
import AIChatbot from "./AIChatbot";

// ---------- palette (dark theme) ----------
const COLORS = {
  bg: "#0a1a2f",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  grid: "#1c3a5e",
};
const SCALE = [
  "#bfe8f5",
  "#7fc4ea",
  "#4a9fdb",
  "#3d6fc9",
  "#7b4fb0",
  "#c23e8f",
];
const DONUT_COLORS = [
  "#4a9fdb",
  "#7fc4ea",
  "#3ecf8e",
  "#c9d84a",
  "#f0a63a",
  "#c23e8f",
  "#7b4fb0",
];

const daysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bulkItems, setBulkItems] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiItems, setAiItems] = useState([]);
  const [aiError, setAiError] = useState("");

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

  // ---------- derived stats ----------
  const stats = useMemo(() => {
    const totalItems = items.length;
    const expiringSoon = items.filter((i) => {
      const d = daysUntil(i.expiryDate);
      return d >= 0 && d <= 3;
    }).length;
    const expired = items.filter((i) => daysUntil(i.expiryDate) < 0).length;
    const fresh = totalItems - expiringSoon - expired;
    const totalValue = items.reduce(
      (s, i) => s + (parseFloat(i.price) || 0),
      0,
    );
    const lowStock = items.filter((i) => (i.quantity || 0) <= 5).length;
    const categories = [
      ...new Set(items.map((i) => i.category || "Uncategorized")),
    ];
    const stockHealth =
      totalItems > 0 ? Math.round((fresh / totalItems) * 100) : 0;
    return {
      totalItems,
      expiringSoon,
      expired,
      fresh,
      totalValue,
      lowStock,
      categories,
      stockHealth,
    };
  }, [items]);

  // ---------- 8-day expiry trend ----------
  const trend = useMemo(() => {
    const days = [...Array(8)].map((_, idx) => {
      const target = new Date();
      target.setDate(target.getDate() + idx);
      const label = target.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const count = items.filter((i) => {
        const d = new Date(i.expiryDate);
        return d.toDateString() === target.toDateString();
      }).length;
      return { label, count };
    });
    return days;
  }, [items]);

  // ---------- heatmap ----------
  const buckets = ["Expired", "0-3d", "4-7d", "8-14d", "15d+"];
  const heatmap = useMemo(() => {
    const cats = stats.categories.slice(0, 6);
    const bucketOf = (d) => {
      if (d < 0) return 0;
      if (d <= 3) return 1;
      if (d <= 7) return 2;
      if (d <= 14) return 3;
      return 4;
    };
    const grid = cats.map((cat) => {
      const row = buckets.map(() => 0);
      items
        .filter((i) => (i.category || "Uncategorized") === cat)
        .forEach((i) => {
          row[bucketOf(daysUntil(i.expiryDate))] += 1;
        });
      return { cat, row };
    });
    const max = Math.max(1, ...grid.flatMap((g) => g.row));
    return { grid, max };
  }, [items, stats.categories]);

  // ---------- category donut ----------
  const categoryDonut = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + 1;
    });
    const total = items.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], idx) => ({
        name,
        value,
        pct: (value / total) * 100,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
      }));
  }, [items]);

  // ---------- status donut ----------
  const statusDonut = useMemo(() => {
    const total = stats.totalItems || 1;
    return [
      { name: "Fresh", value: stats.fresh, color: "#3ecf8e" },
      { name: "Low Stock", value: stats.lowStock, color: "#f0a63a" },
      { name: "Expiring Soon", value: stats.expiringSoon, color: "#4a9fdb" },
      { name: "Expired", value: stats.expired, color: "#c23e8f" },
    ].map((s) => ({ ...s, pct: (s.value / total) * 100 }));
  }, [stats]);

  // ---------- leaderboard ----------
  const leaderboard = useMemo(() => {
    return [...items]
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 5)
      .map((i) => ({
        name: i.name || "Unnamed item",
        category: i.category || "Uncategorized",
        qty: i.quantity ?? "-",
        daysLeft: daysUntil(i.expiryDate),
      }));
  }, [items]);

  // ---------- expired items ----------
  const expiredItems = useMemo(() => {
    return items
      .filter((i) => daysUntil(i.expiryDate) < 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [items]);

  // ---------- bulk add handler ----------
  const handleBulkAdd = async () => {
    if (!bulkItems.trim()) {
      setBulkMessage(
        "Please paste items in the format: Name, Category, ExpiryDate, Quantity, Price",
      );
      return;
    }
    const lines = bulkItems.split("\n").filter((line) => line.trim());
    const parsedItems = lines.map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      return {
        name: parts[0] || "Unnamed",
        category: parts[1] || "Uncategorized",
        expiryDate: parts[2] || new Date().toISOString().split("T")[0],
        quantity: parseInt(parts[3]) || 1,
        price: parseFloat(parts[4]) || 0,
      };
    });
    let success = 0;
    for (const item of parsedItems) {
      try {
        await apiClient.createItem(token, item);
        success++;
      } catch (err) {
        console.error("Failed to add item:", item, err);
      }
    }
    setBulkMessage(` ${success} items added successfully!`);
    setBulkItems("");
    const updated = await apiClient.getItems(token);
    if (Array.isArray(updated)) setItems(updated);
    setTimeout(() => setBulkMessage(""), 4000);
  };

  // ---------- AI upload handler ----------
  const handleAIUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiLoading(true);
    setAiError("");
    setAiItems([]);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`http://127.0.0.1:5001/api/ai/extract-items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setAiItems(data.items);
      } else {
        setAiError(data.error || "Failed to extract items");
      }
    } catch (error) {
      setAiError("Upload failed. Please try again.");
    } finally {
      setAiLoading(false);
      e.target.value = "";
    }
  };

  // ---------- shared donut renderer ----------
  const Donut = ({ data, centerValue, centerLabel }) => {
    const size = 160;
    const stroke = 22;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((seg, idx) => {
            const len = (seg.pct / 100) * c;
            const circle = (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return circle;
          })}
        </g>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill={COLORS.text}
        >
          {centerValue}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          fontSize="10"
          fill={COLORS.sub}
        >
          {centerLabel}
        </text>
      </svg>
    );
  };

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

  const Eyebrow = ({ children, right }) => (
    <div className="flex items-center justify-between mb-4">
      <span
        className="text-xs font-semibold tracking-wider"
        style={{ color: COLORS.sub }}
      >
        {children}
      </span>
      {right && (
        <span className="text-xs" style={{ color: COLORS.sub }}>
          {right}
        </span>
      )}
    </div>
  );

  // ---------- sidebar nav items ----------
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stock", label: "Stock Overview", icon: Package },
    { id: "expired", label: "Expired Items", icon: AlertTriangle },
    { id: "bulk", label: "Bulk Add", icon: Copy },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "charts", label: "Charts", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ background: COLORS.bg }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: COLORS.bg }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } flex flex-col transition-all duration-300 flex-shrink-0 border-r`}
        style={{ background: COLORS.panel, borderColor: COLORS.panelBorder }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: COLORS.panelBorder }}
        >
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            {sidebarOpen && (
              <span
                className="text-lg font-bold"
                style={{ color: COLORS.text }}
              >
                Store
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" style={{ color: COLORS.sub }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: COLORS.sub }} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm w-full ${
                activeTab === item.id
                  ? "bg-blue-600/20 text-blue-400"
                  : "hover:bg-white/5"
              } ${!sidebarOpen && "justify-center"}`}
              style={{
                color: activeTab === item.id ? COLORS.active : COLORS.sub,
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div
          className="p-4 border-t"
          style={{ borderColor: COLORS.panelBorder }}
        >
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm w-full hover:bg-white/5"
            style={{ color: COLORS.sub }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main
        className="flex-1 overflow-y-auto p-4 md:p-6"
        style={{ background: COLORS.bg }}
      >
        {activeTab === "dashboard" && (
          // ===== DASHBOARD VIEW =====
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: COLORS.text }}
                >
                  Store Dashboard
                </h1>
                <p className="text-sm" style={{ color: COLORS.sub }}>
                  Live stock overview
                </p>
              </div>
              <div className="flex gap-3 mt-3 md:mt-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm"
                  style={{ background: COLORS.panelBorder, color: COLORS.text }}
                >
                  <Download className="w-4 h-4" /> Report
                </button>
              </div>
            </div>

            {/* Top row: trend / heatmap / status donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <Panel>
                <Eyebrow right="Next 8 days">EXPIRING THIS WEEK</Eyebrow>
                <div className="flex items-end gap-2 mb-2">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: COLORS.text }}
                  >
                    {trend.reduce((s, d) => s + d.count, 0)}
                  </span>
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded"
                    style={{
                      background: "rgba(194,62,143,0.15)",
                      color: "#e05fae",
                    }}
                  >
                    {stats.expiringSoon} due in 3 days
                  </span>
                </div>
                <svg viewBox="0 0 320 120" className="w-full h-28 mt-2">
                  {(() => {
                    const max = Math.max(1, ...trend.map((d) => d.count));
                    const pts = trend.map((d, idx) => {
                      const x = (idx / (trend.length - 1)) * 300 + 10;
                      const y = 110 - (d.count / max) * 90;
                      return `${x},${y}`;
                    });
                    const areaPts = `10,110 ${pts.join(" ")} 310,110`;
                    return (
                      <>
                        <polygon
                          points={areaPts}
                          fill="url(#areaFill)"
                          opacity="0.3"
                        />
                        <polyline
                          points={pts.join(" ")}
                          fill="none"
                          stroke="#4a9fdb"
                          strokeWidth="2.5"
                        />
                        {trend.map((d, idx) => {
                          const x = (idx / (trend.length - 1)) * 300 + 10;
                          const y = 110 - (d.count / max) * 90;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#4a9fdb"
                            />
                          );
                        })}
                        <defs>
                          <linearGradient
                            id="areaFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#4a9fdb" />
                            <stop
                              offset="100%"
                              stopColor="#4a9fdb"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
                <div
                  className="flex justify-between text-[10px] mt-1"
                  style={{ color: COLORS.sub }}
                >
                  {trend.map((d, idx) => (
                    <span key={idx}>{d.label}</span>
                  ))}
                </div>
              </Panel>

              <Panel>
                <Eyebrow right="Category x urgency">
                  STOCK URGENCY HEATMAP
                </Eyebrow>
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `90px repeat(${buckets.length}, 1fr)`,
                    gap: "4px",
                  }}
                >
                  <div />
                  {buckets.map((b) => (
                    <div
                      key={b}
                      className="text-[10px] text-center"
                      style={{ color: COLORS.sub }}
                    >
                      {b}
                    </div>
                  ))}
                  {heatmap.grid.map(({ cat, row }) => (
                    <>
                      <div
                        key={cat}
                        className="text-[11px] flex items-center truncate"
                        style={{ color: COLORS.text }}
                      >
                        {cat}
                      </div>
                      {row.map((val, ci) => {
                        const intensity = val / heatmap.max;
                        const colorIdx = Math.min(
                          SCALE.length - 1,
                          Math.floor(intensity * (SCALE.length - 1)),
                        );
                        return (
                          <div
                            key={`${cat}-${ci}`}
                            className="rounded flex items-center justify-center text-[10px] font-semibold"
                            style={{
                              background:
                                val === 0 ? "#12294a" : SCALE[colorIdx],
                              color: intensity > 0.5 ? "#fff" : "#0a1a2f",
                              height: "28px",
                            }}
                          >
                            {val > 0 ? val : ""}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px]" style={{ color: COLORS.sub }}>
                    Low
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${SCALE.join(",")})`,
                    }}
                  />
                  <span className="text-[10px]" style={{ color: COLORS.sub }}>
                    High
                  </span>
                </div>
              </Panel>

              <Panel>
                <Eyebrow right="All stock">STOCK STATUS</Eyebrow>
                <div className="flex items-center gap-4">
                  <Donut
                    data={statusDonut}
                    centerValue={stats.totalItems}
                    centerLabel="Total"
                  />
                  <div className="flex flex-col gap-2">
                    {statusDonut.map((s) => (
                      <div
                        key={s.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span style={{ color: COLORS.text }}>{s.name}</span>
                        <span style={{ color: COLORS.sub }}>
                          {s.pct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-4">
                <Panel>
                  <Eyebrow>TOTAL VALUE</Eyebrow>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                    <span
                      className="text-3xl font-bold"
                      style={{ color: COLORS.text }}
                    >
                      ${stats.totalValue.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Package
                      className="w-3 h-3"
                      style={{ color: COLORS.sub }}
                    />
                    <span className="text-xs" style={{ color: COLORS.sub }}>
                      {stats.totalItems} products
                    </span>
                  </div>
                </Panel>

                <Panel>
                  <Eyebrow>LOW STOCK ALERTS</Eyebrow>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <span
                      className="text-3xl font-bold"
                      style={{ color: COLORS.text }}
                    >
                      {stats.lowStock}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {stats.lowStock > 0 ? (
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-green-400" />
                    )}
                    <span className="text-xs" style={{ color: COLORS.sub }}>
                      items at or below 5 units
                    </span>
                  </div>
                </Panel>
              </div>

              <Panel>
                <Eyebrow right="By category">STOCK MIX</Eyebrow>
                <div className="flex items-center gap-4">
                  <Donut
                    data={categoryDonut}
                    centerValue={stats.categories.length}
                    centerLabel="Categories"
                  />
                  <div className="flex flex-col gap-2 overflow-hidden">
                    {categoryDonut.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: c.color }}
                        />
                        <span
                          className="truncate"
                          style={{ color: COLORS.text, maxWidth: "110px" }}
                        >
                          {c.name}
                        </span>
                        <span style={{ color: COLORS.sub }}>
                          {c.pct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel>
                <Eyebrow right="Soonest expiring">EXPIRY LEADERBOARD</Eyebrow>
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid ${COLORS.panelBorder}`,
                      }}
                    >
                      <th
                        className="text-left py-2 text-[10px] font-medium uppercase"
                        style={{ color: COLORS.sub }}
                      >
                        #
                      </th>
                      <th
                        className="text-left py-2 text-[10px] font-medium uppercase"
                        style={{ color: COLORS.sub }}
                      >
                        Item
                      </th>
                      <th
                        className="text-left py-2 text-[10px] font-medium uppercase"
                        style={{ color: COLORS.sub }}
                      >
                        Qty
                      </th>
                      <th
                        className="text-left py-2 text-[10px] font-medium uppercase"
                        style={{ color: COLORS.sub }}
                      >
                        Days Left
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((row, idx) => (
                      <tr
                        key={idx}
                        style={{ borderBottom: `1px solid ${COLORS.grid}` }}
                      >
                        <td className="py-2" style={{ color: COLORS.sub }}>
                          {idx + 1}
                        </td>
                        <td
                          className="py-2 font-medium"
                          style={{ color: COLORS.text }}
                        >
                          {row.name}
                        </td>
                        <td className="py-2" style={{ color: COLORS.sub }}>
                          {row.qty}
                        </td>
                        <td className="py-2">
                          <span
                            className="text-xs font-medium flex items-center gap-1"
                            style={{
                              color:
                                row.daysLeft < 0
                                  ? "#c23e8f"
                                  : row.daysLeft <= 3
                                    ? "#f0a63a"
                                    : "#3ecf8e",
                            }}
                          >
                            {row.daysLeft < 0 ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            {row.daysLeft < 0
                              ? `${Math.abs(row.daysLeft)}d overdue`
                              : `${row.daysLeft}d`}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-xs"
                          style={{ color: COLORS.sub }}
                        >
                          No items yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Panel>
            </div>

            <Panel className="mt-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <p
                    className="text-xs uppercase tracking-wider"
                    style={{ color: COLORS.sub }}
                  >
                    Stock Health
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: COLORS.text }}
                  >
                    {stats.stockHealth}%
                  </p>
                </div>
                <div className="w-full md:w-1/2 mt-4 md:mt-0">
                  <div
                    className="flex justify-between text-xs mb-1"
                    style={{ color: COLORS.sub }}
                  >
                    <span>0%</span>
                    <span>Goal: 100%</span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full"
                    style={{ background: COLORS.grid }}
                  >
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(stats.stockHealth, 100)}%`,
                        background: "linear-gradient(90deg, #4a9fdb, #c23e8f)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}

        {activeTab === "stock" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              📦 Stock Overview
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              All inventory items with quantity and status
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl p-4"
                  style={{
                    background: COLORS.panel,
                    border: `1px solid ${COLORS.panelBorder}`,
                  }}
                >
                  <h3 className="font-semibold" style={{ color: COLORS.text }}>
                    {item.name}
                  </h3>
                  <p className="text-sm" style={{ color: COLORS.sub }}>
                    {item.category}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm" style={{ color: COLORS.sub }}>
                      Qty: {item.quantity || 0}
                    </span>
                    <span className="text-sm" style={{ color: COLORS.sub }}>
                      ${item.price || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "expired" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              ⚠️ Expired Items
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              Items past their expiry date
            </p>
            {expiredItems.length === 0 ? (
              <div
                className="mt-6 p-8 text-center rounded-xl"
                style={{
                  background: COLORS.panel,
                  border: `1px solid ${COLORS.panelBorder}`,
                }}
              >
                <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
                <p className="mt-2" style={{ color: COLORS.text }}>
                  No expired items! 🎉
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {expiredItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl p-4 flex justify-between items-center"
                    style={{
                      background: COLORS.panel,
                      border: `1px solid #c23e8f`,
                    }}
                  >
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: COLORS.text }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-sm" style={{ color: COLORS.sub }}>
                        {item.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-400">
                        Expired {Math.abs(daysUntil(item.expiryDate))} days ago
                      </p>
                      <p className="text-xs" style={{ color: COLORS.sub }}>
                        Qty: {item.quantity || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bulk" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              📋 Bulk Add Items
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              Paste items manually or upload a delivery note image to auto-extract items.
            </p>

            {/* AI Upload Section */}
            <div
              className="mt-4 p-4 rounded-xl"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <label
                  className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition"
                  style={{ background: COLORS.active, color: "#fff" }}
                >
                  📤 Upload Delivery Note
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAIUpload}
                  />
                </label>
                {aiLoading && (
                  <span className="text-sm" style={{ color: COLORS.sub }}>
                    ⏳ Extracting items...
                  </span>
                )}
                {aiError && (
                  <span className="text-sm" style={{ color: "#c23e8f" }}>
                    {aiError}
                  </span>
                )}
              </div>

              {aiItems.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                      ✅ {aiItems.length} items extracted
                    </span>
                    <button
                      onClick={() => {
                        const csv = aiItems.map(i =>
                          `${i.name}, ${i.category}, ${i.expiryDate}, ${i.quantity}, ${i.price}`
                        ).join("\n");
                        setBulkItems(csv);
                        setAiItems([]);
                      }}
                      className="px-3 py-1 text-xs rounded-lg transition"
                      style={{ background: COLORS.active, color: "#fff" }}
                    >
                      Copy to Bulk Add →
                    </button>
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {aiItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs py-1 border-b"
                        style={{ borderColor: COLORS.panelBorder, color: COLORS.sub }}
                      >
                        {item.name} — {item.category} — {item.expiryDate} — Qty: {item.quantity} — ${item.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Add Textarea */}
            <div
              className="mt-4"
              style={{
                background: COLORS.panel,
                border: `1px solid ${COLORS.panelBorder}`,
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <textarea
                rows="10"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                placeholder="Milk, Dairy, 2026-09-15, 10, 4.99&#10;Bread, Bakery, 2026-08-30, 5, 2.49&#10;Eggs, Dairy, 2026-09-01, 12, 3.99"
                className="w-full p-3 rounded-lg text-sm font-mono"
                style={{
                  background: COLORS.bg,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.panelBorder}`,
                  outline: "none",
                }}
              />
              <button
                onClick={handleBulkAdd}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add All Items
              </button>
              {bulkMessage && (
                <p className="mt-3 text-sm" style={{ color: "#3ecf8e" }}>
                  {bulkMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              📊 Reports
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              Coming soon...
            </p>
          </div>
        )}

        {activeTab === "charts" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              📈 Charts
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              Coming soon...
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.text }}>
              ⚙️ Settings
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.sub }}>
              Coming soon...
            </p>
          </div>
        )}
      </main>
       <AIChatbot onItemsExtracted={(items) => {
          console.log("Items extracted:", items);
        }} />
    </div>
  );
};

export default Dashboard;