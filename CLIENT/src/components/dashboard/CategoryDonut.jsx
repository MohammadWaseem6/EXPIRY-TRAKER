import Donut from "./Donut";

const COLORS = {
  text: "#e8eef7",
  sub: "#7f97b8",
};

const CategoryDonut = ({ data, totalCategories }) => {
  return (
    <div className="flex items-center gap-4">
      <Donut data={data} centerValue={totalCategories} centerLabel="Categories" />
      <div className="flex flex-col gap-2 overflow-hidden">
        {data.map((c) => (
          <div key={c.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
            <span className="truncate" style={{ color: COLORS.text, maxWidth: "110px" }}>{c.name}</span>
            <span style={{ color: COLORS.sub }}>{c.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonut;