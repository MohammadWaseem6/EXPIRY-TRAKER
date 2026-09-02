import Panel from "./Panel";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Panel className="flex items-center gap-3">
    {/* Using arbitrary values for dynamic color */}
    <div className="p-2 rounded-lg" style={{ background: `${color}22` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-custom-sub">{label}</p>
      <p className="text-xl font-bold text-custom-text">{value}</p>
    </div>
  </Panel>
);

export default StatCard;
