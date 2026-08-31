import { Package, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";

const COLORS = {
  panel: "#0f2540",
  panelBorder: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  success: "#3ecf8e",
  warning: "#f0a63a",
  danger: "#c23e8f",
  active: "#4a9fdb",
};

const StatsCards = ({ stats }) => {
  const cards = [
    { label: "Total Items", value: stats.totalItems, icon: Package, color: COLORS.active },
    { label: "Fresh", value: stats.fresh, icon: CheckCircle, color: COLORS.success },
    { label: "Expiring Soon", value: stats.expiringSoon, icon: Clock, color: COLORS.warning },
    { label: "Expired", value: stats.expired, icon: AlertCircle, color: COLORS.danger },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs" style={{ color: COLORS.sub }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12% this month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: `${card.color}22` }}>
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;