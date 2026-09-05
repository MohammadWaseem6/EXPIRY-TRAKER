import Donut from "./Donut";

const StatusDonut = ({ data }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-2 sm:p-0">
      {/* Donut Chart */}
      <div className="flex-shrink-0">
        <Donut 
          data={data} 
          centerValue={data.reduce((s, d) => s + d.value, 0)} 
          centerLabel="Total" 
        />
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap sm:flex-nowrap flex-col gap-1.5 sm:gap-2 w-full sm:w-auto max-h-40 sm:max-h-48 overflow-y-auto px-2 sm:px-0">
        {data.map((s) => (
          <div 
            key={s.name} 
            className="flex items-center gap-2 text-[10px] sm:text-xs hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1 py-0.5 transition-colors"
          >
            <span 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
              style={{ background: s.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60px] sm:max-w-[80px]">
              {s.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium ml-auto sm:ml-0">
              {s.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDonut;