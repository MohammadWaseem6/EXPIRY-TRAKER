import { DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";

const ValueCard = ({ title, value, icon: Icon, subtext, trend }) => {
  return (
    <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
        {title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {trend && trend > 0 ? (
          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 dark:text-green-400 flex-shrink-0" />
        ) : trend && trend < 0 ? (
          <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
        ) : null}
        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
          {subtext}
        </span>
      </div>
    </div>
  );
};

export default ValueCard;