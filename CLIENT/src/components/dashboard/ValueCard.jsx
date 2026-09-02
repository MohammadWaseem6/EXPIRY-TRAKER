import { DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";

const ValueCard = ({ title, value, icon: Icon, subtext, trend }) => {
  return (
    <div className="p-4 rounded-xl bg-custom-panel border border-custom-border">
      <p className="text-xs text-custom-sub">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Icon className="w-4 h-4 text-custom-active" />
        <span className="text-2xl font-bold text-custom-text">{value}</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {trend && trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : trend && trend < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-400" />
        ) : null}
        <span className="text-xs text-custom-sub">{subtext}</span>
      </div>
    </div>
  );
};

export default ValueCard;