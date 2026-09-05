const StockHealth = ({ percentage }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="w-full sm:w-auto">
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Stock Health
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
          {percentage}%
        </p>
      </div>
      <div className="w-full sm:w-1/2">
        <div className="flex justify-between text-[10px] sm:text-xs mb-1 text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>Goal: 100%</span>
        </div>
        
        {/* Outer Track */}
        <div className="w-full h-2 sm:h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          
          {/* Inner Fill - dynamic width */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-400 to-purple-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StockHealth;