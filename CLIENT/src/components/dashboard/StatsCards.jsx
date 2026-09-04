import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const StatsCards = ({ stats }) => {
  // Using Tailwind arbitrary values for the dynamic colors
  const cards = [
    {
      label: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "bg-[#4a9fdb]/10 text-[#4a9fdb]",
    },
    {
      label: "Fresh",
      value: stats.fresh,
      icon: CheckCircle,
      color: "bg-[#3ecf8e]/10 text-[#3ecf8e]",
    },
    {
      label: "Expiring Soon",
      value: stats.expiringSoon,
      icon: Clock,
      color: "bg-[#f0a63a]/10 text-[#f0a63a]",
    },
    {
      label: "Expired",
      value: stats.expired,
      icon: AlertCircle,
      color: "bg-[#c23e8f]/10 text-[#c23e8f]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4 bg-custom-panel border border-custom-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-custom-sub">{card.label}</p>
              <p className="text-2xl font-bold text-custom-text">
                {card.value}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-[#5b7699]">Current stock</span>
              </div>
            </div>

            {/* Dynamic background and icon color applied via classes */}
            <div className={`p-3 rounded-xl ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
