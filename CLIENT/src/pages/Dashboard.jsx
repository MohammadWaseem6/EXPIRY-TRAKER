/* eslint-disable no-unused-vars */

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  Package,
  AlertTriangle,
  LayoutDashboard,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Copy,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import AIChatbot from "./AIChatbot";

// Import all dashboard components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsCards from "../components/dashboard/StatsCards";
import Panel from "../components/dashboard/Panel";
import Eyebrow from "../components/dashboard/Eyebrow";
import TrendChart from "../components/dashboard/TrendChart";
import StatusDonut from "../components/dashboard/StatusDonut";
import CategoryDonut from "../components/dashboard/CategoryDonut";
import Leaderboard from "../components/dashboard/Leaderboard";
import StockHealth from "../components/dashboard/StockHealth";
import ValueCard from "../components/dashboard/ValueCard";
import ExpiredView from "./ExpiredView";

// Import your actual Settings component
import SettingsView from "./SettingsView"; // MAKE SURE THIS PATH IS CORRECT

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

  // ---------- fetch items ----------
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

  // ---------- stats ----------
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

  // ---------- trend (Exact Date Based: 14 days back, today, 14 days forward) ----------
  const trend = useMemo(() => {
    const today = new Date();
    const days = [];
    
    for (let i = -14; i <= 14; i++) {
      const target = new Date(today);
      target.setDate(today.getDate() + i);
      
      const label = target.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const count = items.filter((i) => {
        const d = new Date(i.expiryDate);
        return d.toDateString() === target.toDateString();
      }).length;

      days.push({ label, count });
    }
    
    const max = Math.max(1, ...days.map((d) => d.count));
    return { days, max };
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

  // ---------- status donut ----------
  const statusDonut = useMemo(() => {
    const total = stats.totalItems || 1;
    return [
      {
        name: "Fresh",
        value: stats.fresh,
        pct: (stats.fresh / total) * 100,
        color: "#3ecf8e",
      },
      {
        name: "Low Stock",
        value: stats.lowStock,
        pct: (stats.lowStock / total) * 100,
        color: "#f0a63a",
      },
      {
        name: "Expiring Soon",
        value: stats.expiringSoon,
        pct: (stats.expiringSoon / total) * 100,
        color: "#4a9fdb",
      },
      {
        name: "Expired",
        value: stats.expired,
        pct: (stats.expired / total) * 100,
        color: "#c23e8f",
      },
    ];
  }, [stats]);

  // ---------- category donut ----------
  const categoryDonut = useMemo(() => {
    const counts = {};
    items.forEach((i) => {
      const c = i.category || "Uncategorized";
      counts[c] = (counts[c] || 0) + 1;
    });
    const total = items.length || 1;
    const colors = [
      "#4a9fdb",
      "#7fc4ea",
      "#3ecf8e",
      "#c9d84a",
      "#f0a63a",
      "#c23e8f",
    ];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], idx) => ({
        name,
        value,
        pct: (value / total) * 100,
        color: colors[idx % colors.length],
      }));
  }, [items]);

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
      const response = await fetch(
        `http://127.0.0.1:5001/api/ai/extract-items`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
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

  // ---------- sidebar ----------
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stock", label: "Stock", icon: Package },
    { id: "expired", label: "Expired", icon: AlertTriangle },
    { id: "bulk", label: "Bulk Add", icon: Copy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-custom-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-custom-bg">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} flex flex-col transition-all duration-300 flex-shrink-0 border-r bg-custom-panel border-custom-border`}
      >
        <div className="flex items-center justify-between p-4 border-b border-custom-border">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            {sidebarOpen && (
              <span className="text-lg font-bold text-custom-text">
                Store
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-custom-sub" />
            ) : (
              <Menu className="w-5 h-5 text-custom-sub" />
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
                  : "hover:bg-white/5 text-custom-sub"
              } ${!sidebarOpen && "justify-center"}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
          <RouterLink
            to="/reports"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm w-full hover:bg-white/5 text-custom-sub ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Reports</span>}
          </RouterLink>
          <RouterLink
            to="/charts"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm w-full hover:bg-white/5 text-custom-sub ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <BarChart3 className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Charts</span>}
          </RouterLink>
        </nav>

        <div className="p-4 border-t border-custom-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm w-full hover:bg-white/5 text-custom-sub"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-custom-bg">
        {activeTab === "dashboard" && (
          <>
            <DashboardHeader
              title="Store Dashboard"
              subtitle="Live stock overview"
            />
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <Panel>
                <Eyebrow right="29-day timeline">EXPIRY TIMELINE</Eyebrow>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold text-custom-text">
                    {trend.days.reduce((s, d) => s + d.count, 0)}
                  </span>
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-[rgba(194,62,143,0.15)] text-[#e05fae]">
                    {stats.expiringSoon} due in 3 days
                  </span>
                </div>
                <TrendChart data={trend.days} max={trend.max} />
              </Panel>

              <Panel>
                <Eyebrow right="All stock">STOCK STATUS</Eyebrow>
                <StatusDonut data={statusDonut} />
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <ValueCard
                title="TOTAL VALUE"
                value={`$${stats.totalValue.toFixed(0)}`}
                icon={Package}
                subtext={`${stats.totalItems} products`}
              />
              <Panel>
                <Eyebrow right="By category">STOCK MIX</Eyebrow>
                <CategoryDonut
                  data={categoryDonut}
                  totalCategories={stats.categories.length}
                />
              </Panel>
              <Panel>
                <Eyebrow right="Soonest expiring">EXPIRY LEADERBOARD</Eyebrow>
                <Leaderboard data={leaderboard} />
              </Panel>
            </div>

            <Panel>
              <StockHealth percentage={stats.stockHealth} />
            </Panel>
          </>
        )}

        {activeTab === "stock" && (
          <div>
            <h1 className="text-2xl font-bold text-custom-text">
              📦 Stock Overview
            </h1>
            <p className="text-sm mt-2 text-custom-sub">
              All inventory items with quantity and status
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl p-4 bg-custom-panel border border-custom-border"
                >
                  <h3 className="font-semibold text-custom-text">
                    {item.name}
                  </h3>
                  <p className="text-sm text-custom-sub">
                    {item.category}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-custom-sub">
                      Qty: {item.quantity || 0}
                    </span>
                    <span className="text-sm text-custom-sub">
                      ${item.price || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "expired" && <ExpiredView items={items} />}

        {activeTab === "bulk" && (
          <div>
            <h1 className="text-2xl font-bold text-custom-text">
              📋 Bulk Add Items
            </h1>
            <p className="text-sm mt-2 text-custom-sub">
              Paste items manually or upload a delivery note image to
              auto-extract items.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-custom-panel border border-custom-border">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition bg-custom-active text-white">
                  📤 Upload Delivery Note
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAIUpload}
                  />
                </label>
                {aiLoading && (
                  <span className="text-sm text-custom-sub">
                    ⏳ Extracting items...
                  </span>
                )}
                {aiError && (
                  <span className="text-sm text-[#c23e8f]">
                    {aiError}
                  </span>
                )}
              </div>
              {aiItems.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-custom-text">
                      ✅ {aiItems.length} items extracted
                    </span>
                    <button
                      onClick={() => {
                        const csv = aiItems
                          .map(
                            (i) =>
                              `${i.name}, ${i.category}, ${i.expiryDate}, ${i.quantity}, ${i.price}`,
                          )
                          .join("\n");
                        setBulkItems(csv);
                        setAiItems([]);
                      }}
                      className="px-3 py-1 text-xs rounded-lg transition bg-custom-active text-white"
                    >
                      Copy to Bulk Add →
                    </button>
                  </div>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {aiItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs py-1 border-b border-custom-border text-custom-sub"
                      >
                        {item.name} — {item.category} — {item.expiryDate} — Qty:{" "}
                        {item.quantity} — ${item.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-custom-panel border border-custom-border">
              <textarea
                rows="10"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                placeholder="Milk, Dairy, 2026-09-15, 10, 4.99&#10;Bread, Bakery, 2026-08-30, 5, 2.49"
                className="w-full p-3 rounded-lg text-sm font-mono bg-custom-bg text-custom-text border border-custom-border outline-none"
              />
              <button
                onClick={handleBulkAdd}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add All Items
              </button>
              {bulkMessage && (
                <p className="mt-3 text-sm text-[#3ecf8e]">
                  {bulkMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* === SETTINGS TAB FIXED === */}
        {activeTab === "settings" && (
          <SettingsView />
        )}
      </main>

      <AIChatbot
        onItemsExtracted={(items) => console.log("Items extracted:", items)}
      />
    </div>
  );
};

export default Dashboard;