import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const StatsCards = ({ stats }) => {
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                {card.label}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
                {card.value}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500">
                  Current stock
                </span>
              </div>
            </div>

            {/* Icon container with dynamic colors */}
            <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${card.color}`}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;