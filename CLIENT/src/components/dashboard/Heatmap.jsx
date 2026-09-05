import React from 'react';

const SCALE = ["#bfe8f5", "#7fc4ea", "#4a9fdb", "#3d6fc9", "#7b4fb0", "#c23e8f"];

const Heatmap = ({ data, buckets, max }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div 
        className="grid min-w-[300px] sm:min-w-[400px] md:min-w-[500px] gap-1 sm:gap-[4px] p-2 sm:p-0"
        style={{ 
          gridTemplateColumns: `70px sm:90px repeat(${buckets.length}, minmax(30px, 1fr))`
        }}
      >
        {/* Header */}
        <div className="text-[8px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400" />
        {buckets.map((b) => (
          <div key={b} className="text-[8px] sm:text-[10px] text-center text-gray-500 dark:text-gray-400 font-medium truncate">
            {b}
          </div>
        ))}

        {/* Data Rows */}
        {data.map(({ cat, row }) => (
          <React.Fragment key={cat}>
            <div className="text-[10px] sm:text-[11px] flex items-center truncate text-gray-700 dark:text-gray-300 font-medium pr-1 sm:pr-2">
              {cat}
            </div>
            {row.map((val, ci) => {
              const intensity = max > 0 ? val / max : 0;
              const colorIdx = Math.min(SCALE.length - 1, Math.floor(intensity * (SCALE.length - 1)));
              const bgColor = val === 0 ? "#1a1a2e" : SCALE[colorIdx];
              const textColor = intensity > 0.5 ? "#ffffff" : "#0a1a2f";
              
              return (
                <div
                  key={`${cat}-${ci}`}
                  className="rounded flex items-center justify-center text-[8px] sm:text-[10px] font-semibold transition-all duration-200 hover:scale-105 hover:z-10"
                  style={{
                    background: bgColor,
                    color: textColor,
                    height: "24px",
                    minWidth: "24px",
                  }}
                >
                  {val > 0 ? val : ""}
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {/* Legend */}
        <div className="col-span-full flex flex-col sm:flex-row items-center gap-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Low</span>
          <div 
            className="w-full sm:flex-1 h-2 rounded-full" 
            style={{ background: `linear-gradient(90deg, ${SCALE.join(",")})` }} 
          />
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">High</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;