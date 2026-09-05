import Donut from "./Donut";

const CategoryDonut = ({ data, totalCategories }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-0">
      {/* Donut Chart - Responsive sizing */}
      <div className="flex-shrink-0">
        <Donut data={data} centerValue={totalCategories} centerLabel="Categories" />
      </div>
      
      {/* Legend - Scrollable on mobile */}
      <div className="flex flex-wrap sm:flex-nowrap flex-col gap-1.5 sm:gap-2 w-full sm:w-auto max-h-48 sm:max-h-60 overflow-y-auto px-2 sm:px-0">
        {data.map((c) => (
          <div 
            key={c.name} 
            className="flex items-center gap-2 text-xs sm:text-sm hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
          >
            <span 
              className="w-3 h-3 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" 
              style={{ background: c.color }}
            />
            <span className="truncate text-gray-700 dark:text-gray-300 max-w-[80px] sm:max-w-[110px]">
              {c.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-auto sm:ml-0 font-medium">
              {c.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonut;