import { DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  active: "#4a9fdb",
  warning: "#f0a63a",
};

const ValueCard = ({ title, value, icon: Icon, subtext, trend }) => {
  return (
    <div className="p-4 rounded-xl" style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}>
      <p className="text-xs" style={{ color: COLORS.sub }}>{title}</p>
      <div className="flex items-center gap-2 mt-1">
        <Icon className="w-4 h-4" style={{ color: COLORS.active }} />
        <span className="text-2xl font-bold" style={{ color: COLORS.text }}>{value}</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        {trend && trend > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-400" />
        ) : trend && trend < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-400" />
        ) : null}
        <span className="text-xs" style={{ color: COLORS.sub }}>{subtext}</span>
      </div>
    </div>
  );
};

export default ValueCard;