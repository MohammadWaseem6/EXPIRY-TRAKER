const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
};

const TrendChart = ({ data, max }) => {
  const pts = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * 300 + 10;
    const y = 110 - (d.count / max) * 90;
    return `${x},${y}`;
  });
  const areaPts = `10,110 ${pts.join(" ")} 310,110`;

  return (
    <svg viewBox="0 0 320 120" className="w-full h-28 mt-2">
      <polygon points={areaPts} fill="url(#areaFill)" opacity="0.3" />
      <polyline points={pts.join(" ")} fill="none" stroke="#4a9fdb" strokeWidth="2.5" />
      {data.map((d, idx) => {
        const x = (idx / (data.length - 1)) * 300 + 10;
        const y = 110 - (d.count / max) * 90;
        return <circle key={idx} cx={x} cy={y} r="3" fill="#4a9fdb" />;
      })}
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a9fdb" />
          <stop offset="100%" stopColor="#4a9fdb" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default TrendChart;