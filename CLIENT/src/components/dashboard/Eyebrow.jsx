const COLORS = {
  sub: "#7f97b8",
};

const Eyebrow = ({ children, right }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-xs font-semibold tracking-wider" style={{ color: COLORS.sub }}>
      {children}
    </span>
    {right && <span className="text-xs" style={{ color: COLORS.sub }}>{right}</span>}
  </div>
);

export default Eyebrow;