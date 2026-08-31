const COLORS = {
  sub: "#7f97b8",
  text: "#e8eef7",
  grid: "#1c3a5e",
};

const StockHealth = ({ percentage }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.sub }}>Stock Health</p>
        <p className="text-2xl font-bold" style={{ color: COLORS.text }}>{percentage}%</p>
      </div>
      <div className="w-full md:w-1/2 mt-4 md:mt-0">
        <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.sub }}>
          <span>0%</span>
          <span>Goal: 100%</span>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: COLORS.grid }}>
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: "linear-gradient(90deg, #4a9fdb, #c23e8f)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StockHealth;