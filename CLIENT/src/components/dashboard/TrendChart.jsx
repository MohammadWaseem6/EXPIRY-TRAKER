const TrendChart = ({ data, max }) => {
  // Safety check: if no data, don't render anything
  if (!data || data.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm p-4 text-center">No data to display</div>;
  }

  // Using 100x40 viewBox so it scales perfectly to any parent width
  const chartWidth = 100;
  const chartHeight = 40;
  const paddingX = 2;
  const baseY = 36;

  // Get the max value for scaling
  const maxVal = max || Math.max(1, ...data.map((d) => d.count));

  // Convert label strings to actual timestamps for exact spacing
  const times = data.map((d) => new Date(d.label).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  // Helper: Plot X based on exact date timeline (scaled to 0-100)
  const getX = (idx) => {
    if (times.length === 1) return chartWidth / 2;
    const t = times[idx];
    const ratio = (t - minTime) / (maxTime - minTime || 1);
    return ratio * (chartWidth - paddingX * 2) + paddingX;
  };

  const getY = (count) => {
    return baseY - (count / maxVal) * (chartHeight - 10);
  };

  const pts = data.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.count),
    label: d.label,
    count: d.count,
  }));

  // Generate a smooth curve using cubic bezier
  const linePath = pts.reduce((acc, pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[idx - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  // Area fill path (closes the curve at the bottom)
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

  return (
    <div className="w-full">
      <svg 
        viewBox="0 0 100 40" 
        preserveAspectRatio="none" 
        className="w-full h-24 sm:h-28 md:h-32"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="stop-color-[#4a9fdb]" />
            <stop offset="100%" className="stop-color-[#4a9fdb] stop-opacity-0" />
          </linearGradient>
        </defs>
        
        {/* Background gridlines for better readability */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1="0"
            y1={baseY - fraction * (chartHeight - 10)}
            x2="100"
            y2={baseY - fraction * (chartHeight - 10)}
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
        ))}

        <path d={areaPath} fill="url(#areaFill)" opacity="0.5" />
        <path d={linePath} className="fill-none stroke-[#4a9fdb]" strokeWidth="1.5" strokeLinecap="round" />

        {pts.map((pt, idx) => (
          <circle 
            key={idx} 
            cx={pt.x} 
            cy={pt.y} 
            r="1.5" 
            className="fill-[#4a9fdb]" 
          />
        ))}
      </svg>
      
      {/* Date labels below the SVG */}
      <div className="flex justify-between text-[8px] sm:text-[10px] mt-1 sm:mt-2 text-gray-500 dark:text-gray-400">
        {pts.map((pt, idx) => {
          // Show first, last, and every 5th point to prevent overlapping
          if (idx === 0 || idx === pts.length - 1 || idx % 5 === 0) {
            return (
              <span key={idx} className="truncate max-w-[30px] sm:max-w-[60px]">
                {pt.label}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default TrendChart;