import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const StatsCards = ({ items }) => {
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

  const cards = [
    { label: "Total Items", value: totalItems, color: "blue", icon: Package },
    { label: "Fresh Items", value: fresh, color: "green", icon: CheckCircle },
    {
      label: "Expiring Soon",
      value: expiringSoon,
      color: "orange",
      icon: Clock,
    },
    { label: "Expired", value: expired, color: "red", icon: AlertCircle },
  ];

  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {card.value}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12% this month</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${colorMap[card.color]}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
