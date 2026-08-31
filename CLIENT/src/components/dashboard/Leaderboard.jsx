import { CheckCircle, XCircle } from "lucide-react";

const COLORS = {
  panelBorder: "#1c3a5e",
  grid: "#1c3a5e",
  text: "#e8eef7",
  sub: "#7f97b8",
  danger: "#c23e8f",
  warning: "#f0a63a",
  success: "#3ecf8e",
};

const Leaderboard = ({ data }) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: `1px solid ${COLORS.panelBorder}` }}>
          <th className="text-left py-2 text-[10px] font-medium uppercase" style={{ color: COLORS.sub }}>#</th>
          <th className="text-left py-2 text-[10px] font-medium uppercase" style={{ color: COLORS.sub }}>Item</th>
          <th className="text-left py-2 text-[10px] font-medium uppercase" style={{ color: COLORS.sub }}>Qty</th>
          <th className="text-left py-2 text-[10px] font-medium uppercase" style={{ color: COLORS.sub }}>Days Left</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} style={{ borderBottom: `1px solid ${COLORS.grid}` }}>
            <td className="py-2" style={{ color: COLORS.sub }}>{idx + 1}</td>
            <td className="py-2 font-medium" style={{ color: COLORS.text }}>{row.name}</td>
            <td className="py-2" style={{ color: COLORS.sub }}>{row.qty}</td>
            <td className="py-2">
              <span
                className="text-xs font-medium flex items-center gap-1"
                style={{
                  color: row.daysLeft < 0 ? COLORS.danger : row.daysLeft <= 3 ? COLORS.warning : COLORS.success,
                }}
              >
                {row.daysLeft < 0 ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                {row.daysLeft < 0 ? `${Math.abs(row.daysLeft)}d overdue` : `${row.daysLeft}d`}
              </span>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={4} className="py-4 text-center text-xs" style={{ color: COLORS.sub }}>No items yet</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Leaderboard;