import Panel from "./Panel";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Panel className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
    {/* Icon container with dynamic color */}
    <div 
      className="p-2 sm:p-2.5 rounded-lg flex-shrink-0"
      style={{ background: `${color}22` }}
    >
      <Icon 
        className="w-4 h-4 sm:w-5 sm:h-5" 
        style={{ color }} 
      />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
        {label}
      </p>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
        {value}
      </p>
    </div>
  </Panel>
);

export default StatCard;