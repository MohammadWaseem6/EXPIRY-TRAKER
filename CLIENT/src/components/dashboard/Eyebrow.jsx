const Eyebrow = ({ children, right }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-xs font-semibold tracking-wider text-custom-sub">
      {children}
    </span>
    {right && <span className="text-xs text-custom-sub">{right}</span>}
  </div>
);

export default Eyebrow;