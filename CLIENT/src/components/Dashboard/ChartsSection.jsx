import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign } from "lucide-react";

const ChartsSection = ({ items, selectedCategory }) => {
  const totalItems = items.length;
  const expiringSoon = items.filter((item) => {
    const days = Math.ceil(
      (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return days >= 0 && days <= 3;
  }).length;
  const expired = items.filter(
    (item) => new Date(item.expiryDate) < new Date(),
  ).length;
  const fresh = totalItems - expiringSoon - expired;
  const totalValue = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0,
  );

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const categoryData = categories
    .filter((cat) => cat !== "All")
    .map((cat) => ({
      name: cat,
      count: items.filter((item) => item.category === cat).length,
      fill: cat === selectedCategory ? "#3b82f6" : "#93c5fd",
    }));

  const statusData = [
    { name: "Fresh", value: fresh, color: "#22c55e" },
    { name: "Expiring Soon", value: expiringSoon, color: "#f59e0b" },
    { name: "Expired", value: expired, color: "#ef4444" },
  ].filter((d) => d.value > 0);
  const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            Items by Category
          </h3>
          <span className="text-xs text-gray-400">
            Click a category in sidebar
          </span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Item Status</h3>
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
  );
};

export default ChartsSection;
