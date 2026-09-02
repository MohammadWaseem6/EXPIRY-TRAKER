import Donut from "./Donut";

const StatusDonut = ({ data }) => {
  return (
    <div className="flex items-center gap-4">
      <Donut data={data} centerValue={data.reduce((s, d) => s + d.value, 0)} centerLabel="Total" />
      <div className="flex flex-col gap-2">
        {data.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            {/* Leave this inline style because s.color is dynamic */}
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            
            <span className="text-custom-text">{s.name}</span>
            <span className="text-custom-sub">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDonut;