import Panel from "./Panel";

const COLORS = {
  sub: "#7f97b8",
  text: "#e8eef7",
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Panel className="flex items-center gap-3">
    <div className="p-2 rounded-lg" style={{ background: `${color}22` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: COLORS.sub }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: COLORS.text }}>{value}</p>
    </div>
  </Panel>
);

export default StatCard;