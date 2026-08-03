import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../api/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  ShoppingBag,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Eye,
  MoreVertical,
  LayoutDashboard,
} from "lucide-react";

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "",
    category: "",
    expiryDate: "",
    purchaseDate: "",
    price: "",
    isAllergen: false,
  });
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Fetch items
  useEffect(() => {
    if (token) {
      apiClient.getItems(token).then((data) => {
        if (Array.isArray(data)) setItems(data);
      });
    }
  }, [token]);

  // Categories
  const categories = ["All", ...new Set(items.map((item) => item.category))];

  // Stats
  const totalItems = items.length;
  const expiringSoon = items.filter((item) => {
    const days = Math.ceil(
      (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return days >= 0 && days <= 3;
  }).length;
  const expired = items.filter((item) => {
    return new Date(item.expiryDate) < new Date();
  }).length;
  const fresh = totalItems - expiringSoon - expired;
  const totalValue = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0,
  );

  // Favorite toggle
  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Category data for charts
  const categoryData = categories
    .filter((cat) => cat !== "All")
    .map((cat) => ({
      name: cat,
      count: items.filter((item) => item.category === cat).length,
    }));

  // Status data for pie chart
  const statusData = [
    { name: "Fresh", value: fresh, color: "#22c55e" },
    { name: "Expiring Soon", value: expiringSoon, color: "#f59e0b" },
    { name: "Expired", value: expired, color: "#ef4444" },
  ].filter((d) => d.value > 0);
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  // Weekly data for line chart
  const weeklyData = [
    { name: "Mon", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Tue", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Wed", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Thu", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Fri", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Sat", items: Math.floor(Math.random() * 10) + 2 },
    { name: "Sun", items: Math.floor(Math.random() * 10) + 2 },
  ];

  // Add item handler (now includes price)
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const data = await apiClient.createItem(token, itemForm);
      if (data.item) {
        setMessage("✅ Item added!");
        setItemForm({
          name: "",
          category: "",
          expiryDate: "",
          purchaseDate: "",
          price: "",
          isAllergen: false,
        });
        const updatedItems = await apiClient.getItems(token);
        setItems(updatedItems);
        setShowAddForm(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to add");
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  const handleDeleteItem = async (itemId) => {
    await apiClient.deleteItem(token, itemId);
    setItems(items.filter((item) => item._id !== itemId));
  };

  // Handlers for dropdown actions
  const handleMarkUsed = (itemId) => {
    handleDeleteItem(itemId);
    setActiveDropdown(null);
  };

  const handleEditItem = (item) => {
    alert(`Edit item: ${item.name}`);
    setActiveDropdown(null);
  };

  // Recent items (last 4)
  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Team members (simulate – show names from items)
  const teamMembers = items.slice(0, 5).map((item) => ({
    name: item.addedBy?.name || "Unknown",
    initials: item.addedBy?.name?.charAt(0) || "U",
    items: 1,
  }));

  return (
    <div className="flex h-screen bg-dashboard">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-500 border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <span className="text-2xl"></span>
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">Expiry</h1>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
              Main
            </div>
          )}
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 ${!sidebarOpen && "justify-center"}`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            {sidebarOpen && "Dashboard"}
          </a>
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <Package className="w-4 h-4 mr-3" />
            {sidebarOpen && "Items"}
          </a>
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <ShoppingBag className="w-4 h-4 mr-3" />
            {sidebarOpen && "Orders"}
          </a>
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <Users className="w-4 h-4 mr-3" />
            {sidebarOpen && "Team"}
          </a>
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <Star className="w-4 h-4 mr-3" />
            {sidebarOpen && "Favorites"}
          </a>

          {sidebarOpen && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">
              Other
            </div>
          )}
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <Calendar className="w-4 h-4 mr-3" />
            {sidebarOpen && "Calendar"}
          </a>
          <a
            href="#"
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 ${!sidebarOpen && "justify-center"}`}
          >
            <Settings className="w-4 h-4 mr-3" />
            {sidebarOpen && "Settings"}
          </a>
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">© 2026 Expiry Tracker</p>
          </div>
        )}
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ===== TOP BAR ===== */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">
                eCommerce Dashboard
              </h2>
              <span className="text-sm text-gray-400">Home - Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-48"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "admin@company.com"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* ===== STATS CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {totalItems}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">
                      +12% this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Fresh Items</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {fresh}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">+2.6%</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-2xl font-bold text-orange-500 mt-1">
                    {expiringSoon}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-500">
                      Needs attention
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">
                    {expired}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-500">Need disposal</span>
                  </div>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ===== CHARTS + EXTRA WIDGETS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Items Added This Week
                  </h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {weeklyData.reduce((sum, d) => sum + d.items, 0)}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      total items
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-full">
                    ↑ 2.2%
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="items"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart + Total Value */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Item Status
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <DollarSign className="w-4 h-4" />
                  <span>${totalValue.toFixed(0)} total</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    ></span>
                    <span className="text-xs text-gray-600">
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== TEAM + FAVORITES + RECENT ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Team Members (Users icon) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">
                  Team Members
                </h3>
              </div>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No team members
                </p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                        {member.initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {member.items} items
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites (Star icon) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-medium text-gray-700">
                  Favorite Items
                </h3>
                <span className="ml-auto text-xs text-gray-400">
                  {favorites.length}
                </span>
              </div>
              {favorites.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No favorites yet. Star an item!
                </p>
              ) : (
                <div className="space-y-2">
                  {items
                    .filter((item) => favorites.includes(item._id))
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.category}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Calendar (expiry soon) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">
                  Upcoming Expiries
                </h3>
              </div>
              {items.filter((i) => {
                const days = Math.ceil(
                  (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
                );
                return days >= 0 && days <= 7;
              }).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No expiries this week 🎉
                </p>
              ) : (
                <div className="space-y-2">
                  {items
                    .filter((i) => {
                      const days = Math.ceil(
                        (new Date(i.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24),
                      );
                      return days >= 0 && days <= 7;
                    })
                    .sort(
                      (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
                    )
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between border-b border-gray-100 pb-1"
                      >
                        <span className="text-sm text-gray-700">
                          {item.name}
                        </span>
                        <span className="text-xs text-orange-500 font-medium">
                          {Math.ceil(
                            (new Date(item.expiryDate) - new Date()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* ===== RECENT ITEMS TABLE ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Recent Items
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">View All</span>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-blue-600 font-medium">
                  Export
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Item
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Category
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Expiry
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Status
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-gray-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-gray-400"
                      >
                        No items yet
                      </td>
                    </tr>
                  ) : (
                    recentItems.map((item) => {
                      const days = Math.ceil(
                        (new Date(item.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24),
                      );
                      let status = "Fresh";
                      let statusColor = "text-green-500 bg-green-50";
                      if (days < 0) {
                        status = "Expired";
                        statusColor = "text-red-500 bg-red-50";
                      } else if (days <= 3) {
                        status = "Expiring Soon";
                        statusColor = "text-orange-500 bg-orange-50";
                      }

                      const isFavorite = favorites.includes(item._id);

                      return (
                        <tr
                          key={item._id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition"
                        >
                          <td className="py-3 px-3 font-medium text-gray-700 flex items-center gap-2">
                            {item.name}
                            <button
                              onClick={() => toggleFavorite(item._id)}
                              className="text-gray-300 hover:text-yellow-400 transition"
                            >
                              <Star
                                className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`}
                              />
                            </button>
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            {item.category}
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            ${item.price || "0"}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${statusColor}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDetailModal(true);
                                }}
                                className="text-gray-400 hover:text-blue-500 transition"
                                title="Quick View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setActiveDropdown(
                                      activeDropdown === item._id
                                        ? null
                                        : item._id,
                                    )
                                  }
                                  className="text-gray-400 hover:text-gray-600 transition"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {activeDropdown === item._id && (
                                  <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    <button
                                      onClick={() => handleEditItem(item)}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                      ✏️ Edit
                                    </button>
                                    <button
                                      onClick={() => handleMarkUsed(item._id)}
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                      ✅ Mark Used
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDeleteItem(item._id);
                                        setActiveDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===== QUICK ADD (ShoppingBag icon) ===== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Inventory Actions
                  </h3>
                  <p className="text-xs text-gray-400">
                    Add items or view order history
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Add New Item
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm">
                  <ShoppingBag className="w-4 h-4" /> Order History
                </button>
              </div>
            </div>
          </div>

          {/* ===== ADD ITEM MODAL ===== */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Item name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={itemForm.category}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, category: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="date"
                    name="expiryDate"
                    value={itemForm.expiryDate}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, expiryDate: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="date"
                    name="purchaseDate"
                    value={itemForm.purchaseDate}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, purchaseDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price ($)"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isAllergen"
                      checked={itemForm.isAllergen}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          isAllergen: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    Contains allergens?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Add Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                  {message && (
                    <p className="text-sm text-green-600">{message}</p>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* ===== DETAIL MODAL (Eye icon) ===== */}
          {showDetailModal && selectedItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedItem.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedItem(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {selectedItem.category}
                  </p>
                  <p>
                    <span className="font-medium">Expiry:</span>{" "}
                    {new Date(selectedItem.expiryDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Purchased:</span>{" "}
                    {selectedItem.purchaseDate
                      ? new Date(selectedItem.purchaseDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> $
                    {selectedItem.price || "0"}
                  </p>
                  <p>
                    <span className="font-medium">Allergen:</span>{" "}
                    {selectedItem.isAllergen ? "⚠️ Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {(() => {
                      const days = Math.ceil(
                        (new Date(selectedItem.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24),
                      );
                      if (days < 0)
                        return <span className="text-red-500">Expired</span>;
                      if (days <= 3)
                        return (
                          <span className="text-orange-500">Expiring Soon</span>
                        );
                      return <span className="text-green-500">Fresh</span>;
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
                  }}
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
