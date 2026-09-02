import { CheckCircle, XCircle } from "lucide-react";

const Leaderboard = ({ data }) => {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-custom-border">
          <th className="text-left py-2 text-[10px] font-medium uppercase text-custom-sub">
            #
          </th>
          <th className="text-left py-2 text-[10px] font-medium uppercase text-custom-sub">
            Item
          </th>
          <th className="text-left py-2 text-[10px] font-medium uppercase text-custom-sub">
            Qty
          </th>
          <th className="text-left py-2 text-[10px] font-medium uppercase text-custom-sub">
            Days Left
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => {
          // Determine the status color class based on days left
          const statusColorClass =
            row.daysLeft < 0
              ? "text-[#c23e8f]"
              : row.daysLeft <= 3
                ? "text-[#f0a63a]"
                : "text-[#3ecf8e]";

          return (
            <tr key={idx} className="border-b border-custom-border">
              <td className="py-2 text-custom-sub">{idx + 1}</td>
              <td className="py-2 font-medium text-custom-text">{row.name}</td>
              <td className="py-2 text-custom-sub">{row.qty}</td>
              <td className="py-2">
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${statusColorClass}`}
                >
                  {row.daysLeft < 0 ? (
                    <XCircle className="w-3 h-3" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  {row.daysLeft < 0
                    ? `${Math.abs(row.daysLeft)}d overdue`
                    : `${row.daysLeft}d`}
                </span>
              </td>
            </tr>
          );
        })}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={4}
              className="py-4 text-center text-xs text-custom-sub"
            >
              No items yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Leaderboard;
