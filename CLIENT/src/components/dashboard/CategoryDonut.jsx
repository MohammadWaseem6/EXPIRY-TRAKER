import Donut from "./Donut";

const CategoryDonut = ({ data, totalCategories }) => {
  return (
    <div className="flex items-center gap-4">
      <Donut data={data} centerValue={totalCategories} centerLabel="Categories" />
      <div className="flex flex-col gap-2 overflow-hidden">
        {data.map((c) => (
          <div key={c.name} className="flex items-center gap-2 text-xs">
            <span 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ background: c.color }} // LEAVE THIS ONE, because c.color is dynamic from the API!
            />
            <span className="truncate text-custom-text" style={{ maxWidth: "110px" }}>
              {c.name}
            </span>
            <span className="text-custom-sub">
              {c.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonut;