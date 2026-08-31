const SCALE = ["#bfe8f5", "#7fc4ea", "#4a9fdb", "#3d6fc9", "#7b4fb0", "#c23e8f"];
const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
};

const Heatmap = ({ data, buckets, max }) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: `90px repeat(${buckets.length}, 1fr)`, gap: "4px" }}>
      <div />
      {buckets.map((b) => (
        <div key={b} className="text-[10px] text-center" style={{ color: COLORS.sub }}>{b}</div>
      ))}
      {data.map(({ cat, row }) => (
        <>
          <div key={cat} className="text-[11px] flex items-center truncate" style={{ color: COLORS.text }}>{cat}</div>
          {row.map((val, ci) => {
            const intensity = val / max;
            const colorIdx = Math.min(SCALE.length - 1, Math.floor(intensity * (SCALE.length - 1)));
            return (
              <div
                key={`${cat}-${ci}`}
                className="rounded flex items-center justify-center text-[10px] font-semibold"
                style={{
                  background: val === 0 ? "#12294a" : SCALE[colorIdx],
                  color: intensity > 0.5 ? "#fff" : "#0a1a2f",
                  height: "28px",
                }}
              >
                {val > 0 ? val : ""}
              </div>
            );
          })}
        </>
      ))}
      <div className="col-span-full flex items-center gap-2 mt-4">
        <span className="text-[10px]" style={{ color: COLORS.sub }}>Low</span>
        <div className="flex-1 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${SCALE.join(",")})` }} />
        <span className="text-[10px]" style={{ color: COLORS.sub }}>High</span>
      </div>
    </div>
  );
};

export default Heatmap;