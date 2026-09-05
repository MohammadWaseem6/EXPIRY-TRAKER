const Donut = ({ data, centerValue, centerLabel }) => {
  // Responsive sizing
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((seg, idx) => {
            const len = (seg.pct / 100) * c;
            const circle = (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return circle;
          })}
        </g>
        
        {/* Center Label */}
        <text 
          x="50%" 
          y="45%" 
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          className="fill-gray-800 dark:fill-white text-2xl"
        >
          {centerValue}
        </text>
        <text 
          x="50%" 
          y="58%" 
          textAnchor="middle"
          fontSize="10"
          className="fill-gray-500 dark:fill-gray-400 text-xs"
        >
          {centerLabel}
        </text>
      </svg>
    </div>
  );
};

export default Donut;