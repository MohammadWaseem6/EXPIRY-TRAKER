const Panel = ({ children, className = "" }) => (
  <div
    className={`rounded-xl p-5 ${className}`}
    style={{
      background: "#0f2540",
      border: "1px solid #1c3a5e",
    }}
  >
    {children}
  </div>
);

export default Panel;