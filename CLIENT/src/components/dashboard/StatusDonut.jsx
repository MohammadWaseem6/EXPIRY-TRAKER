import Donut from "./Donut";

const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
};

const StatusDonut = ({ data }) => {
  return (
    <div className="flex items-center gap-4">
      <Donut data={data} centerValue={data.reduce((s, d) => s + d.value, 0)} centerLabel="Total" />
      <div className="flex flex-col gap-2">
        {data.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span style={{ color: COLORS.text }}>{s.name}</span>
            <span style={{ color: COLORS.sub }}>{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDonut;