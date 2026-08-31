const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
};

const Donut = ({ data, centerValue, centerLabel }) => {
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
      <text x="50%" y="47%" textAnchor="middle" fontSize="24" fontWeight="700" fill={COLORS.text}>
        {centerValue}
      </text>
      <text x="50%" y="60%" textAnchor="middle" fontSize="10" fill={COLORS.sub}>
        {centerLabel}
      </text>
    </svg>
  );
};

export default Donut;