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
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import AIChatbot from "./AIChatbot";

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
import SettingsView from "./SettingsView";

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

  const buckets = ["Expired", "0-3d", "4-7d", "8-14d", "15d+"];
  // eslint-disable-next-line no-unused-vars
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

  const expiredItems = useMemo(() => {
    return items
      .filter((i) => daysUntil(i.expiryDate) < 0)
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [items]);

  const handleRelease = async (itemId) => {
    if (!itemId) return;

    if (
      window.confirm(
        "Release this item? It will be permanently removed from inventory.",
      )
    ) {
      try {
        const response = await apiClient.releaseItem(token, itemId);
        if (response.message) {
          setItems((prevItems) =>
            prevItems.filter((item) => item._id !== itemId),
          );
          setBulkMessage("Item released and removed from inventory!");
          setTimeout(() => setBulkMessage(""), 3000);
        } else {
          setBulkMessage(response.error || "Failed to release item");
        }
      } catch (error) {
        setBulkMessage("Something went wrong");
      }
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkItems.trim()) {
      setBulkMessage(
        "Please paste items in the format: Name, Category, ExpiryDate, Quantity, Price",
      );
      setTimeout(() => setBulkMessage(""), 3000);
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

    // Dedupe only WITHIN this paste batch — combine quantities for exact duplicates.
    // No lookup against existing DB items, so nothing merges into old records.
    const batchMap = new Map();
    for (const newItem of parsedItems) {
      const key = `${newItem.name}|${newItem.category}|${newItem.expiryDate}|${newItem.price}`;
      if (batchMap.has(key)) {
        batchMap.get(key).quantity += newItem.quantity;
      } else {
        batchMap.set(key, { ...newItem });
      }
    }
    const itemsToCreate = Array.from(batchMap.values());

    let success = 0;
    let failed = 0;

    for (const item of itemsToCreate) {
      try {
        await apiClient.createItem(token, item);
        success++;
      } catch (err) {
        failed++;
        console.error("Failed to create item:", err);
      }
    }

    const updatedItems = await apiClient.getItems(token);
    if (Array.isArray(updatedItems)) {
      setItems(updatedItems);
    }

    const duplicatesInBatch = parsedItems.length - itemsToCreate.length;
    let msg = "";
    if (success > 0 && failed === 0) {
      msg = ` ${success} items created successfully!${
        duplicatesInBatch > 0
          ? ` (${duplicatesInBatch} duplicate rows merged within this batch)`
          : ""
      }`;
    } else if (success > 0 && failed > 0) {
      msg = ` ${success} items created, ${failed} failed.`;
    } else {
      msg = ` Failed to add items. Please check the format.`;
    }

    setBulkMessage(msg);
    setBulkItems("");
    setTimeout(() => setBulkMessage(""), 5000);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "stock", label: "Stock", icon: Package },
    { id: "expired", label: "Expired", icon: AlertTriangle },
    { id: "bulk", label: "Bulk Add", icon: Copy },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-screen bg-[#0a1a2f]">
        <div className="relative w-10 h-10">
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
    <div className="flex min-h-screen bg-[#0a1a2f] text-[#e8eef7]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-70" : "w-[90px]"
        } flex flex-col flex-shrink-0 transition-[width] duration-300 bg-[#0c2038]/95 border-r border-[#16304f] overflow-hidden`}
      >
        <div className="flex items-center h-16 px-4 border-b border-[#16304f] flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4a9fdb] to-[#2f6fa8] shrink-0">
              <Package className="w-4.5 h-4.5 text-white" strokeWidth={2.25} />
            </div>
            {sidebarOpen && (
              <span className="text-[15px] font-semibold tracking-tight truncate whitespace-nowrap">
                Store
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-[#5b7699] hover:text-[#c9d8ec] hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#4a9fdb]/10 text-[#4892ba]"
                    : "text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04]"
                } ${!sidebarOpen && "justify-center"}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#4a9fdb]" />
                )}
                <item.icon
                  className="w-[18px] h-[18px] flex-shrink-0"
                  strokeWidth={isActive ? 2.25 : 1.9}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-[#16304f]/80 space-y-0.5">
            <RouterLink
              to="/stock"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04] transition-colors ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <Package
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.9}
              />
              {sidebarOpen && <span>Stock</span>}
            </RouterLink>
            <RouterLink
              to="/reports"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04] transition-colors ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <FileSpreadsheet
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.9}
              />
              {sidebarOpen && <span>Reports</span>}
            </RouterLink>
            <RouterLink
              to="/charts"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04] transition-colors ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <BarChart3
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.9}
              />
              {sidebarOpen && <span>Charts</span>}
            </RouterLink>
          </div>
        </nav>

        <div className="p-2.5 border-t border-[#16304f]">
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#e0708f] hover:bg-[#c23e8f]/10 transition-colors ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut
              className="w-[18px] h-[18px] flex-shrink-0"
              strokeWidth={1.9}
            />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-[radial-gradient(ellipse_at_top,rgba(74,159,219,0.06),transparent_55%)]">
        {activeTab === "dashboard" && (
          <div className="space-y-5 max-w-[1400px]">
            <DashboardHeader
              title="Store Dashboard"
              subtitle="Live stock overview"
            />
            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Panel>
                <Eyebrow right="29-day timeline">EXPIRY TIMELINE</Eyebrow>
                <div className="flex items-end gap-2.5 mb-3">
                  <span className="text-4xl font-bold tracking-tight text-[#e8eef7]">
                    {trend.days.reduce((s, d) => s + d.count, 0)}
                  </span>
                  <span className="mb-1 text-xs px-2 py-1 rounded-md bg-[#c23e8f]/12 text-[#e05fae] font-medium">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
          </div>
        )}

        {activeTab === "stock" && (
          <div className="max-w-[1400px]">
            <div className="flex justify-between items-end mb-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#e8eef7]">
                  Stock Overview
                </h1>
                <p className="text-sm mt-1 text-[#7f97b8]">
                  {items.length} items in inventory
                </p>
              </div>
              <button
                onClick={() => {
                  apiClient.getItems(token).then((data) => {
                    if (Array.isArray(data)) setItems(data);
                  });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-[#3ecf8e]/12 text-[#3ecf8e] hover:bg-[#3ecf8e]/18 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-1"
              style={{ maxHeight: "620px", overflowY: "auto" }}
            >
              {items.map((item) => {
                const days = daysUntil(item.expiryDate);
                let accent = "#3ecf8e";
                let statusText = "Fresh";
                let chipClasses = "bg-[#3ecf8e]/12 text-[#3ecf8e]";
                if (days < 0) {
                  accent = "#c23e8f";
                  statusText = "Expired";
                  chipClasses = "bg-[#c23e8f]/12 text-[#e05fae]";
                } else if (days <= 3) {
                  accent = "#f0a63a";
                  statusText = "Soon";
                  chipClasses = "bg-[#f0a63a]/12 text-[#f0a63a]";
                }

                return (
                  <div
                    key={item._id}
                    className="rounded-xl p-4 bg-[#0f2540] border border-[#1c3a5e] hover:border-[#2c5581] transition-colors duration-150"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-[#e8eef7] truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs mt-0.5 text-[#7f97b8]">
                          {item.category || "Uncategorized"}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md ${chipClasses}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1c3a5e]/60 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#5b7699]">Qty</span>
                        <span className="text-[#e8eef7] font-medium">
                          {item.quantity || 0}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-[#5b7699]">
                          Price
                        </span>
                        <span className="text-[#e8eef7] font-medium">
                          ${item.price || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-[#5b7699]">
                          {days < 0 ? "Overdue" : "Left"}
                        </span>
                        <span className="font-medium" style={{ color: accent }}>
                          {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleRelease(item._id)}
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-[#3ecf8e]/12 text-[#3ecf8e] border border-[#3ecf8e]/25 hover:bg-[#3ecf8e]/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Release
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="rounded-xl p-14 text-center bg-[#0f2540] border border-dashed border-[#1c3a5e]">
                <Package
                  className="w-10 h-10 mx-auto text-[#3a5578]"
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-sm text-[#7f97b8]">
                  No items in inventory
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "expired" && (
          <ExpiredView items={items} onRelease={handleRelease} />
        )}

        {activeTab === "bulk" && (
          <div className="max-w-[900px]">
            <h1 className="text-2xl font-bold tracking-tight text-[#e8eef7]">
              Bulk Add Items
            </h1>
            <p className="text-sm mt-1.5 text-[#7f97b8]">
              Paste items manually in the format: Name, Category, ExpiryDate,
              Quantity, Price
            </p>

            <div className="mt-5 p-5 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
              <textarea
                rows="10"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                placeholder="Milk, Dairy, 2026-09-15, 10, 4.99\nBread, Bakery, 2026-08-30, 5, 2.49"
                className="w-full p-3.5 rounded-lg text-sm font-mono leading-relaxed bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] outline-none focus:border-[#4a9fdb] transition-colors resize-y"
              />
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleBulkAdd}
                  className="px-6 py-2.5 text-sm font-medium bg-[#4a9fdb] text-white rounded-lg hover:bg-[#3d8ec8] transition-colors"
                >
                  Add All Items
                </button>
                {bulkMessage && (
                  <p className="text-sm text-[#3ecf8e]">{bulkMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && <SettingsView />}
      </main>

      <AIChatbot
        onItemsExtracted={(items) => console.log("Items extracted:", items)}
      />
    </div>
  );
};

export default Dashboard;
