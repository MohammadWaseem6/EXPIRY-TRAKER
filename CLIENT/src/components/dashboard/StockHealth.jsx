const StockHealth = ({ percentage }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <p className="text-xs uppercase tracking-wider text-custom-sub">Stock Health</p>
        <p className="text-2xl font-bold text-custom-text">{percentage}%</p>
      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0">
        <div className="flex justify-between text-xs mb-1 text-custom-sub">
          <span>0%</span>
          <span>Goal: 100%</span>
        </div>
        
        {/* Outer Track: Replaced background with bg-custom-grid */}
        <div className="w-full h-2.5 rounded-full bg-custom-grid">
          
          {/* Inner Fill: Used arbitrary values for width and gradient */}
          <div
            className="h-2.5 rounded-full transition-all duration-500 bg-[linear-gradient(90deg,#4a9fdb,#c23e8f)]"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StockHealth;