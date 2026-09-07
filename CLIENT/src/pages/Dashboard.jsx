import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../Api/apiClient";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bulkItems, setBulkItems] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const applyState = (matches) => {
      setIsDesktop(matches);
      setSidebarOpen(matches);
    };
    applyState(mq.matches);
    const handler = (e) => applyState(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
      "#7b4fb0",
      "#f06a6a",
      "#6ab0f0",
      "#6af0a8",
      "#f0d06a",
      "#d06af0",
      "#f0a0d0",
      "#a0d0f0",
      "#d0f0a0",
      "#f0d0a0",
      "#a0f0d0",
      "#d0a0f0",
      "#f0a0a0",
      "#a0a0f0",
    ];

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    let result;
    if (sorted.length > 10) {
      const top = sorted.slice(0, 9);
      const others = sorted.slice(9);
      const othersCount = others.reduce((sum, [, count]) => sum + count, 0);
      top.push(["Others", othersCount]);
      result = top;
    } else {
      result = sorted;
    }

    return result.map(([name, value], idx) => ({
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
      msg = `${success} items created successfully!${duplicatesInBatch > 0 ? ` (${duplicatesInBatch} duplicate rows merged)` : ""}`;
    } else if (success > 0 && failed > 0) {
      msg = `${success} items created, ${failed} failed.`;
    } else {
      msg = "Failed to add items. Please check the format.";
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

  const showLabels = isDesktop || sidebarOpen;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-screen bg-[#0a1a2f]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#1c3a5e]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4a9fdb] animate-spin" />
        </div>
        <span className="text-xs tracking-wide text-[#5b7699]">
          Loading inventory...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1a2f] text-[#e8eef7]">
      {/* Mobile Overlay */}
      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 flex flex-col flex-shrink-0 transition-transform duration-300 bg-[#0c2038] border-r border-[#16304f] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-[#16304f] flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4a9fdb] to-[#2f6fa8] shrink-0">
              <Package className="w-4.5 h-4.5 text-white" strokeWidth={2.25} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight truncate whitespace-nowrap text-white">
              Store
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md text-[#5b7699] hover:text-[#c9d8ec] hover:bg-white/5 transition-colors flex-shrink-0 ml-auto lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {/* Main Navigation */}
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (!isDesktop) setSidebarOpen(false);
                }}
                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-[#4a9fdb]/10 text-[#7fc4ea]"
                    : "text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#4a9fdb]" />
                )}
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${
                    isActive ? "text-[#4a9fdb]" : "text-[#7f97b8]"
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.9}
                />
                {showLabels && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}

          {/* Divider */}
          <div className="pt-3 mt-3 border-t border-[#16304f]/80" />

          {/* Bottom Navigation - Reports & Charts only (Stock removed - already in navItems) */}
          <div className="space-y-0.5">
            <RouterLink
              to="/reports"
              onClick={() => !isDesktop && setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04] transition-colors"
            >
              <FileSpreadsheet
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.9}
              />
              {showLabels && <span className="truncate">Reports</span>}
            </RouterLink>
            <RouterLink
              to="/charts"
              onClick={() => !isDesktop && setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#c9d8ec] hover:bg-white/[0.04] transition-colors"
            >
              <BarChart3
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.9}
              />
              {showLabels && <span className="truncate">Charts</span>}
            </RouterLink>
          </div>
        </nav>

        <div className="p-2.5 border-t border-[#16304f]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#7f97b8] hover:text-[#e0708f] hover:bg-[#c23e8f]/10 transition-colors"
          >
            <LogOut
              className="w-[18px] h-[18px] flex-shrink-0"
              strokeWidth={1.9}
            />
            {showLabels && <span className="truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,rgba(74,159,219,0.06),transparent_55%)] min-h-screen">
        {/* Hamburger Menu - Mobile Only */}
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-[#0c2038] border border-[#16304f] text-[#7f97b8] hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-4 sm:space-y-5 max-w-[1400px] pt-12 lg:pt-0">
            <DashboardHeader
              title="Store Dashboard"
              subtitle="Live stock overview"
            />

            <StatsCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              <Panel>
                <Eyebrow right="29-day timeline">EXPIRY TIMELINE</Eyebrow>
                <div className="flex flex-wrap items-end gap-2.5 mb-3">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#e8eef7]">
                    {trend.days.reduce((s, d) => s + d.count, 0)}
                  </span>
                  <span className="mb-0.5 text-[10px] sm:text-xs px-2 py-1 rounded-md bg-[#c23e8f]/12 text-[#e05fae] font-medium">
                    {stats.expiringSoon} due in 3 days
                  </span>
                </div>
                <TrendChart data={trend.days} max={trend.max} />
              </Panel>

              <Panel>
                <Eyebrow right="All stock">STOCK STATUS</Eyebrow>
                <div className="flex justify-center items-center py-2">
                  <StatusDonut data={statusDonut} />
                </div>
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <div className="max-w-[1400px] pt-12 lg:pt-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e8eef7]">
                  Stock Overview
                </h1>
                <p className="text-xs sm:text-sm mt-1 text-[#7f97b8]">
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
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pr-1 pb-3 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 240px)" }}
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
                    className="rounded-xl p-3.5 bg-[#0f2540] border border-[#1c3a5e] hover:border-[#2c5581] transition-colors duration-150"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm text-[#e8eef7] truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs mt-0.5 text-[#7f97b8]">
                          {item.category || "Uncategorized"}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md ${chipClasses}`}
                      >
                        {statusText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#1c3a5e]/60 text-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#5b7699]">Qty</span>
                        <span className="text-[#e8eef7] font-medium text-xs">
                          {item.quantity || 0}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#5b7699]">
                          Price
                        </span>
                        <span className="text-[#e8eef7] font-medium text-xs">
                          ${item.price || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-[#5b7699]">
                          {days < 0 ? "Overdue" : "Left"}
                        </span>
                        <span
                          className="font-medium text-xs"
                          style={{ color: accent }}
                        >
                          {days < 0 ? `${Math.abs(days)}d` : `${days}d`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRelease(item._id)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 bg-[#3ecf8e]/12 text-[#3ecf8e] border border-[#3ecf8e]/25 hover:bg-[#3ecf8e]/20 transition-colors flex-shrink-0"
                      >
                        <CheckCircle className="w-3 h-3" /> Release
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length === 0 && (
              <div className="rounded-xl p-10 sm:p-14 text-center bg-[#0f2540] border border-dashed border-[#1c3a5e]">
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
          <div className="pt-12 lg:pt-0">
            <ExpiredView items={items} onRelease={handleRelease} />
          </div>
        )}

        {activeTab === "bulk" && (
          <div className="max-w-[900px] pt-12 lg:pt-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#e8eef7]">
              Bulk Add Items
            </h1>
            <p className="text-xs sm:text-sm mt-1.5 text-[#7f97b8]">
              Paste items manually in the format: Name, Category, ExpiryDate,
              Quantity, Price
            </p>

            <div className="mt-4 sm:mt-5 p-4 sm:p-5 rounded-xl bg-[#0f2540] border border-[#1c3a5e]">
              <textarea
                rows="10"
                value={bulkItems}
                onChange={(e) => setBulkItems(e.target.value)}
                placeholder="Milk, Dairy, 2026-09-15, 10, 4.99&#10;Bread, Bakery, 2026-08-30, 5, 2.49"
                className="w-full p-3 sm:p-3.5 rounded-lg text-xs sm:text-sm font-mono leading-relaxed bg-[#0a1a2f] text-[#e8eef7] border border-[#1c3a5e] outline-none focus:border-[#4a9fdb] transition-colors resize-y"
              />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
                <button
                  onClick={handleBulkAdd}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-medium bg-[#4a9fdb] text-white rounded-lg hover:bg-[#3d8ec8] transition-colors hover:shadow-lg hover:shadow-[#4a9fdb]/30 cursor-pointer"
                >
                  Add All Items
                </button>
                {bulkMessage && (
                  <p className="text-sm text-[#3ecf8e] break-words">
                    {bulkMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="pt-12 lg:pt-0">
            <SettingsView />
          </div>
        )}
      </main>

      <AIChatbot
        onItemsExtracted={(items) => console.log("Items extracted:", items)}
      />
    </div>
  );
};

export default Dashboard;