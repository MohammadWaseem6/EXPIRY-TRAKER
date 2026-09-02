const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-5 bg-custom-panel border border-custom-border ${className}`}
  >
    {children}
  </div>
);

export default Panel;